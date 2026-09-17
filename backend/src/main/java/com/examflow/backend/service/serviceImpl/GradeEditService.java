package com.examflow.backend.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.SubmitGradeQuestionsResponse;
import com.examflow.backend.dto.SubmitGradeResponse;
import com.examflow.backend.entity.GradeSubmission;
import com.examflow.backend.entity.GradeSubmissionQuestion;
import com.examflow.backend.entity.PaperSubmission;
import com.examflow.backend.entity.RegradeRequest;
import com.examflow.backend.entity.UploadPaperQuestion;
import com.examflow.backend.entity.UploadPaperQuestionSubQuestion;
import com.examflow.backend.entity.UploadPaperQuestionSubSubQuestion;
import com.examflow.backend.repository.GradeSubmissionQuestionRepository;
import com.examflow.backend.repository.GradeSubmissionRepository;
import com.examflow.backend.repository.PaperSubmissionRepository;
import com.examflow.backend.repository.RegradeRequestRepository;
import com.examflow.backend.repository.UploadPaperQuestionRepository;
import com.examflow.backend.repository.UploadPaperQuestionSubQuestionRepository;
import com.examflow.backend.repository.UploadPaperQuestionSubSubQuestionRepository;
import com.examflow.backend.scheduller.EmailService;

// Shared by both the teacher (ClassControllerManagerImpl) and instructor
// (InstructorControllerManagerImpl) edit-grade flows so a regrade behaves
// identically regardless of who completes it, and so the versioning logic
// below only has to be gotten right in one place.
@Service
public class GradeEditService {

    private final GradeSubmissionRepository gradeSubmissionRepository;
    private final GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository;
    private final UploadPaperQuestionRepository uploadPaperQuestionRepository;
    private final UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository;
    private final UploadPaperQuestionSubSubQuestionRepository uploadPaperQuestionSubSubQuestionRepository;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final RegradeRequestRepository regradeRequestRepository;
    private final EmailService emailService;

    @Autowired
    public GradeEditService(GradeSubmissionRepository gradeSubmissionRepository,
            GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository,
            UploadPaperQuestionRepository uploadPaperQuestionRepository,
            UploadPaperQuestionSubQuestionRepository uploadPaperQuestionSubQuestionRepository,
            UploadPaperQuestionSubSubQuestionRepository uploadPaperQuestionSubSubQuestionRepository,
            PaperSubmissionRepository paperSubmissionRepository,
            RegradeRequestRepository regradeRequestRepository,
            EmailService emailService) {
        this.gradeSubmissionRepository = gradeSubmissionRepository;
        this.gradeSubmissionQuestionRepository = gradeSubmissionQuestionRepository;
        this.uploadPaperQuestionRepository = uploadPaperQuestionRepository;
        this.uploadPaperQuestionSubQuestionRepository = uploadPaperQuestionSubQuestionRepository;
        this.uploadPaperQuestionSubSubQuestionRepository = uploadPaperQuestionSubSubQuestionRepository;
        this.paperSubmissionRepository = paperSubmissionRepository;
        this.regradeRequestRepository = regradeRequestRepository;
        this.emailService = emailService;
    }

