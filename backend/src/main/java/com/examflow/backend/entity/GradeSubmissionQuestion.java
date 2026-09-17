package com.examflow.backend.entity;

import javax.annotation.processing.Generated;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "grade_submission_question")
public class GradeSubmissionQuestion {
    
    private Integer gradeSubmissionQuestionSeq;


    private GradeSubmission gradeSubmission;

    private Integer marksAwarded;

    private UploadPaperQuestion uploadPaperQuestion;

    private UploadPaperQuestionSubQuestion uploadPaperQuestionSubQuestion;

    private UploadPaperQuestionSubSubQuestion uploadPaperQuestionSubSubQuestion;

    private String comment;

    private Integer status;

    private Boolean isSubQuestion;

    private Boolean isSubSubQuestion;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     @Column(name = "gradeSubmissionQuestionSeq")
    public Integer getGradeSubmissionQuestionSeq() {
        return gradeSubmissionQuestionSeq;
    }

    public void setGradeSubmissionQuestionSeq(Integer gradeSubmissionQuestionSeq) {
        this.gradeSubmissionQuestionSeq = gradeSubmissionQuestionSeq;
    }


    @ManyToOne
    @JoinColumn(name = "grade_submission_seq", nullable = false)
    public GradeSubmission getGradeSubmission() {
        return gradeSubmission;
    }

    public void setGradeSubmission(GradeSubmission gradeSubmission) {
        this.gradeSubmission = gradeSubmission;
    }


     @Column(name = "marksAwarded")
    public Integer getMarksAwarded() {
        return marksAwarded;
    }

    public void setMarksAwarded(Integer marksAwarded) {
        this.marksAwarded = marksAwarded;
    }

        @ManyToOne
    @JoinColumn(name = "uploadPaperQuestionSeq", nullable = false)
    public UploadPaperQuestion getUploadPaperQuestion() {
        return uploadPaperQuestion;
    }

    public void setUploadPaperQuestion(UploadPaperQuestion uploadPaperQuestion) {
        this.uploadPaperQuestion = uploadPaperQuestion;
    }

        @ManyToOne
    @JoinColumn(name = "uploadPaperQuestionSubQuestionSeq", nullable = true)
    public UploadPaperQuestionSubQuestion getUploadPaperQuestionSubQuestion() {
        return uploadPaperQuestionSubQuestion;
    }

    public void setUploadPaperQuestionSubQuestion(UploadPaperQuestionSubQuestion uploadPaperQuestionSubQuestion) {
        this.uploadPaperQuestionSubQuestion = uploadPaperQuestionSubQuestion;
    }

        @ManyToOne
    @JoinColumn(name = "uploadPaperQuestionSubSubQuestionSeq", nullable = true)
    public UploadPaperQuestionSubSubQuestion getUploadPaperQuestionSubSubQuestion() {
        return uploadPaperQuestionSubSubQuestion;
    }

    public void setUploadPaperQuestionSubSubQuestion(UploadPaperQuestionSubSubQuestion uploadPaperQuestionSubSubQuestion) {
        this.uploadPaperQuestionSubSubQuestion = uploadPaperQuestionSubSubQuestion;
    }

     @Column(name = "comment")
    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }


     @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }


     @Column(name = "isSubQuestion")
    public Boolean getIsSubQuestion() {
        return isSubQuestion;
    }

    public void setIsSubQuestion(Boolean isSubQuestion) {
        this.isSubQuestion = isSubQuestion;
    }

        @Column(name = "isSubSubQuestion")
    public Boolean getIsSubSubQuestion() {
        return isSubSubQuestion;
    }

    public void setIsSubSubQuestion(Boolean isSubSubQuestion) {
        this.isSubSubQuestion = isSubSubQuestion;
    }
    
}
