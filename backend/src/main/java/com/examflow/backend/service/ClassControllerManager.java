package com.examflow.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.examflow.backend.dto.ClassRequest;
import com.examflow.backend.dto.ClassResponse;
import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.PaperUploadRequest;
import com.examflow.backend.dto.RegradeRequestResponse;
import com.examflow.backend.dto.SubmitGradeResponse;
import com.examflow.backend.dto.EnrolledStudentsCountResponse;

@Service
public interface ClassControllerManager {

    GeneralResponse createClass(ClassRequest classRequest);

    GeneralResponse uploadPapers(PaperUploadRequest paperUploadRequest, Integer classId, MultipartFile pdf_file);

    GeneralResponse editPaper(Integer paperId, PaperUploadRequest paperUploadRequest, MultipartFile pdf_file);

    List<ClassResponse> getAllClasses();

    GeneralResponse updateClass(Integer classId, ClassRequest classRequest);

    GeneralResponse toggleClassStatus(Integer classId);

    GeneralResponse togglePaperPublishStatus(Integer paperId);

    GeneralResponse deletePaper(Integer paperId);

    GeneralResponse gradeSubmission(SubmitGradeResponse submitGradeResponse);

    GeneralResponse editSubmissionGrade(SubmitGradeResponse submitGradeResponse);

    List<RegradeRequestResponse> getPendingRegradeRequests();

    RegradeRequestResponse getRegradeRequestById(Integer regradeRequestSeq);

    EnrolledStudentsCountResponse getEnrolledStudentsCount();
}
    