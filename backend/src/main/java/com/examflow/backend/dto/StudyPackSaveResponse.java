package com.examflow.backend.dto;

// The answer to saving a study pack: on success the saved pack (with its sessions) is in `pack`.
public class StudyPackSaveResponse {

    private Boolean isSuccess;
    private String message;
    private StudyPackResponse pack;

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

    public StudyPackResponse getPack() {
        return pack;
    }

    public void setPack(StudyPackResponse pack) {
        this.pack = pack;
    }
}
