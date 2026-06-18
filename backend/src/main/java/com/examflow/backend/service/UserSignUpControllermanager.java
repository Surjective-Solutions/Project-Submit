package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.UserSignUpRespond;

@Service
public interface UserSignUpControllermanager {

    UserSignUpRespond signUpStudent(UserSignUpRequest userSignUpRequest);

}