package com.examflow.backend.service.serviceImpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.QuestionGradeResponse;
import com.examflow.backend.dto.SubmissionPaperInstructorTutorResponse;
import com.examflow.backend.entity.GradeSubmission;
import com.examflow.backend.entity.GradeSubmissionQuestion;
import com.examflow.backend.entity.PaperSubmission;
import com.examflow.backend.repository.GradeSubmissionQuestionRepository;
import com.examflow.backend.repository.GradeSubmissionRepository;

// Shared by the teacher (ClassControllerManagerImpl.getAllClasses) and instructor
// (InstructorControllerManagerImpl.getIntructorTeachers) submission listings, so
// both surfaces show the same grade/graded_by/awarded_marks for a submission -
// without this, a grading UI has nothing to pre-fill when regrading.
@Service
public class SubmissionGradeSummaryService {

    private final GradeSubmissionRepository gradeSubmissionRepository;
    private final GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository;

    @Autowired
    public SubmissionGradeSummaryService(GradeSubmissionRepository gradeSubmissionRepository,
            GradeSubmissionQuestionRepository gradeSubmissionQuestionRepository) {
        this.gradeSubmissionRepository = gradeSubmissionRepository;
        this.gradeSubmissionQuestionRepository = gradeSubmissionQuestionRepository;
    }

    public void applyGradeSummary(SubmissionPaperInstructorTutorResponse response, PaperSubmission paperSubmission) {
        GradeSubmission gradeSubmission = gradeSubmissionRepository.findByPaperSubmissionAndStatus(paperSubmission, 2);

        List<QuestionGradeResponse> awardedMarks = new ArrayList<>();
        if (gradeSubmission != null) {
            response.setGrade(gradeSubmission.getGrade());
            response.setGraded_by(gradeSubmission.getGrardedBy());

            List<GradeSubmissionQuestion> gradeSubmissionQuestions = gradeSubmissionQuestionRepository
                    .findByGradeSubmissionAndStatus(gradeSubmission, 2);
            for (GradeSubmissionQuestion gradedQuestion : gradeSubmissionQuestions) {
                QuestionGradeResponse questionResponse = new QuestionGradeResponse();
                questionResponse.setMarks_awarded(gradedQuestion.getMarksAwarded());
                questionResponse.setComment(gradedQuestion.getComment());

                boolean isSubSubQuestion = Boolean.TRUE.equals(gradedQuestion.getIsSubSubQuestion())
                        && gradedQuestion.getUploadPaperQuestionSubSubQuestion() != null;
                boolean isSubQuestion = !isSubSubQuestion && Boolean.TRUE.equals(gradedQuestion.getIsSubQuestion())
                        && gradedQuestion.getUploadPaperQuestionSubQuestion() != null;

                if (isSubSubQuestion) {
                    // Must match QuestionPaperInstructorTutorResponse.id exactly
                    // (getAllClasses), since the Mark Entry page joins awarded marks
                    // back onto paper.questions by this id.
                    questionResponse.setQuestion_id(gradedQuestion.getUploadPaperQuestion().getUploadPaperQuestionSeq().toString()
                            + "-" + gradedQuestion.getUploadPaperQuestionSubQuestion().getUploadPaperQuestionSubQuestionSeq().toString()
                            + "-" + gradedQuestion.getUploadPaperQuestionSubSubQuestion().getUploadPaperQuestionSubSubQuestionSeq().toString());
                    questionResponse.setMax_marks(gradedQuestion.getUploadPaperQuestionSubSubQuestion().getMark());
                } else if (isSubQuestion) {
                    questionResponse.setQuestion_id(gradedQuestion.getUploadPaperQuestion().getUploadPaperQuestionSeq().toString()
                            + "-" + gradedQuestion.getUploadPaperQuestionSubQuestion().getUploadPaperQuestionSubQuestionSeq().toString());
                    questionResponse.setMax_marks(gradedQuestion.getUploadPaperQuestionSubQuestion().getMark());
                } else {
                    questionResponse.setQuestion_id(gradedQuestion.getUploadPaperQuestion().getUploadPaperQuestionSeq().toString());
                    questionResponse.setMax_marks(gradedQuestion.getUploadPaperQuestion().getMarks());
                }

                awardedMarks.add(questionResponse);
            }
        }
        response.setAwarded_marks(awardedMarks);
    }
}
