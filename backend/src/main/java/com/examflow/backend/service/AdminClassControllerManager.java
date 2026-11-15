package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.AdminClassDetailResponse;
import com.examflow.backend.dto.AdminClassTutorResponse;
import com.examflow.backend.dto.AdminTutorClassResponse;

@Service
public interface AdminClassControllerManager {

    // Every active tutor, with the number of active classes and enrolled students.
    List<AdminClassTutorResponse> getActiveTutors();

    // The active classes of one tutor; empty when the tutor does not exist.
    List<AdminTutorClassResponse> getTutorClasses(Integer tutorSeq);

    // One active class with its tutor and enrollment numbers; null when it does not exist.
    AdminClassDetailResponse getClassDetail(Integer classSeq);
}
