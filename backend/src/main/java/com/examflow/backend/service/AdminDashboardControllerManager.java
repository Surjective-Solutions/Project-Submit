package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.SlipQueueResponse;
import com.examflow.backend.dto.SlipsToVerifyResponse;
import com.examflow.backend.dto.StudentSummaryResponse;
import com.examflow.backend.dto.StudentsByStreamResponse;

@Service
public interface AdminDashboardControllerManager {

    StudentSummaryResponse getStudentSummary();

    SlipsToVerifyResponse getSlipsToVerify();

    SlipQueueResponse getSlipQueue(Integer limit);

    StudentsByStreamResponse getStudentsByStream();
}
