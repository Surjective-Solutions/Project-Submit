package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.AdminClassDetailResponse;
import com.examflow.backend.dto.AdminClassTutorResponse;
import com.examflow.backend.dto.AdminTutorClassResponse;
import com.examflow.backend.service.AdminClassControllerManager;

@RestController
@RequestMapping("/api/admin-class")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminClassController {

    private final AdminClassControllerManager adminClassControllerManager;

    @Autowired
    public AdminClassController(AdminClassControllerManager adminClassControllerManager) {
        this.adminClassControllerManager = adminClassControllerManager;
    }

    // The tutor directory shown when the admin opens the Classes module.
    @GetMapping("/tutors")
    public List<AdminClassTutorResponse> getActiveTutors() {
        return adminClassControllerManager.getActiveTutors();
    }

    // One class page; null (an empty body) when the class does not exist or is not active.
    @GetMapping("/classes/{classId}")
    public AdminClassDetailResponse getClassDetail(@PathVariable Integer classId) {
        return adminClassControllerManager.getClassDetail(classId);
    }

    // The classes shown when the admin opens one tutor from the directory.
    @GetMapping("/tutors/{tutorId}/classes")
    public List<AdminTutorClassResponse> getTutorClasses(@PathVariable Integer tutorId) {
        return adminClassControllerManager.getTutorClasses(tutorId);
    }
}
