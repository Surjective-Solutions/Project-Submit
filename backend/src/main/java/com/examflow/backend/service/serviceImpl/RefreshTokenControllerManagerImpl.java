package com.examflow.backend.service.serviceImpl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.entity.AdminUser;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.RefreshToken;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.AdminUserRepository;
import com.examflow.backend.repository.CashierRepository;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.RefreshTokenRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.service.RefreshTokenControllerManager;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class RefreshTokenControllerManagerImpl implements RefreshTokenControllerManager {

    private static final Set<String> ROLES = Set.of("student", "instructor", "tutor", "cashier", "admin");
    private static final String COOKIE_PREFIX = "refresh_token_";
    private static final String COOKIE_PATH = "/api/auth";
    private static final int ACTIVE_USER_STATUS = 2;
    // Two tabs refreshing at the same moment both send the same token. Only a reuse after this
    // window is treated as a copied token.
    private static final long ROTATION_GRACE_SECONDS = 60;
    private static final String SESSION_ENDED_MESSAGE = "Session expired. Please log in again.";
    private static final String PASSWORD_RESET_MESSAGE =
        "Your password was reset by an administrator. Please sign in again.";
    private static final String ACCOUNT_DEACTIVATED_MESSAGE = 
        "Your account has been deactivated by an admin.";
    private final SecureRandom secureRandom = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final StudentRepository studentRepository;
    private final TutorRepository tutorRepository;
    private final InstructorRepository instructorRepository;
    private final CashierRepository cashierRepository;
    private final AdminUserRepository adminUserRepository;
    private final JwtUtil jwtUtil;
    private final HttpServletRequest request;
    private final HttpServletResponse response;

    // hard cap on one login session, no matter how often it refreshes
    @Value("${app.auth.refresh-token-hours:24}")
    private long refreshTokenHours;

    @Value("${app.auth.refresh-cookie-secure:false}")
    private boolean refreshCookieSecure;

    @Autowired
    public RefreshTokenControllerManagerImpl(RefreshTokenRepository refreshTokenRepository,
            StudentRepository studentRepository,
            TutorRepository tutorRepository,
            InstructorRepository instructorRepository,
            CashierRepository cashierRepository,
            AdminUserRepository adminUserRepository,
            JwtUtil jwtUtil,
            HttpServletRequest request,
            HttpServletResponse response) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.studentRepository = studentRepository;
        this.tutorRepository = tutorRepository;
        this.instructorRepository = instructorRepository;
        this.cashierRepository = cashierRepository;
        this.adminUserRepository = adminUserRepository;
        this.jwtUtil = jwtUtil;
        this.request = request;
        this.response = response;
    }

    @Override
    @Transactional
    public String issueRefreshToken(Integer userSeq, String role, String subject, String deviceId) {
        LocalDateTime now = LocalDateTime.now();

        // A new login replaces the session this browser already had for the role (logging in again
        // without logging out). Students are locked to one device, so any other session of theirs
        // is stale too.
        if ("student".equals(role)) {
            revokeUserSessions(userSeq, role, now);
        } else {
            revokeSessionFromCookie(role, now);
        }

        String sessionId = UUID.randomUUID().toString();
        String rawToken = saveToken(userSeq, role, subject, deviceId, sessionId,
                now.plusHours(refreshTokenHours), now);
        writeCookie(role, rawToken);
        return sessionId;
    }

    @Override
    @Transactional
    public LoginResponse refresh(String role) {
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setIsSuccess(false);
        loginResponse.setMessage(SESSION_ENDED_MESSAGE);

        if (!isKnownRole(role)) {
            return loginResponse;
        }

        String rawToken = readCookie(role);
        if (rawToken == null) {
            return loginResponse;
        }

        LocalDateTime now = LocalDateTime.now();
        RefreshToken current = refreshTokenRepository.findByTokenHash(jwtUtil.hashToken(rawToken));
        if (current == null || !role.equals(current.getUserRole())) {
            clearCookie(role);
            return loginResponse;
        }

        if (current.getStatus() == RefreshToken.STATUS_ROTATED) {
            boolean concurrentRefresh = current.getRotatedDateTime() != null
                    && current.getRotatedDateTime().plusSeconds(ROTATION_GRACE_SECONDS).isAfter(now);
            if (!concurrentRefresh) {
                // An already-used token came back: someone copied it. End the whole session.
                System.out.println("Refresh token reuse detected, revoking session " + current.getFamilyId());
                revokeFamily(current.getFamilyId(), now);
                clearCookie(role);
                return loginResponse;
            }
        } else if (current.getStatus() != RefreshToken.STATUS_ACTIVE) {
            if (RefreshToken.REASON_PASSWORD_RESET.equals(current.getRevokeReason())) {
                loginResponse.setReason(RefreshToken.REASON_PASSWORD_RESET);
                loginResponse.setMessage(PASSWORD_RESET_MESSAGE);
            } else if (RefreshToken.REASON_ACCOUNT_DEACTIVATED.equals(current.getRevokeReason())) {
                loginResponse.setReason(RefreshToken.REASON_ACCOUNT_DEACTIVATED);
                loginResponse.setMessage(ACCOUNT_DEACTIVATED_MESSAGE);
            }
            clearCookie(role);
            return loginResponse;
        }

        if (current.getExpiresDateTime().isBefore(now)) {
            revokeFamily(current.getFamilyId(), now);
            clearCookie(role);
            return loginResponse;
        }

        // account disabled, or (students) no longer bound to the device this session started on
        if (!isAccountStillAllowed(current)) {
            revokeFamily(current.getFamilyId(), now);
            clearCookie(role);
            return loginResponse;
        }

        if (current.getStatus() == RefreshToken.STATUS_ACTIVE) {
            current.setStatus(RefreshToken.STATUS_ROTATED);
            current.setRotatedDateTime(now);
            refreshTokenRepository.save(current);
        }

        // same family and same hard expiry as the token being replaced
        String newRawToken = saveToken(current.getUserSeq(), role, current.getSubject(), current.getDeviceId(),
                current.getFamilyId(), current.getExpiresDateTime(), now);
        writeCookie(role, newRawToken);

        loginResponse.setToken(jwtUtil.generateToken(current.getSubject(), role, current.getUserSeq(),
                current.getFamilyId()));
        loginResponse.setRole(role);
        loginResponse.setIsSuccess(true);
        loginResponse.setMessage("Session refreshed");
        return loginResponse;
    }

    @Override
    @Transactional
    public GeneralResponse logout(String role) {
        GeneralResponse generalResponse = new GeneralResponse();

        if (isKnownRole(role)) {
            revokeSessionFromCookie(role, LocalDateTime.now());
            clearCookie(role);
        }

        generalResponse.setIsSuccess(true);
        generalResponse.setMessage("Logged out");
        return generalResponse;
    }

    @Override
    @Transactional
    public void revokeAllSessions(Integer userSeq, String role) {
        revokeUserSessions(userSeq, role, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void revokeAllSessions(Integer userSeq, String role, String reason) {
        LocalDateTime now = LocalDateTime.now();
        List<RefreshToken> tokens = refreshTokenRepository
                .findByUserSeqAndUserRoleAndStatusNot(userSeq, role, RefreshToken.STATUS_REVOKED);
        for (RefreshToken token : tokens) {
            token.setStatus(RefreshToken.STATUS_REVOKED);
            token.setRevokedDateTime(now);
            token.setRevokeReason(reason);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    @Override
    @Transactional
    public void revokeExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<RefreshToken> expired = refreshTokenRepository.findByStatusNotAndExpiresDateTimeBefore(
                RefreshToken.STATUS_REVOKED, now);
        markRevoked(expired, now);
        if (!expired.isEmpty()) {
            System.out.println("Revoked " + expired.size() + " expired refresh token(s)");
        }
    }

    private void revokeSessionFromCookie(String role, LocalDateTime now) {
        String rawToken = readCookie(role);
        if (rawToken == null) {
            return;
        }
        RefreshToken token = refreshTokenRepository.findByTokenHash(jwtUtil.hashToken(rawToken));
        if (token != null && role.equals(token.getUserRole())) {
            revokeFamily(token.getFamilyId(), now);
        }
    }

    private void revokeUserSessions(Integer userSeq, String role, LocalDateTime now) {
        markRevoked(refreshTokenRepository.findByUserSeqAndUserRoleAndStatusNot(userSeq, role,
                RefreshToken.STATUS_REVOKED), now);
    }

    private boolean isKnownRole(String role) {
        return role != null && ROLES.contains(role);
    }

    private String saveToken(Integer userSeq, String role, String subject, String deviceId, String familyId,
            LocalDateTime expiresDateTime, LocalDateTime now) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserSeq(userSeq);
        refreshToken.setUserRole(role);
        refreshToken.setSubject(subject);
        refreshToken.setTokenHash(jwtUtil.hashToken(rawToken));
        refreshToken.setFamilyId(familyId);
        refreshToken.setDeviceId(deviceId);
        refreshToken.setStatus(RefreshToken.STATUS_ACTIVE);
        refreshToken.setCreatedDateTime(now);
        refreshToken.setExpiresDateTime(expiresDateTime);
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private boolean isAccountStillAllowed(RefreshToken token) {
        Integer userSeq = token.getUserSeq();
        switch (token.getUserRole()) {
            case "student":
                Student student = studentRepository.findByStudentSeq(userSeq);
                // also ends sessions on a device the student is no longer bound to
                return student != null && isActive(student.getStatus())
                        && student.getDeviceId() != null && student.getDeviceId().equals(token.getDeviceId());
            case "tutor":
                Tutor tutor = tutorRepository.findByTutorSeq(userSeq);
                return tutor != null && isActive(tutor.getStatus());
            case "instructor":
                Instructor instructor = instructorRepository.findByInstructorSeq(userSeq);
                return instructor != null && isActive(instructor.getStatus());
            case "cashier":
                Cashier cashier = cashierRepository.findByCashierSeq(userSeq);
                return cashier != null && isActive(cashier.getStatus());
            case "admin":
                AdminUser adminUser = adminUserRepository.findById(userSeq).orElse(null);
                return adminUser != null && isActive(adminUser.getStatus());
            default:
                return false;
        }
    }

    private boolean isActive(Integer status) {
        return status != null && status == ACTIVE_USER_STATUS;
    }

    private void revokeFamily(String familyId, LocalDateTime now) {
        markRevoked(refreshTokenRepository.findByFamilyIdAndStatusNot(familyId, RefreshToken.STATUS_REVOKED), now);
    }

    private void markRevoked(List<RefreshToken> tokens, LocalDateTime now) {
        for (RefreshToken token : tokens) {
            token.setStatus(RefreshToken.STATUS_REVOKED);
            token.setRevokedDateTime(now);
        }
        refreshTokenRepository.saveAll(tokens);
    }

    private String readCookie(String role) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if ((COOKIE_PREFIX + role).equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // No maxAge on purpose: it's a browser-session cookie, so closing the browser ends the login.
    // The row's expiresDateTime still caps the session at refreshTokenHours.
    private void writeCookie(String role, String value) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_PREFIX + role, value)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(String role) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_PREFIX + role, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
