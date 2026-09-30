package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.StudentSummaryResponse;

@Service
public interface AdminDashboardControllerManager {

    StudentSummaryResponse getStudentSummary();
}
