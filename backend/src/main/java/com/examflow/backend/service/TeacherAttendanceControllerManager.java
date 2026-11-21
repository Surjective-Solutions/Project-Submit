package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.TeacherAttendanceRecordResponse;
import com.examflow.backend.dto.TeacherAttendanceStudentResponse;

// The teacher's Attendance page. Everything is limited to the students enrolled in the signed-in teacher's classes.
@Service
public interface TeacherAttendanceControllerManager {

    // The student whose printed student number is the code (compared without case, spaces or dashes), or null when
    // there is none among the teacher's students.
    TeacherAttendanceStudentResponse findStudentByBarcode(String code);

    // The student whose contact number is the number (local form, "0771234567", or +94...), or null.
    TeacherAttendanceStudentResponse findStudentByPhone(String number);

    // One row per class session of the student, in the teacher's classes, between from and to ("YYYY-MM-DD",
    // inclusive), for sessions that have already started. Empty for a student who is not the teacher's.
    List<TeacherAttendanceRecordResponse> getRecords(String studentId, String from, String to);
}
