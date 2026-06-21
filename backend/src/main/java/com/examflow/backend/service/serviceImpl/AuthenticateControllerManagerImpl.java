package com.examflow.backend.service.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.entity.AdminUser;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.AdminUserRepository;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.AuthenticateControllerManager;

@Service
public class AuthenticateControllerManagerImpl implements AuthenticateControllerManager {

    private final BCryptPasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final AdminUserRepository adminUserRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthenticateControllerManagerImpl(StudentRepository studentRepository,
            JwtUtil jwtUtil,
            BCryptPasswordEncoder passwordEncoder,
            AdminUserRepository adminUserRepository,
            InstructorRepository instructorRepository) {
        this.studentRepository = studentRepository;
        this.instructorRepository = instructorRepository;
        this.adminUserRepository = adminUserRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
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
                    return loginResponse;
                } else {
                    System.out.println("Invalid password for email: " + identifier);
                    loginResponse.setIsSuccess(false);
                    loginResponse.setMessage("Invalid password");
                    return loginResponse;
                }
            } else {
                System.out.println("Student not found with email: " + identifier);
                loginResponse.setToken(null);
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("Student not found");
                return loginResponse;
            }
        }

    }

    @Override
    public LoginResponse loginInstrutor(String identifier, String password) {

        LoginResponse loginResponse = new LoginResponse();
        String role = "intructor";
        Instructor instructor = instructorRepository.findByContactNumberAndStatus(identifier, 2);
        if (instructor != null) {
            if (passwordEncoder.matches(password, instructor.getFinalPassword())) {
                String token = jwtUtil.generateToken(instructor.getContactNumber(), role,
                        instructor.getInstructorSeq());
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
                    String token = jwtUtil.generateToken(instructor.getEmail(), role, instructor.getInstructorSeq());
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
                System.out.println("instructor not found with email: " + identifier);
                loginResponse.setToken(null);
                loginResponse.setIsSuccess(false);
                loginResponse.setMessage("instructor not found");
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
                String token = jwtUtil.generateToken(adminUser.getUserName(), role,
                        adminUser.getAdminUserSeq());
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

            System.out.println("instructor not found with email: " + identifier);
            loginResponse.setToken(null);
            loginResponse.setIsSuccess(false);
            loginResponse.setMessage("instructor not found");
            return loginResponse;
        }

    }

}
