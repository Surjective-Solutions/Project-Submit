package com.examflow.backend.dto;

public class ChangeAdminPasswordResponse {

    private Boolean isSuccess;

    private String message;

    // which input the message belongs to: "currentPassword" or "newPassword"; empty for general errors
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
