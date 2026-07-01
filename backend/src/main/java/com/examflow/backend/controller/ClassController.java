package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.service.ClassControllerManager;

@RestController
@RequestMapping("/api/class")
@CrossOrigin(origins = "http://localhost:3000")
public class ClassController {

    private final ClassControllerManager classControllerManager;

    @Autowired
    public ClassController(ClassControllerManager classControllerManager) {
        this.classControllerManager = classControllerManager;
    }

    @PostMapping("/create")
    public GeneralResponse createClass(@RequestBody ClassRequest classRequest) {
        System.out.println("reached to controller");
        GeneralResponse response = new GeneralResponse();
        response = classControllerManager.createClass(classRequest);
        return response;
    }
}
