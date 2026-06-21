package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.config.JwtUtil;
import com.examflow.backend.dto.LoginRequest;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.service.AuthenticateControllerManager;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private final AuthenticateControllerManager authenticateControllerManager;

    private JwtUtil jwtUtil = new JwtUtil();

    @Autowired
    public AuthenticationController(AuthenticateControllerManager authenticateControllerManager) {
        this.authenticateControllerManager = authenticateControllerManager;
    }

    // @PostMapping("/student-login")
    // public LoginResponse login(@RequestBody LoginRequest request) {

    // LoginResponse loginResponse = new LoginResponse();

    // // String token = authService.login(request.getUsername(),
    // request.getPassword());

    // return loginResponse("token", "Login successful", "student", true);
    // }

    @PostMapping("/student-login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        System.out.println("reached to controller");
        LoginResponse loginResponse = authenticateControllerManager.login(request.getIdentifier(),
                request.getPassword());
        return loginResponse;
    }

}
