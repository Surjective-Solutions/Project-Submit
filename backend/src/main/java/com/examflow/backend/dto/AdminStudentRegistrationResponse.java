package com.examflow.backend.dto;

// Result of registering a student. On success `studentId` is the student number the server
// assigned; on failure only `message` is meaningful.
public class AdminStudentRegistrationResponse {

    private Boolean isSuccess;

    private String message;

    private String studentId;

    private Integer studentSeq;

    public Boolean getIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(Boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Integer getStudentSeq() {
        return studentSeq;
    }

    public void setStudentSeq(Integer studentSeq) {
        this.studentSeq = studentSeq;
    }

}
