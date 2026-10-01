package com.examflow.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.ClassResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.PaperUploadRequest;
import com.examflow.backend.dto.RegradeRequestResponse;
import com.examflow.backend.dto.SubmitGradeResponse;
import com.examflow.backend.dto.EnrolledStudentsCountResponse;
import com.examflow.backend.entity.UplaodPaper;
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


    @GetMapping("/get-all-classes")
    public List<ClassResponse> getAllClasses() {
        return classControllerManager.getAllClasses();
    }

    @PutMapping("/update/{classId}")
    public GeneralResponse updateClass(@PathVariable Integer classId, @RequestBody ClassRequest classRequest) {
        return classControllerManager.updateClass(classId, classRequest);
    }

    @PostMapping("/{classId}/uploadpaper")
    public GeneralResponse uploadPapers(@ModelAttribute PaperUploadRequest paperUploadRequest,
            @RequestParam MultipartFile pdf_file,
            @PathVariable Integer classId) {
        System.out.println("reached to controller");
        GeneralResponse response = new GeneralResponse();
        System.out.println(pdf_file.getOriginalFilename());
        response = classControllerManager.uploadPapers(paperUploadRequest, classId, pdf_file);
        return response;

    }

    @PutMapping("/edit-paper/{paperId}")
    public GeneralResponse editPaper(@ModelAttribute PaperUploadRequest paperUploadRequest,
            @RequestParam(required = false) MultipartFile pdf_file,
            @PathVariable Integer paperId) {
        return classControllerManager.editPaper(paperId, paperUploadRequest, pdf_file);
    }

    @PutMapping("/toggle-status/{classId}")
    public GeneralResponse toggleClassStatus(@PathVariable Integer classId){
        return classControllerManager.toggleClassStatus(classId);
    }

    @PutMapping("/toggle-paper-publish/{paperId}")
    public GeneralResponse togglePaperPublishStatus(@PathVariable Integer paperId) {
        return classControllerManager.togglePaperPublishStatus(paperId);
    }

    @DeleteMapping("/delete-paper/{paperId}")
    public GeneralResponse deletePaper(@PathVariable Integer paperId) {
        return classControllerManager.deletePaper(paperId);
    }

    @PostMapping("/submissions/grade")
    public GeneralResponse gradeSubmission(@RequestBody SubmitGradeResponse submitGradeResponse) {
        return classControllerManager.gradeSubmission(submitGradeResponse);
    }

    @PutMapping("/submissions/edit-grade")
    public GeneralResponse editSubmissionGrade(@RequestBody SubmitGradeResponse submitGradeResponse) {
        return classControllerManager.editSubmissionGrade(submitGradeResponse);
    }

    @GetMapping("/regrade-requests")
    public List<RegradeRequestResponse> getPendingRegradeRequests() {
        return classControllerManager.getPendingRegradeRequests();
    }

    @GetMapping("/regrade-requests/{regradeRequestSeq}")
    public RegradeRequestResponse getRegradeRequestById(@PathVariable Integer regradeRequestSeq) {
        return classControllerManager.getRegradeRequestById(regradeRequestSeq);
    }

    @GetMapping("/enrolled-students-count")
    public EnrolledStudentsCountResponse getEnrolledStudentsCount() {
        return classControllerManager.getEnrolledStudentsCount();
    }
}