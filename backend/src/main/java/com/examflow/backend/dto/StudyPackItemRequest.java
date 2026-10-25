package com.examflow.backend.dto;

// One entry of the `items` JSON array on StudyPackRequest.
//
// recordingCode and title are what the admin actually chose. The recording* fields are the
// details the page read out of Class Recordings; they are stored as a snapshot so the pack
// can show dates and durations, and should be looked up server-side once Class Recordings
// has a backend. `order` is ignored — the server numbers the sessions by array position.
public class StudyPackItemRequest {

    private String recordingCode;

    private String title;

    private Integer order;

    private String recordingTitle;

    private String classDate;

    private Integer durationMins;

    private String medium;

    public String getRecordingCode() {
        return recordingCode;
    }

    public void setRecordingCode(String recordingCode) {
        this.recordingCode = recordingCode;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getRecordingTitle() {
        return recordingTitle;
    }

    public void setRecordingTitle(String recordingTitle) {
        this.recordingTitle = recordingTitle;
    }

    public String getClassDate() {
        return classDate;
    }

    public void setClassDate(String classDate) {
        this.classDate = classDate;
    }

    public Integer getDurationMins() {
        return durationMins;
    }

    public void setDurationMins(Integer durationMins) {
        this.durationMins = durationMins;
    }

    public String getMedium() {
        return medium;
    }

    public void setMedium(String medium) {
        this.medium = medium;
    }

}
