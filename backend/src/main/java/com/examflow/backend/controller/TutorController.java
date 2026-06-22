package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.service.TutorControllermanager;

@RestController
@RequestMapping("/api/tutor")
@CrossOrigin(origins = "http://localhost:3000")
public class TutorController {

    private final TutorControllermanager tutorControllermanager;

    @Autowired
    public TutorController(TutorControllermanager tutorControllermanager) {
        this.tutorControllermanager = tutorControllermanager;
    }

    @PostMapping("/create")
    public GeneralResponse hello(@RequestBody TutorRequest tutorRequest) {
        System.out.println("reached to controller");
        GeneralResponse response = new GeneralResponse();
        response = tutorControllermanager.createTutor(tutorRequest);
        return response;
    }
}
