package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.AdminSessionRequest;
import com.examflow.backend.dto.AdminSessionResponse;
import com.examflow.backend.dto.AdminSessionSaveResponse;
import com.examflow.backend.service.AdminClassSessionControllerManager;

// The sessions of a class on the admin Classes page. A class has many sessions.
@RestController
@RequestMapping("/api/admin-class/classes/{classId}/sessions")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminClassSessionController {

    private final AdminClassSessionControllerManager adminClassSessionControllerManager;

    @Autowired
    public AdminClassSessionController(AdminClassSessionControllerManager adminClassSessionControllerManager) {
        this.adminClassSessionControllerManager = adminClassSessionControllerManager;
    }

    @GetMapping
    public List<AdminSessionResponse> getSessions(@PathVariable Integer classId) {
        return adminClassSessionControllerManager.getSessions(classId);
    }

    @PostMapping
    public AdminSessionSaveResponse createSession(@PathVariable Integer classId,
            @RequestBody AdminSessionRequest request) {
        return adminClassSessionControllerManager.createSession(classId, request);
    }

    @PutMapping("/{sessionId}")
    public AdminSessionSaveResponse updateSession(@PathVariable Integer classId, @PathVariable Integer sessionId,
            @RequestBody AdminSessionRequest request) {
        return adminClassSessionControllerManager.updateSession(classId, sessionId, request);
    }

    @DeleteMapping("/{sessionId}")
    public AdminSessionSaveResponse deleteSession(@PathVariable Integer classId, @PathVariable Integer sessionId) {
        return adminClassSessionControllerManager.deleteSession(classId, sessionId);
    }
}
