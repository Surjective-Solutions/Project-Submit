package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.InstructorSignUpRequest;
import com.examflow.backend.dto.OtpRespond;
import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.UserSignUpRespond;
import com.examflow.backend.entity.Instructor;

@Service
public interface UserSignUpControllermanager {

    UserSignUpRespond signUpStudent(UserSignUpRequest userSignUpRequest);

    UserSignUpRespond instructorSignUpStudent(InstructorSignUpRequest instructorSignUpRequest);

    String generateOtpInstructor(String contactNumber, String email, Instructor instructor);

    OtpRespond verifyOtp(Integer identifier, Integer otp);

}