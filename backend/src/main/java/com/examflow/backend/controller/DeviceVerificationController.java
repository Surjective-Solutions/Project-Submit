package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.DeviceVerifyRequest;
import com.examflow.backend.dto.DeviceVerifyResponse;
import com.examflow.backend.service.DeviceVerificationControllerManager;

@RestController
@RequestMapping("/api/device")
@CrossOrigin(origins = "http://localhost:3000")
public class DeviceVerificationController {

    private final DeviceVerificationControllerManager deviceVerificationControllerManager;

    @Autowired
    public DeviceVerificationController(DeviceVerificationControllerManager deviceVerificationControllerManager) {
        this.deviceVerificationControllerManager = deviceVerificationControllerManager;
    }

    // Called by the student login form right after login succeeds. Deliberately NOT under
    // /api/auth/** so it still needs the token that login just issued.
    @PostMapping("/verify")
    public DeviceVerifyResponse verifyDevice(@RequestBody DeviceVerifyRequest deviceVerifyRequest) {
        return deviceVerificationControllerManager.verifyDevice(deviceVerifyRequest.getDeviceId());
    }

}
