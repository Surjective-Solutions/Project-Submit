package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examflow.backend.dto.ClassRecordingRequest;
import com.examflow.backend.dto.ClassRecordingResponse;
import com.examflow.backend.dto.ClassRecordingSaveResponse;
import com.examflow.backend.service.ClassRecordingControllerManager;

@RestController
@RequestMapping("/api/class-recording")
@CrossOrigin(origins = "http://localhost:3000")
public class ClassRecordingController {

    private final ClassRecordingControllerManager classRecordingControllerManager;

    @Autowired
    public ClassRecordingController(ClassRecordingControllerManager classRecordingControllerManager) {
        this.classRecordingControllerManager = classRecordingControllerManager;
    }

    @PostMapping("/create")
    public ClassRecordingSaveResponse saveRecording(@RequestBody ClassRecordingRequest recordingRequest) {
        return classRecordingControllerManager.saveRecording(recordingRequest);
    }

    // An empty body (200) when there is no such recording among the caller's.
    @GetMapping("/by-code/{code}")
    public ClassRecordingResponse findRecordingByCode(@PathVariable String code) {
        return classRecordingControllerManager.findRecordingByCode(code);
    }

    @GetMapping("/list")
    public List<ClassRecordingResponse> listRecordings(@RequestParam(required = false) Integer tutorId) {
        return classRecordingControllerManager.listRecordings(tutorId);
    }
}
