package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminClassTutorResponse;

@Service
public interface AdminClassControllerManager {

    // Every active tutor, with the number of active classes and enrolled students.
    List<AdminClassTutorResponse> getActiveTutors();
}
