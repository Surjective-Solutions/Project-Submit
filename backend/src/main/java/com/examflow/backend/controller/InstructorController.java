package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.service.InstructorControllerManager;

@RestController
@RequestMapping("/api/instructor")
@CrossOrigin(origins = "http://localhost:3000")
public class InstructorController {

    private final InstructorControllerManager instructorControllerManager;

    @Autowired
    public InstructorController(InstructorControllerManager instructorControllerManager) {

        this.instructorControllerManager = instructorControllerManager;
    }

    @GetMapping("/get-all-instructors")
    public List<InstructorResponse> getCashiers() {
        return instructorControllerManager.getAllInstructors();
    }

}
