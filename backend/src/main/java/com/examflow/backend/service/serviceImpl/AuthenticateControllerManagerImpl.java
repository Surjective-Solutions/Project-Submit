package com.examflow.backend.service.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.entity.Student;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.AuthenticateControllerManager;

@Service
public class AuthenticateControllerManagerImpl implements AuthenticateControllerManager {

    private final BCryptPasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthenticateControllerManagerImpl(StudentRepository studentRepository, JwtUtil jwtUtil,
            BCryptPasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public LoginResponse login(String identifier, String password) {
        LoginResponse loginResponse = new LoginResponse();
        String role = "student";
        Student student = studentRepository.findByContactNumberAndStatus(identifier, 2);
        if (student != null) {
            if (passwordEncoder.matches(student.getFinalPassword(), password)) {
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
                if (passwordEncoder.matches(student.getFinalPassword(), password)) {
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

}
