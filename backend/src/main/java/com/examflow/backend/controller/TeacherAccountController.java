package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.TeacherProfileUpdateRequest;
import com.examflow.backend.dto.TeacherProfileUpdateResponse;
import com.examflow.backend.service.TeacherAccountControllerManager;

// My account in the teacher portal.
@RestController
@RequestMapping("/api/teacher-account")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherAccountController {

    private final TeacherAccountControllerManager teacherAccountControllerManager;

    @Autowired
    public TeacherAccountController(TeacherAccountControllerManager teacherAccountControllerManager) {
        this.teacherAccountControllerManager = teacherAccountControllerManager;
    }

    @PostMapping("/update")
    public TeacherProfileUpdateResponse updateMyProfile(@ModelAttribute TeacherProfileUpdateRequest updateRequest,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        return teacherAccountControllerManager.updateMyProfile(updateRequest, photo);
    }
}
