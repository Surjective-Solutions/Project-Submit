package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminSessionResourceResponse;
import com.examflow.backend.dto.AdminSessionResourceSaveResponse;
import com.examflow.backend.service.AdminSessionResourceControllerManager;

// The resources (files and links) of a class session on the admin Classes page.
@RestController
@RequestMapping("/api/admin-class/classes/{classId}/sessions/{sessionId}/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminSessionResourceController {

    private final AdminSessionResourceControllerManager adminSessionResourceControllerManager;

    @Autowired
    public AdminSessionResourceController(AdminSessionResourceControllerManager adminSessionResourceControllerManager) {
        this.adminSessionResourceControllerManager = adminSessionResourceControllerManager;
    }

    @GetMapping
    public List<AdminSessionResourceResponse> getResources(@PathVariable Integer classId,
            @PathVariable Integer sessionId) {
        return adminSessionResourceControllerManager.getResources(classId, sessionId);
    }

    // multipart/form-data: type, title, kind, and either file (kind "file") or url (kind "link").
    @PostMapping
    public AdminSessionResourceSaveResponse addResource(@PathVariable Integer classId,
            @PathVariable Integer sessionId, @RequestParam String type, @RequestParam String title,
            @RequestParam String kind, @RequestParam(required = false) String url,
            @RequestParam(required = false) MultipartFile file) {
        return adminSessionResourceControllerManager.addResource(classId, sessionId, type, title, kind, url, file);
    }

    @DeleteMapping("/{resourceId}")
    public AdminSessionResourceSaveResponse deleteResource(@PathVariable Integer classId,
            @PathVariable Integer sessionId, @PathVariable Integer resourceId) {
        return adminSessionResourceControllerManager.deleteResource(classId, sessionId, resourceId);
    }
}
