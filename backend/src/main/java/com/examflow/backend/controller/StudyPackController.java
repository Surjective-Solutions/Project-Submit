package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.StudyPackClassResponse;
import com.examflow.backend.dto.StudyPackRequest;
import com.examflow.backend.dto.StudyPackResponse;
import com.examflow.backend.dto.StudyPackSaveResponse;
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
    public StudyPackSaveResponse createStudyPack(@ModelAttribute StudyPackRequest studyPackRequest,
            @RequestParam(required = false) MultipartFile cover) {
        return studyPackControllerManager.createStudyPack(studyPackRequest, cover);
    }

    // A teacher's own save: always a draft, always theirs.
    @PostMapping("/create-mine")
    public StudyPackSaveResponse createMyStudyPack(@ModelAttribute StudyPackRequest studyPackRequest,
            @RequestParam(required = false) MultipartFile cover) {
        return studyPackControllerManager.createMyStudyPack(studyPackRequest, cover);
    }

    @PutMapping("/update/{id}")
    public StudyPackSaveResponse updateStudyPack(@PathVariable Integer id,
            @ModelAttribute StudyPackRequest studyPackRequest,
            @RequestParam(required = false) MultipartFile cover) {
        return studyPackControllerManager.updateStudyPack(id, studyPackRequest, cover);
    }

    @PutMapping("/update-mine/{id}")
    public StudyPackSaveResponse updateMyStudyPack(@PathVariable Integer id,
            @ModelAttribute StudyPackRequest studyPackRequest,
            @RequestParam(required = false) MultipartFile cover) {
        return studyPackControllerManager.updateMyStudyPack(id, studyPackRequest, cover);
    }

    // Every pack with its sessions for an admin; only their own for a teacher.
    @GetMapping("/list")
    public List<StudyPackResponse> getStudyPacks() {
        return studyPackControllerManager.getStudyPacks();
    }

    // The classes the Class dropdown offers for a teacher.
    @GetMapping("/classes")
    public List<StudyPackClassResponse> getTutorClasses(@RequestParam(required = false) Integer tutorId) {
        return studyPackControllerManager.getTutorClasses(tutorId);
    }
}
