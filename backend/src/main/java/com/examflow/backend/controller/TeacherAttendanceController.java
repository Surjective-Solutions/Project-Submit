package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.TeacherAttendanceRecordResponse;
import com.examflow.backend.dto.TeacherAttendanceStudentResponse;
import com.examflow.backend.service.TeacherAttendanceControllerManager;

// The Attendance section of the teacher account: look a student up and see their attendance in the teacher's classes.
@RestController
@RequestMapping("/api/teacher-attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherAttendanceController {

    private final TeacherAttendanceControllerManager teacherAttendanceControllerManager;

    @Autowired
    public TeacherAttendanceController(TeacherAttendanceControllerManager teacherAttendanceControllerManager) {
        this.teacherAttendanceControllerManager = teacherAttendanceControllerManager;
    }

    // An empty body (200) when the teacher has no such student.
    @GetMapping("/students/by-barcode/{code}")
    public TeacherAttendanceStudentResponse findStudentByBarcode(@PathVariable String code) {
        return teacherAttendanceControllerManager.findStudentByBarcode(code);
    }

    @GetMapping("/students/by-phone/{number}")
    public TeacherAttendanceStudentResponse findStudentByPhone(@PathVariable String number) {
        return teacherAttendanceControllerManager.findStudentByPhone(number);
    }

    @GetMapping("/records")
    public List<TeacherAttendanceRecordResponse> getRecords(@RequestParam String studentId,
            @RequestParam String from, @RequestParam String to) {
        return teacherAttendanceControllerManager.getRecords(studentId, from, to);
    }
}
