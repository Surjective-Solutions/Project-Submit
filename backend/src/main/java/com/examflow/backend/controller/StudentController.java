package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.StudentResponse;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.StudentControllerManager;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    private final StudentControllerManager studentControllerManager;

    @Autowired
    public StudentController(StudentControllerManager studentControllerManager) {
        this.studentControllerManager = studentControllerManager;
    }

    @GetMapping("/get-all-students")
    public List<StudentResponse> getStudents() {
        return studentControllerManager.getAllStudents();
    }
}
