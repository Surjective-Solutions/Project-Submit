package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.AdminClassTutorResponse;
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
}
