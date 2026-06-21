package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.LoginResponse;

@Service
public interface AuthenticateControllerManager {

    LoginResponse login(String username, String password);
}
