package com.examflow.backend.controller;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.SessionStatusResponse;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.Tutor;
import com.examflow.backend.repository.CashierRepository;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.repository.TutorRepository;

@RestController
@RequestMapping("/api/session")
@CrossOrigin(origins = "http://localhost:3000")
public class SessionStatusController {

    private final TutorRepository tutorRepository;
    private final InstructorRepository instructorRepository;
    private final CashierRepository cashierRepository;

    @Autowired
    public SessionStatusController(TutorRepository tutorRepository,
            InstructorRepository instructorRepository,
            CashierRepository cashierRepository) {
        this.tutorRepository = tutorRepository;
        this.instructorRepository = instructorRepository;
        this.cashierRepository = cashierRepository;
    }

    // Polled by AuthGuard to catch an account being deactivated mid-session.
    // Deliberately NOT under /api/auth/** so SecurityConfig still requires a
    // valid token to reach it.
    @GetMapping("/status")
    public SessionStatusResponse getSessionStatus(HttpServletRequest request) {
        SessionStatusResponse response = new SessionStatusResponse();

        Integer userSeq = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userSeq == null || role == null) {
            response.setActive(false);
            return response;
        }

        switch (role) {
            case "tutor":
                Tutor tutor = tutorRepository.findByTutorSeq(userSeq);
                response.setActive(tutor != null && tutor.getStatus() != null && tutor.getStatus() == 2);
                return response;
            case "instructor":
                Instructor instructor = instructorRepository.findByInstructorSeq(userSeq);
                response.setActive(instructor != null && instructor.getStatus() != null && instructor.getStatus() == 2);
                return response;
            case "cashier":
                Cashier cashier = cashierRepository.findByCashierSeq(userSeq);
                response.setActive(cashier != null && cashier.getStatus() != null && cashier.getStatus() == 2);
                return response;
            default:
                // other roles (student, admin) aren't covered by this feature
                response.setActive(true);
                return response;
        }
    }
}