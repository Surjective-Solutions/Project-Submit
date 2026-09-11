package com.examflow.backend.dto;

public class PaperUploadRequest {

    private String paper_name;

    private String status;

    private Integer paper_id;

    private String questions;

    // private Integer number_of_questions;

    private Integer year;

    private Integer month;

    private Integer starting_question_number;

    private String due_date;

    private Integer duration_minutes;

    public String getPaper_name() {
        return paper_name;
    }

    public void setPaper_name(String paper_name) {
        this.paper_name = paper_name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPaper_id() {
        return paper_id;
    }

    public void setPaper_id(Integer paper_id) {
        this.paper_id = paper_id;
    }

    // public Integer getNumber_of_questions() {
    // return number_of_questions;
    // }

    // public void setNumber_of_questions(Integer number_of_questions) {
    // this.number_of_questions = number_of_questions;
    // }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public String getQuestions() {
        return questions;
    }

    public void setQuestions(String questions) {
        this.questions = questions;
    }

    public Integer getStarting_question_number() {
        return starting_question_number;
    }

    public void setStarting_question_number(Integer starting_question_number) {
        this.starting_question_number = starting_question_number;
    }

    public String getDue_date(){
        return due_date;
    }

    public void setDue_date(String due_date){
        this.due_date = due_date;
    }

    public Integer getDuration_minutes(){
        return duration_minutes;
    }

    public void setDuration_minutes(Integer duration_minutes){
        this.duration_minutes = duration_minutes;
    }

}
