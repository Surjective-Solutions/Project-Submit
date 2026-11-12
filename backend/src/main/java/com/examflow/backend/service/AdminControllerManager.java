package com.examflow.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.AdminAccountResponse;
import com.examflow.backend.dto.AdminAccountUpdateRequest;
import com.examflow.backend.dto.AdminStudentRegistrationRequest;
import com.examflow.backend.dto.AdminStudentRegistrationResponse;
import com.examflow.backend.dto.ChangeAdminPasswordRequest;
import com.examflow.backend.dto.ChangeAdminPasswordResponse;
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

    // My account: the signed-in admin's own details --------------------------

    AdminAccountResponse getMyAccount();

    AdminAccountResponse updateMyAccount(AdminAccountUpdateRequest updateRequest, MultipartFile photo);

    ChangeAdminPasswordResponse changeMyPassword(ChangeAdminPasswordRequest passwordRequest);
}
