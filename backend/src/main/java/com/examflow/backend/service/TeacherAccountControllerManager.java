package com.examflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.TeacherProfileUpdateRequest;
import com.examflow.backend.dto.TeacherProfileUpdateResponse;

// The signed-in teacher's own account (My account page).
@Service
public interface TeacherAccountControllerManager {

    // Saves the teacher's editable profile details, and the password when a new one is sent. The teacher is the one
    // in the token; nothing in the request can name another.
    TeacherProfileUpdateResponse updateMyProfile(TeacherProfileUpdateRequest update, MultipartFile photo);
}
