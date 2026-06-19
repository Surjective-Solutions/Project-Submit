package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.UserSignUpRequest;
import com.examflow.backend.dto.UserSignUpRespond;
import com.examflow.backend.service.UserSignUpControllermanager;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    private final UserSignUpControllermanager userSignUpControllerManager;

    @Autowired
    public TestController(UserSignUpControllermanager userSignUpControllerManager) {
        this.userSignUpControllerManager = userSignUpControllerManager;
    }

    @PostMapping("/hello")
    public UserSignUpRespond hello(@RequestBody UserSignUpRequest userSignUpRequest) {
        UserSignUpRespond response = new UserSignUpRespond();
        response = userSignUpControllerManager.signUpStudent(userSignUpRequest);
        return response;
    }

}
