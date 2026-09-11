package com.examflow.backend.dto;

import java.time.LocalDateTime;

public class PaperResponse {

    private String id;

    private String paper_name;

    private LocalDateTime due_date;

    private String submission_status;

    private String grade;

    private String exam_pdf_url;

    private String submission_url;

    private String graded_pdf_url;

    private Boolean is_current;

    private Integer duration_minutes;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getPaper_name() {
        return paper_name;
    }
    public void setPaper_name(String paper_name) {
        this.paper_name = paper_name;
    }

    public LocalDateTime getDue_date() {
        return due_date;
    }
    public void setDue_date(LocalDateTime due_date) {
        this.due_date = due_date;
    }

    public String getSubmission_status() {
        return submission_status;
    }
    public void setSubmission_status(String submission_status) {
        this.submission_status = submission_status;
    }

    public String getGrade() {
        return grade;
    }
    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getExam_pdf_url() {
        return exam_pdf_url;
    }
    public void setExam_pdf_url(String exam_pdf_url) {
        this.exam_pdf_url = exam_pdf_url;
    }

    public String getSubmission_url() {
        return submission_url;
    }
    public void setSubmission_url(String submission_url) {
        this.submission_url = submission_url;
    }

    public String getGraded_pdf_url() {
        return graded_pdf_url;
    }
    public void setGraded_pdf_url(String graded_pdf_url) {
        this.graded_pdf_url = graded_pdf_url;
    }

    public Boolean getIs_current() {
        return is_current;
    }
    public void setIs_current(Boolean is_current) {
        this.is_current = is_current;
    }

    public Integer getDuration_minutes() {
        return duration_minutes;
    }
    public void setDuration_minutes(Integer duration_minutes) {
        this.duration_minutes = duration_minutes;
    }
}
