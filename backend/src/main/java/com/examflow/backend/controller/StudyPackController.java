package com.examflow.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.StudyPackRequest;
import com.examflow.backend.service.StudyPackControllerManager;

@RestController
@RequestMapping("/api/study-pack")
@CrossOrigin(origins = "http://localhost:3000")
public class StudyPackController {

    private final StudyPackControllerManager studyPackControllerManager;

    @Autowired
    public StudyPackController(StudyPackControllerManager studyPackControllerManager) {
        this.studyPackControllerManager = studyPackControllerManager;
    }

    // Multipart, because the pack carries its cover image. The sessions ride along as the
    // `items` JSON field of StudyPackRequest.
    @PostMapping("/create")
    public GeneralResponse createStudyPack(@ModelAttribute StudyPackRequest studyPackRequest,
            @RequestParam(required = false) MultipartFile cover) {
        System.out.println("reached to controller");
        return studyPackControllerManager.createStudyPack(studyPackRequest, cover);
    }
}
