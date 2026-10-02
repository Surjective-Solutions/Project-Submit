package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.service.InstructorControllerManager;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.InstructorSignUpRequest;
import com.examflow.backend.dto.InstructorTeacherResponse;
import com.examflow.backend.dto.RegradeRequestResponse;
import com.examflow.backend.dto.SubmitGradeResponse;
import com.examflow.backend.dto.InstructorRequest;
import com.examflow.backend.dto.AdminUpdateInstructorRequest;

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
    public List<InstructorResponse> getInstructors() {
        return instructorControllerManager.getAllInstructors();
    }
    @GetMapping("/get-instructor/{id}")
    public InstructorResponse getInstructorById(@PathVariable Integer id) {
        return instructorControllerManager.getInstructorById(id);
    }

    @PutMapping("/update/{id}")
    public GeneralResponse updateInstructor(@PathVariable Integer id, @RequestBody InstructorSignUpRequest instructorRequest) {
        return instructorControllerManager.updateInstructor(id, instructorRequest);
    }


        @PostMapping("/submissions/grade")
    public GeneralResponse submitGrade( @RequestBody SubmitGradeResponse submitGradeResponse ) {
        System.out.println("submitGradeResponse: " + submitGradeResponse);
        System.out.println("reched to controller");
        return instructorControllerManager.GradeSubmission(submitGradeResponse);
    }

    @GetMapping("/get-instructor-teachers")
    public List<InstructorTeacherResponse> getInstructorTeacher() {
        return instructorControllerManager.getIntructorTeachers();
    }

    @PutMapping("/submissions/edit-grade")
    public GeneralResponse editSubmissionGrade(@RequestBody SubmitGradeResponse submitGradeResponse) {
        return instructorControllerManager.editSubmissionGrade(submitGradeResponse);
    }

    @GetMapping("/regrade-requests")
    public List<RegradeRequestResponse> getPendingRegradeRequests() {
        return instructorControllerManager.getPendingRegradeRequests();
    }

    @GetMapping("/regrade-requests/{regradeRequestSeq}")
    public RegradeRequestResponse getRegradeRequestById(@PathVariable Integer regradeRequestSeq) {
        return instructorControllerManager.getRegradeRequestById(regradeRequestSeq);
    }

    @PostMapping("/create")
    public GeneralResponse createInstructor(@RequestBody InstructorRequest instructorRequest) {
        return instructorControllerManager.createInstructor(instructorRequest);
    }

    @PutMapping("/admin/update/{id}")
    public GeneralResponse adminUpdateInstructor(@PathVariable Integer id, @RequestBody AdminUpdateInstructorRequest request) {
        return instructorControllerManager.adminUpdateInstructor(id, request);
    }

    @PutMapping("/admin/activate/{id}")
    public GeneralResponse activateInstructor(@PathVariable Integer id) {
        return instructorControllerManager.activateInstructor(id);
    }

    @PutMapping("/admin/deactivate/{id}")
    public GeneralResponse deactivateInstructor(@PathVariable Integer id) {
        return instructorControllerManager.deactivateInstructor(id);
    }
}
