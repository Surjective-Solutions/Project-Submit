package com.examflow.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UploadPaperResponse {

    private Integer id;

    private String paper_name;

    private Integer month;

    private Integer year;

    private String month_label;

    private Integer number_of_questions;

    private LocalDateTime uploaded_at;

    private String pdf_url;

    private String status;

    private LocalDateTime due_date;

    private Integer duration_minutes;

    private List<QuestionPaperInstructorTutorResponse> questions;

    private List<SubmissionPaperInstructorTutorResponse>  submissions;

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }

    public String getPaper_name() {
        return paper_name;
    }
    public void setPaper_name(String paper_name) {
        this.paper_name = paper_name;
    }

    public Integer getMonth() {
        return month;
    }
    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }
    public void setYear(Integer year) {
        this.year = year;
    }

    public String getMonth_label() {
        return month_label;
    }
    public void setMonth_label(String month_label) {
        this.month_label = month_label;
    }

    public Integer getNumber_of_questions() {
        return number_of_questions;
    }
    public void setNumber_of_questions(Integer number_of_questions) {
        this.number_of_questions = number_of_questions;
    }

    public LocalDateTime getUploaded_at() {
        return uploaded_at;
    }
    public void setUploaded_at(LocalDateTime uploaded_at) {
        this.uploaded_at = uploaded_at;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getPdf_url() {
        return pdf_url;
    }
    public void setPdf_url(String pdf_url) {
        this.pdf_url = pdf_url;
    }

    public List<QuestionPaperInstructorTutorResponse> getQuestions() {
        return questions;
    }
    public void setQuestions(List<QuestionPaperInstructorTutorResponse> questions) {
        this.questions = questions;
    }

    public List<SubmissionPaperInstructorTutorResponse> getSubmissions() {
        return submissions;
    }
    public void setSubmissions(List<SubmissionPaperInstructorTutorResponse> submissions) {
        this.submissions = submissions;
    }

    public LocalDateTime getDue_date(){
        return due_date;
    }
    public void setDue_date(LocalDateTime due_date){
        this.due_date = due_date;
    }

    public Integer getDuration_minutes(){
        return duration_minutes;
    }
    public void setDuration_minutes(Integer duration_minutes){
        this.duration_minutes = duration_minutes;
    }
    

}
