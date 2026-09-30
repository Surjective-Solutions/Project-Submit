package com.examflow.backend.service.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.StudentSummaryResponse;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.AdminDashboardControllerManager;

@Service
public class AdminDashboardControllerManagerImpl implements AdminDashboardControllerManager {

    // Students with this status can log in; it is set on signup approval.
    private static final Integer ACTIVE_STUDENT_STATUS = 2;

    // The academy runs on Sri Lanka time, so "this month" starts at midnight Colombo time.
    private static final ZoneId ACADEMY_ZONE = ZoneId.of("Asia/Colombo");

    private final StudentRepository studentRepository;

    @Autowired
    public AdminDashboardControllerManagerImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public StudentSummaryResponse getStudentSummary() {
        
        LocalDateTime startOfMonth = LocalDate.now(ACADEMY_ZONE).withDayOfMonth(1).atStartOfDay();

        StudentSummaryResponse response = new StudentSummaryResponse();
        response.setActive(studentRepository.countByStatus(ACTIVE_STUDENT_STATUS));
        response.setNewThisMonth(
                studentRepository.countByStatusAndRegisterDateTimeGreaterThanEqual(ACTIVE_STUDENT_STATUS, startOfMonth));
        return response;
    }
}
