package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.SlipQueueResponse;
import com.examflow.backend.dto.SlipsToVerifyResponse;
import com.examflow.backend.dto.StudentSummaryResponse;
import com.examflow.backend.dto.StudentsByStreamResponse;
import com.examflow.backend.service.AdminDashboardControllerManager;

@RestController
@RequestMapping("/api/admin-dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminDashboardController {

    private final AdminDashboardControllerManager adminDashboardControllerManager;

    @Autowired
    public AdminDashboardController(AdminDashboardControllerManager adminDashboardControllerManager) {
        this.adminDashboardControllerManager = adminDashboardControllerManager;
    }

    @GetMapping("/student-summary")
    public StudentSummaryResponse getStudentSummary() {
        return adminDashboardControllerManager.getStudentSummary();
    }

    @GetMapping("/slips-to-verify")
    public SlipsToVerifyResponse getSlipsToVerify() {
        return adminDashboardControllerManager.getSlipsToVerify();
    }

    @GetMapping("/slip-queue")
    public SlipQueueResponse getSlipQueue(@RequestParam(defaultValue = "5") Integer limit) {
        return adminDashboardControllerManager.getSlipQueue(limit);
    }

    @GetMapping("/students-by-stream")
    public StudentsByStreamResponse getStudentsByStream() {
        return adminDashboardControllerManager.getStudentsByStream();
    }
}
