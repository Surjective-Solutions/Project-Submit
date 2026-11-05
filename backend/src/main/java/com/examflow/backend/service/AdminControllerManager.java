package com.examflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminStudentRegistrationRequest;
import com.examflow.backend.dto.AdminStudentRegistrationResponse;
import com.examflow.backend.dto.RegisteredTodayResponse;
import com.examflow.backend.dto.StudentDuplicateCheckResponse;

// Operations only an admin may run. Student registration is the first; further admin
// operations are added here rather than on the role-specific controllers.
@Service
public interface AdminControllerManager {

    StudentDuplicateCheckResponse checkStudentDuplicate(String contactNumber);

    AdminStudentRegistrationResponse registerStudent(AdminStudentRegistrationRequest registrationRequest,
            MultipartFile photo);

    RegisteredTodayResponse getStudentsRegisteredToday();
}
