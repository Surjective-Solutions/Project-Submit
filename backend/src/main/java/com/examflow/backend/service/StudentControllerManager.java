package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.StudentResponse;
import com.examflow.backend.entity.Student;

@Service
public interface StudentControllerManager {

    List<StudentResponse> getAllStudents();
}
