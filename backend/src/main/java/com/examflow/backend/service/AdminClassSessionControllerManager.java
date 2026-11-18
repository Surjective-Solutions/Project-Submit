package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminSessionRequest;
import com.examflow.backend.dto.AdminSessionResponse;
import com.examflow.backend.dto.AdminSessionSaveResponse;

@Service
public interface AdminClassSessionControllerManager {

    // The active sessions of a class, earliest first; empty when the class does not exist.
    List<AdminSessionResponse> getSessions(Integer classSeq);

    AdminSessionSaveResponse createSession(Integer classSeq, AdminSessionRequest request);

    AdminSessionSaveResponse updateSession(Integer classSeq, Integer sessionSeq, AdminSessionRequest request);

    AdminSessionSaveResponse deleteSession(Integer classSeq, Integer sessionSeq);
}
