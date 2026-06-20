package com.examflow.backend.dto;

public class UserSignUpRespond {

    private String message;

    private String status;

    private Integer studentSeq;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getStudentSeq() {
        return studentSeq;
    }

    public void setStudentSeq(Integer studentSeq) {
        this.studentSeq = studentSeq;
    }

}
