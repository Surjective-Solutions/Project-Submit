package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.LoginResponse;
import com.examflow.backend.dto.RefreshRequest;
import com.examflow.backend.service.RefreshTokenControllerManager;

// Under /api/auth/** (no JWT required) on purpose: the JWT is usually expired by the time
// the browser calls refresh. The refresh cookie is what authenticates these calls.
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class RefreshTokenController {

    private final RefreshTokenControllerManager refreshTokenControllerManager;

    @Autowired
    public RefreshTokenController(RefreshTokenControllerManager refreshTokenControllerManager) {
        this.refreshTokenControllerManager = refreshTokenControllerManager;
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@RequestBody RefreshRequest refreshRequest) {
        return refreshTokenControllerManager.refresh(refreshRequest.getRole());
    }

    @PostMapping("/logout")
    public GeneralResponse logout(@RequestBody RefreshRequest refreshRequest) {
        return refreshTokenControllerManager.logout(refreshRequest.getRole());
    }

}
