package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.TeacherStudentResponse;
import com.examflow.backend.service.TeacherStudentControllerManager;

// The students of the signed-in teacher, for the Students section of the teacher account.
@RestController
@RequestMapping("/api/teacher-student")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherStudentController {

    private final TeacherStudentControllerManager teacherStudentControllerManager;

    @Autowired
    public TeacherStudentController(TeacherStudentControllerManager teacherStudentControllerManager) {
        this.teacherStudentControllerManager = teacherStudentControllerManager;
    }

    @GetMapping("/my-students")
    public List<TeacherStudentResponse> getMyStudents() {
        return teacherStudentControllerManager.getMyStudents();
    }
}
