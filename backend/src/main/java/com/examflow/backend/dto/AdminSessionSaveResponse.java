package com.examflow.backend.dto;

// Result of creating, updating or deleting a session. Business errors come back as 200 with
// isSuccess = false, because a 401/403 is read by the app as an expired login.
public class AdminSessionSaveResponse {

    private Boolean isSuccess;

    private String message;

    private AdminSessionResponse session;

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

    public AdminSessionResponse getSession() {
        return session;
    }

    public void setSession(AdminSessionResponse session) {
        this.session = session;
    }
}
