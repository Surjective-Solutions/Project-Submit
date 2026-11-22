package com.examflow.backend.dto;

// The answer to saving a recording: on success, the saved record (with its new code) is in `recording`.
public class ClassRecordingSaveResponse {

    private Boolean isSuccess;
    private String message;
    private ClassRecordingResponse recording;

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

    public ClassRecordingResponse getRecording() {
        return recording;
    }

    public void setRecording(ClassRecordingResponse recording) {
        this.recording = recording;
    }
}
