package com.examflow.backend.dto;

// Result of adding or deleting a session resource. Business errors come back as 200 with
// isSuccess = false, because a 401/403 is read by the app as an expired login.
public class AdminSessionResourceSaveResponse {

    private Boolean isSuccess;

    private String message;

    private AdminSessionResourceResponse resource;

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

    public AdminSessionResourceResponse getResource() {
        return resource;
    }

    public void setResource(AdminSessionResourceResponse resource) {
        this.resource = resource;
    }
}
