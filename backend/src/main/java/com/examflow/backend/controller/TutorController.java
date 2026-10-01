package com.examflow.backend.controller;

import java.util.List;
import java.util.Map;

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


import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.InstructorResponse;
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

    @PostMapping("/add/instructor")
    public GeneralResponse addInstructor(@RequestBody Map<String, String> request) {
        String employeeId = request.get("employee_id");
        System.out.println("reached to controller with employee_id: " + employeeId);
        GeneralResponse response = new GeneralResponse();
        response = tutorControllermanager.addInstructor(employeeId);
        return response;
    }

    @GetMapping("/get-all-tutors")
    public List<TutorResponse> getCashiers() {
        return tutorControllermanager.getAllTutors();
    }

    @GetMapping("/get-tutor/{id}")
    public TutorResponse getTutorById(@PathVariable Integer id) {
        return tutorControllermanager.getTutorById(id);
    }

    @GetMapping("/get-engaged-instructors")
    public List<InstructorResponse> getEngagedInstructors() {
        return tutorControllermanager.getEngagedInstructors();
    }

    @PutMapping("update/{id}")
    public String updateTutor(@PathVariable String id, @RequestBody TutorRequest tutorRequest) {
        int tutorSeq = Integer.parseInt(id);
        String result = tutorControllermanager.updateTutor(tutorSeq, tutorRequest);

        return result;
    }

    @PutMapping("/admin/update/{id}")
    public GeneralResponse adminUpdateTutor(@PathVariable Integer id, @RequestBody TutorRequest tutorRequest) {
        return tutorControllermanager.adminUpdateTutor(id, tutorRequest);
    }

    @PutMapping("/admin/reset-password/{id}")
    public GeneralResponse adminResetPassword(@PathVariable Integer id, @RequestBody TutorRequest tutorRequest) {
        return tutorControllermanager.adminResetPassword(id, tutorRequest);
    }

    @PutMapping("/admin/activate/{id}")
    public GeneralResponse activateTutor(@PathVariable Integer id) {
        return tutorControllermanager.activateTutor(id);
    }

    @PutMapping("/admin/deactivate/{id}")
    public GeneralResponse deactivateTutor(@PathVariable Integer id) {
        return tutorControllermanager.deactivateTutor(id);
    }

    @DeleteMapping("delete/{id}")
    public String deleteTutor(@PathVariable String id) {
        int tutorSeq = Integer.parseInt(id);
        String result = tutorControllermanager.deleteTutor(tutorSeq);
        return result;
    }

    @GetMapping("/get-all-teachers")
    public List<TutorResponse> getAllTeachers() {
        return tutorControllermanager.getAllTutorsForStudent();
    }

}
