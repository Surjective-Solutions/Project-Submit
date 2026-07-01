package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.CashierRequest;
import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.TutorRequest;
import com.examflow.backend.dto.TutorResponse;
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

    @GetMapping("/get-all-tutors")
    public List<TutorResponse> getCashiers() {
        return tutorControllermanager.getAllTutors();
    }

    @PutMapping("update/{id}")
    public String updateTutor(@PathVariable String id, @RequestBody TutorRequest tutorRequest) {
        int tutorSeq = Integer.parseInt(id);
        String result = tutorControllermanager.updateTutor(tutorSeq, tutorRequest);

        return result;
    }

    @DeleteMapping("delete/{id}")
    public String deleteTutor(@PathVariable String id) {
        int tutorSeq = Integer.parseInt(id);
        String result = tutorControllermanager.deleteTutor(tutorSeq);
        return result;
    }

}
