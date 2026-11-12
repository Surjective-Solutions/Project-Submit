package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminAccountResponse;
import com.examflow.backend.dto.AdminAccountUpdateRequest;
import com.examflow.backend.dto.AdminStudentRegistrationRequest;
import com.examflow.backend.dto.AdminStudentRegistrationResponse;
import com.examflow.backend.dto.ChangeAdminPasswordRequest;
import com.examflow.backend.dto.ChangeAdminPasswordResponse;
import com.examflow.backend.dto.RegisteredTodayResponse;
import com.examflow.backend.dto.StudentDuplicateCheckResponse;
import com.examflow.backend.service.AdminControllerManager;

// Home of admin-only operations. Every method checks the caller is an admin in the manager.
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final AdminControllerManager adminControllerManager;

    @Autowired
    public AdminController(AdminControllerManager adminControllerManager) {
        this.adminControllerManager = adminControllerManager;
    }

    // Student registration ----------------------------------------------

    @GetMapping("/student/check-duplicate")
    public StudentDuplicateCheckResponse checkStudentDuplicate(@RequestParam String contactNumber) {
        return adminControllerManager.checkStudentDuplicate(contactNumber);
    }

    // Multipart, because the student's photo travels with the form.
    @PostMapping("/student/register")
    public AdminStudentRegistrationResponse registerStudent(
            @ModelAttribute AdminStudentRegistrationRequest registrationRequest,
            @RequestParam(required = false) MultipartFile photo) {
        return adminControllerManager.registerStudent(registrationRequest, photo);
    }

    @GetMapping("/student/registered-today")
    public RegisteredTodayResponse getStudentsRegisteredToday() {
        return adminControllerManager.getStudentsRegisteredToday();
    }

    // My account ---------------------------------------------------------

    @GetMapping("/account/me")
    public AdminAccountResponse getMyAccount() {
        return adminControllerManager.getMyAccount();
    }

    // Multipart, because the admin's picture travels with the form.
    @PostMapping("/account/update")
    public AdminAccountResponse updateMyAccount(
            @ModelAttribute AdminAccountUpdateRequest updateRequest,
            @RequestParam(required = false) MultipartFile photo) {
        return adminControllerManager.updateMyAccount(updateRequest, photo);
    }

    @PostMapping("/account/change-password")
    public ChangeAdminPasswordResponse changeMyPassword(@RequestBody ChangeAdminPasswordRequest passwordRequest) {
        return adminControllerManager.changeMyPassword(passwordRequest);
    }
}
