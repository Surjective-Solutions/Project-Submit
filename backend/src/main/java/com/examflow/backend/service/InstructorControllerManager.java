package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.entity.Instructor;

@Service
public interface InstructorControllerManager {

    List<InstructorResponse> getAllInstructors();
}