    @Transactional
    public GeneralResponse editGrade(PaperSubmission paperSubmission, SubmitGradeResponse submitGradeResponse, String username) {
        GeneralResponse response = new GeneralResponse();

        GradeSubmission oldGradeSubmission = gradeSubmissionRepository.findByPaperSubmissionAndStatus(paperSubmission, 2);
        if (oldGradeSubmission == null) {
            response.setIsSuccess(false);
            response.setMessage("This submission has not been graded yet");
            return response;
        }

        GradeSubmission newGradeSubmission = new GradeSubmission();
        newGradeSubmission.setPaperSubmission(paperSubmission);
        newGradeSubmission.setCreatedBy(username);
        newGradeSubmission.setLastModifiedBy(username);
        newGradeSubmission.setGrardedBy(username);
        newGradeSubmission.setCreatedAt(LocalDateTime.now());
        newGradeSubmission.setLastModifiedAt(LocalDateTime.now());
        newGradeSubmission.setGradedAt(LocalDateTime.now());
        newGradeSubmission.setMaxMarks(submitGradeResponse.getMaxMarks());
        newGradeSubmission.setGrade(submitGradeResponse.getGrade());
        newGradeSubmission.setTotalMarks(submitGradeResponse.getTotalMarks());
        newGradeSubmission.setStatus(2);

        // Resolve every incoming question against the paper structure before touching
        // anything persisted, so a bad question reference fails clean and leaves the
        // previous grading record completely untouched.
        List<GradeSubmissionQuestion> newQuestions = new ArrayList<>();
        for (SubmitGradeQuestionsResponse submitGradeQuestionsResponse : submitGradeResponse.getQuestions()) {
            GradeSubmissionQuestion question = buildGradeSubmissionQuestion(newGradeSubmission, submitGradeQuestionsResponse);
            if (question == null) {
                response.setIsSuccess(false);
                response.setMessage("Question not found. Contact a system administrator");
                return response;
            }
            newQuestions.add(question);
        }

        // Soft-delete the previous grading record and its question rows rather than
        // mutating them in place, so the full before/after marking history is kept -
        // a regrade request stays traceable to the exact marks it was raised against
        // even after this edit supersedes them.
        List<GradeSubmissionQuestion> previousQuestions = gradeSubmissionQuestionRepository
                .findByGradeSubmissionAndStatus(oldGradeSubmission, 2);
        for (GradeSubmissionQuestion previous : previousQuestions) {
            previous.setStatus(1);
            gradeSubmissionQuestionRepository.save(previous);
        }
        oldGradeSubmission.setStatus(1);
        oldGradeSubmission.setLastModifiedBy(username);
        oldGradeSubmission.setLastModifiedAt(LocalDateTime.now());
        gradeSubmissionRepository.save(oldGradeSubmission);

        gradeSubmissionRepository.save(newGradeSubmission);
        for (GradeSubmissionQuestion question : newQuestions) {
            gradeSubmissionQuestionRepository.save(question);
        }

        paperSubmission.setGradedDate(LocalDateTime.now());
        paperSubmissionRepository.save(paperSubmission);

        // Editing a grade is also how a regrade gets completed - if this submission
        // has an open regrade request, close it out now that the marks are updated.
        RegradeRequest pendingRegradeRequest = regradeRequestRepository.findByPaperSubmissionAndStatus(paperSubmission, 1);
        if (pendingRegradeRequest != null) {
            pendingRegradeRequest.setStatus(2); // completed
            pendingRegradeRequest.setResolvedAt(LocalDateTime.now());
            pendingRegradeRequest.setResolvedBy(username);
            regradeRequestRepository.save(pendingRegradeRequest);

            try {
                String paperName = paperSubmission.getUplaodpaper().getPaperName();
                String details = paperName + " - new grade: " + submitGradeResponse.getTotalMarks()
                        + "/" + submitGradeResponse.getMaxMarks() + " (" + submitGradeResponse.getGrade() + ").";
                emailService.sendRegradeCompleted(paperSubmission.getStudent().getEmail(), details);
            } catch (Exception e) {
                // Email delivery is best-effort and must never block the regrade completion itself.
            }
        }

        response.setIsSuccess(true);
        response.setMessage("Grade updated successfully");
        return response;
    }

    private GradeSubmissionQuestion buildGradeSubmissionQuestion(GradeSubmission gradeSubmission,
            SubmitGradeQuestionsResponse submitGradeQuestionsResponse) {
        GradeSubmissionQuestion gradeSubmissionQuestion = new GradeSubmissionQuestion();
        gradeSubmissionQuestion.setGradeSubmission(gradeSubmission);
        gradeSubmissionQuestion.setComment(submitGradeQuestionsResponse.getComment());
        gradeSubmissionQuestion.setMarksAwarded(submitGradeQuestionsResponse.getMarksAwarded());
        gradeSubmissionQuestion.setStatus(2); // make the record Approved status

        if (Boolean.TRUE.equals(submitGradeQuestionsResponse.getIsSubSubQuestion())) {
            UploadPaperQuestionSubSubQuestion subSubQuestion = uploadPaperQuestionSubSubQuestionRepository
                    .findByUploadPaperQuestionSubSubQuestionSeq(submitGradeQuestionsResponse.getSubsubquestionSeq());
            if (subSubQuestion == null) {
                return null;
            }

            UploadPaperQuestionSubQuestion parentSubQuestion = subSubQuestion.getUploadPaperQuestionSubQuestion();

            gradeSubmissionQuestion.setIsSubQuestion(false);
            gradeSubmissionQuestion.setIsSubSubQuestion(true);
            gradeSubmissionQuestion.setUploadPaperQuestionSubSubQuestion(subSubQuestion);
            gradeSubmissionQuestion.setUploadPaperQuestionSubQuestion(parentSubQuestion);
            gradeSubmissionQuestion.setUploadPaperQuestion(parentSubQuestion.getUploadPaperQuestion());
        } else if (Boolean.TRUE.equals(submitGradeQuestionsResponse.getIsSubQuestion())) {
            UploadPaperQuestionSubQuestion subQuestion = uploadPaperQuestionSubQuestionRepository
                    .findByUploadPaperQuestionSubQuestionSeq(submitGradeQuestionsResponse.getSubquestionSeq());
            if (subQuestion == null) {
                return null;
            }

            gradeSubmissionQuestion.setIsSubQuestion(true);
            gradeSubmissionQuestion.setIsSubSubQuestion(false);
            gradeSubmissionQuestion.setUploadPaperQuestionSubQuestion(subQuestion);
            gradeSubmissionQuestion.setUploadPaperQuestion(subQuestion.getUploadPaperQuestion());
        } else {
            UploadPaperQuestion question = uploadPaperQuestionRepository
                    .findByUploadPaperQuestionSeq(submitGradeQuestionsResponse.getMainQuestionSeq());
            if (question == null) {
                return null;
            }

            gradeSubmissionQuestion.setUploadPaperQuestion(question);
            gradeSubmissionQuestion.setIsSubQuestion(false);
            gradeSubmissionQuestion.setIsSubSubQuestion(false);
        }

        return gradeSubmissionQuestion;
    }
}
