package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.TeacherStudentResponse;

@Service
public interface TeacherStudentControllerManager {

    // The students enrolled in the signed-in teacher's classes, and nobody else's.
    List<TeacherStudentResponse> getMyStudents();
}
