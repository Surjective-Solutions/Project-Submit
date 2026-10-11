package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.DeviceVerifyResponse;

@Service
public interface DeviceVerificationControllerManager {

    DeviceVerifyResponse verifyDevice(String deviceId);
}
