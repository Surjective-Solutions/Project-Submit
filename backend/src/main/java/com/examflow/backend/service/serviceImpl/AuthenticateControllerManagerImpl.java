package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.entity.AdminUser;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.entity.UserLoginAudit;
import com.examflow.backend.repository.AdminUserRepository;
import com.examflow.backend.repository.CashierRepository;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.repository.TutorRepository;
import com.examflow.backend.repository.UserLoginAuditRepository;
import com.examflow.backend.service.AuthenticateControllerManager;
import com.examflow.backend.service.RefreshTokenControllerManager;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuthenticateControllerManagerImpl implements AuthenticateControllerManager {

    private final BCryptPasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final CashierRepository cashierRepository;
    private final TutorRepository tutorRepository;
    private final AdminUserRepository adminUserRepository;
    private final JwtUtil jwtUtil;
    private final UserLoginAuditRepository userLoginAuditRepository;
    private final RefreshTokenControllerManager refreshTokenControllerManager;
    private final HttpServletRequest request;

    private static final int MAX_USER_AGENT_LENGTH = 512;

    @Autowired
    public AuthenticateControllerManagerImpl(StudentRepository studentRepository,
            JwtUtil jwtUtil,
            CashierRepository cashierRepository,
            TutorRepository tutorRepository,
            BCryptPasswordEncoder passwordEncoder,
            AdminUserRepository adminUserRepository,
            InstructorRepository instructorRepository,
            UserLoginAuditRepository userLoginAuditRepository,
            RefreshTokenControllerManager refreshTokenControllerManager,
            HttpServletRequest request) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.jwtUtil = jwtUtil;
        this.cashierRepository = cashierRepository;
        this.tutorRepository = tutorRepository;
        this.passwordEncoder = passwordEncoder;
        this.userLoginAuditRepository = userLoginAuditRepository;
        this.refreshTokenControllerManager = refreshTokenControllerManager;
        this.request = request;
    }

    @Override
    public LoginResponse login(String identifier, String password) {
        LoginResponse loginResponse = new LoginResponse();
        String role = "student";
        Student student = studentRepository.findByContactNumberAndStatus(identifier, 2);
        if (student != null) {
            if (passwordEncoder.matches(password, student.getFinalPassword())) {
                String token = jwtUtil.generateToken(student.getContactNumber(), role, student.getStudentSeq());
                System.out.println("Login successful");
                loginResponse.setToken(token);
                loginResponse.setRole(role);
                loginResponse.setIsSuccess(true);
                loginResponse.setMessage("Login Successfull");
                loginResponse.setIsFirstLogin(student.needsDeviceRegistration());
                recordLogin(student.getStudentSeq(), role, token);
                return loginResponse;
            } else {
                System.out.println("Invalid password");
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Invalid password");
                return loginResponse;
            }
        } else {
            student = studentRepository.findByEmailAndStatus(identifier, 2);
            if (student != null) {
                if (passwordEncoder.matches(password, student.getFinalPassword())) {
                    String token = jwtUtil.generateToken(student.getEmail(), role, student.getStudentSeq());
                    System.out.println("Login successful");
                    loginResponse.setToken(token);
                    loginResponse.setRole(role);
                    loginResponse.setIsSuccess(true);
                    loginResponse.setMessage("Login Successfull");
                    loginResponse.setIsFirstLogin(student.needsDeviceRegistration());
                    recordLogin(student.getStudentSeq(), role, token);
                    return loginResponse;
                } else {
                    System.out.println("Invalid password for email: " + identifier);
                    loginResponse.setIsSuccess(false);
                    loginResponse.setMessage("Invalid password");
                    return loginResponse;
                }
            } else if (isDisabledStudent(identifier, password)) {
                System.out.println("Disabled student tried to log in: " + identifier);
                loginResponse.setToken(null);
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Your account has been disabled. Please contact the institute.");
                return loginResponse;
            } else {
                System.out.println("Student not found with email: " + identifier);
                loginResponse.setToken(null);
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Student not found");
                return loginResponse;
            }
        }

    }

    // Only reports "disabled" once the password checks out, so it doesn't reveal more than a normal login does.
    private boolean isDisabledStudent(String identifier, String password) {
        Student student = studentRepository.findByContactNumberAndStatus(identifier, 1);
        if (student == null) {
            student = studentRepository.findByEmailAndStatus(identifier, 1);
        }
        return student != null && passwordEncoder.matches(password, student.getFinalPassword());
    }

    private void recordLogin(Integer userSeq, String role, String token) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null && userAgent.length() > MAX_USER_AGENT_LENGTH) {
            userAgent = userAgent.substring(0, MAX_USER_AGENT_LENGTH);
        }

        UserLoginAudit audit = new UserLoginAudit();
        audit.setUserSeq(userSeq);
        audit.setUserRole(role);
        audit.setLoginDateTime(LocalDateTime.now());
        audit.setJwtTokenHash(jwtUtil.hashToken(token));
        audit.setIpAddress(request.getRemoteAddr());
        audit.setUserAgent(userAgent);
        audit.setDeviceStatus(UserLoginAudit.DEVICE_PENDING);
        userLoginAuditRepository.save(audit);
    }

    @Override
    public LoginResponse loginInstrutor(String identifier, String password) {

        LoginResponse loginResponse = new LoginResponse();
        String role = "instructor";
        Instructor instructor = instructorRepository.findByContactNumberAndStatus(identifier, 2);
        if (instructor != null) {
            if (passwordEncoder.matches(password, instructor.getFinalPassword())) {
                String sessionId = refreshTokenControllerManager.issueRefreshToken(instructor.getInstructorSeq(), role, instructor.getContactNumber(), null);
                String token = jwtUtil.generateToken(instructor.getContactNumber(), role, instructor.getInstructorSeq(), sessionId);
                System.out.println("Login successful");
                loginResponse.setToken(token);
                loginResponse.setRole(role);
                loginResponse.setIsSuccess(true);
                loginResponse.setMessage("Login Successfull");
                return loginResponse;
            } else {
                System.out.println("Invalid password");
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Invalid password");
                return loginResponse;
            }
        } else {
            instructor = instructorRepository.findByEmailAndStatus(identifier, 2);
            if (instructor != null) {
                if (passwordEncoder.matches(password, instructor.getFinalPassword())) {
                    String sessionId = refreshTokenControllerManager.issueRefreshToken(instructor.getInstructorSeq(), role, instructor.getEmail(), null);
                    String token = jwtUtil.generateToken(instructor.getEmail(), role, instructor.getInstructorSeq(), sessionId);
                    System.out.println("Login successful");
                    loginResponse.setToken(token);
                    loginResponse.setRole(role);
                    loginResponse.setIsSuccess(true);
                    loginResponse.setMessage("Login Successfull");
                    return loginResponse;
                } else {
                    System.out.println("Invalid password for email: " + identifier);
                    loginResponse.setIsSuccess(false);
                    loginResponse.setMessage("Invalid password");
                    return loginResponse;
                }
            } else {
                System.out.println("Instructor not found with email: " + identifier);
                loginResponse.setToken(null);
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Instructor not found");
                return loginResponse;
            }
        }
    }

    @Override
    public LoginResponse loginAdmin(String identifier, String password) {
        LoginResponse loginResponse = new LoginResponse();
        String role = "admin";
        AdminUser adminUser = adminUserRepository.findByUserNameAndStatus(identifier, 2);
        if (adminUser != null) {
            if (passwordEncoder.matches(password, adminUser.getFinalPassword())) {
                String sessionId = refreshTokenControllerManager.issueRefreshToken(adminUser.getAdminUserSeq(), role, adminUser.getUserName(), null);
                String token = jwtUtil.generateToken(adminUser.getUserName(), role, adminUser.getAdminUserSeq(), sessionId);
                System.out.println("Login successful");
                loginResponse.setToken(token);
                loginResponse.setRole(role);
                loginResponse.setIsSuccess(true);
                loginResponse.setMessage("Login Successfull");
                return loginResponse;
            } else {
                System.out.println("Invalid password");
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Invalid password");
                return loginResponse;
            }
        } else {

            System.out.println("Admin not found with email: " + identifier);
            loginResponse.setToken(null);
            loginResponse.setIsSuccess(false);
            loginResponse.setMessage("Admin not found");
            return loginResponse;
        }

    }

    @Override
    public LoginResponse loginTutor(String username, String password) {
        LoginResponse loginResponse = new LoginResponse();
        String role = "tutor";
        Tutor tutorUser = tutorRepository.findByUserNameAndStatus(username, 2);
        if (tutorUser != null) {
            if (passwordEncoder.matches(password, tutorUser.getFinalPassword())) {
                String sessionId = refreshTokenControllerManager.issueRefreshToken(tutorUser.getTutorSeq(), role, tutorUser.getUserName(), null);
                String token = jwtUtil.generateToken(tutorUser.getUserName(), role, tutorUser.getTutorSeq(), sessionId);
                System.out.println("Login successful");
                loginResponse.setToken(token);
                loginResponse.setRole(role);
                loginResponse.setIsSuccess(true);
                loginResponse.setMessage("Login Successfull");
                return loginResponse;
            } else {
                System.out.println("Invalid password");
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Invalid password");
                return loginResponse;
            }
        } else {

            System.out.println("Teacher not found with email: " + username);
            loginResponse.setToken(null);
            loginResponse.setIsSuccess(false);
            loginResponse.setMessage("Teacher not found");
            return loginResponse;
        }
    }

    @Override
    public LoginResponse loginCashier(String username, String password) {

        LoginResponse loginResponse = new LoginResponse();
        String role = "cashier";
        Cashier cashierUser = cashierRepository.findByUserNameAndStatus(username, 2);
        if (cashierUser != null) {
            if (passwordEncoder.matches(password, cashierUser.getFinalPassword())) {
                String sessionId = refreshTokenControllerManager.issueRefreshToken(cashierUser.getCashierSeq(), role, cashierUser.getUserName(), null);
                String token = jwtUtil.generateToken(cashierUser.getUserName(), role, cashierUser.getCashierSeq(), sessionId);
                System.out.println("Login successful");
                loginResponse.setToken(token);
                loginResponse.setRole(role);
                loginResponse.setIsSuccess(true);
                loginResponse.setMessage("Login Successfull");
                return loginResponse;
            } else {
                System.out.println("Invalid password");
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Invalid password");
                return loginResponse;
            }
        } else {

            System.out.println("Cashier not found with email: " + username);
            loginResponse.setToken(null);
            loginResponse.setIsSuccess(false);
            loginResponse.setMessage("Cashier not found");
            return loginResponse;
        }
    }

}
