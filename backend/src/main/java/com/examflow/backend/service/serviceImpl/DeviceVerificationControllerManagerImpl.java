package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.DeviceVerifyResponse;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.UserLoginAudit;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.repository.UserLoginAuditRepository;
import com.examflow.backend.service.DeviceVerificationControllerManager;
import com.examflow.backend.service.RefreshTokenControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class DeviceVerificationControllerManagerImpl implements DeviceVerificationControllerManager {

    private static final String STUDENT_ROLE = "student";
    private static final int ACTIVE_STATUS = 2;
    private static final int INACTIVE_STATUS = 1;
    private static final int MAX_DEVICE_ID_LENGTH = 64;
    private static final String DISABLED_MESSAGE = "This account was used on another device and has been disabled. Please contact the institute.";

    private final StudentRepository studentRepository;
    private final UserLoginAuditRepository userLoginAuditRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenControllerManager refreshTokenControllerManager;
    private final HttpServletRequest request;

    @Autowired
    public DeviceVerificationControllerManagerImpl(StudentRepository studentRepository,
            UserLoginAuditRepository userLoginAuditRepository,
            JwtUtil jwtUtil,
            RefreshTokenControllerManager refreshTokenControllerManager,
            HttpServletRequest request) {
        this.studentRepository = studentRepository;
        this.userLoginAuditRepository = userLoginAuditRepository;
        this.jwtUtil = jwtUtil;
        this.refreshTokenControllerManager = refreshTokenControllerManager;
        this.request = request;
    }

    @Override
    @Transactional
    public DeviceVerifyResponse verifyDevice(String deviceId) {
        DeviceVerifyResponse response = new DeviceVerifyResponse();

        Integer userSeq = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userSeq == null || role == null) {
            response.setIsSuccess(false);
            response.setMessage("Not authenticated.");
            return response;
        }

        // only students are locked to a single device
        if (!STUDENT_ROLE.equals(role)) {
            response.setIsSuccess(true);
            response.setMessage("Device check not required.");
            return response;
        }

        Student student = studentRepository.findByStudentSeq(userSeq);
        if (student == null || student.getStatus() == null || student.getStatus() != ACTIVE_STATUS) {
            response.setIsSuccess(false);
            response.setMessage("Your account has been disabled. Please contact the institute.");
            return response;
        }

        String cleanDeviceId = normalizeDeviceId(deviceId);
        UserLoginAudit audit = findAuditForCurrentToken(userSeq, role);

        if (student.needsDeviceRegistration()) {
            // First login, or first login after an admin re-activated a blocked account: the
            // server always mints a brand-new id (whatever the browser sent is ignored), so an
            // old or copied id can never be re-registered.
            String newDeviceId = UUID.randomUUID().toString();
            student.setDeviceId(newDeviceId);
            student.setIsFirstLogin(false);
            studentRepository.save(student);
            updateAudit(audit, newDeviceId, UserLoginAudit.DEVICE_REGISTERED);
            response.setToken(startSession(userSeq, role, newDeviceId));

            response.setIsSuccess(true);
            response.setMessage("Device registered.");
            response.setDeviceId(newDeviceId);
            return response;
        }

        if (student.getDeviceId().equals(cleanDeviceId)) {
            updateAudit(audit, cleanDeviceId, UserLoginAudit.DEVICE_VERIFIED);
            response.setToken(startSession(userSeq, role, cleanDeviceId));
            response.setIsSuccess(true);
            response.setMessage("Device verified.");
            return response;
        }

        // A different (or missing) device id on an account that is already bound: disable it and
        // drop the binding, so when an admin re-activates it (status = 2) the next login registers
        // a fresh device id. The old id stays in user_login_audit for the record.
        student.setStatus(INACTIVE_STATUS);
        student.setDeviceId(null);
        student.setIsFirstLogin(true);
        studentRepository.save(student);
        refreshTokenControllerManager.revokeAllSessions(userSeq, role);
        updateAudit(audit, cleanDeviceId, UserLoginAudit.DEVICE_BLOCKED);
        System.out.println("Student " + userSeq + " disabled: logged in from unregistered device " + cleanDeviceId);

        response.setIsSuccess(false);
        response.setMessage(DISABLED_MESSAGE);
        return response;
    }

    // Students only get a session (refresh cookie + a JWT carrying the session id) once their device
    // checks out; the login token has no session and can't be used for anything but this check.
    private String startSession(Integer userSeq, String role, String deviceId) {
        String subject = (String) request.getAttribute("username");
        String sessionId = refreshTokenControllerManager.issueRefreshToken(userSeq, role, subject, deviceId);
        return jwtUtil.generateToken(subject, role, userSeq, sessionId);
    }

    private String normalizeDeviceId(String deviceId) {
        if (deviceId == null) {
            return null;
        }
        String trimmed = deviceId.trim();
        if (trimmed.isEmpty() || trimmed.length() > MAX_DEVICE_ID_LENGTH) {
            return null;
        }
        return trimmed;
    }

    private UserLoginAudit findAuditForCurrentToken(Integer userSeq, String role) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return userLoginAuditRepository.findFirstByUserSeqAndUserRoleAndJwtTokenHashOrderByUserLoginAuditSeqDesc(
                userSeq, role, jwtUtil.hashToken(authHeader.substring(7)));
    }

    private void updateAudit(UserLoginAudit audit, String deviceId, String deviceStatus) {
        // tokens issued before the audit table existed have no row to update
        if (audit == null) {
            return;
        }
        audit.setDeviceId(deviceId);
        audit.setDeviceStatus(deviceStatus);
        audit.setDeviceCheckedDateTime(LocalDateTime.now());
        userLoginAuditRepository.save(audit);
    }

}
