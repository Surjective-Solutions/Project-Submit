package com.examflow.backend.dto;

// The answer to a profile save. field names the input to mark when one value was refused, e.g. "email" or
// "currentPassword"; it is null when the save worked or the problem is not about one input.
public class TeacherProfileUpdateResponse {

    private Boolean isSuccess;
    private String message;
    private String field;

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

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }
}
