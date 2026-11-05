package com.examflow.backend.dto;

// Answer to "is this contact number already registered?". When it is, `name` and `studentId`
// describe the existing student so the page can link to them.
public class StudentDuplicateCheckResponse {

    private Boolean isSuccess;

    private String message;

    private Boolean duplicate;

    private String name;

    private String studentId;

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

    public Boolean getDuplicate() {
        return duplicate;
    }

    public void setDuplicate(Boolean duplicate) {
        this.duplicate = duplicate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

}
