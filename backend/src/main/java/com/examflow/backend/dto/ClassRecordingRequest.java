package com.examflow.backend.dto;

// A class recording to save. There is no file: only the details of the recording. The code is made by the server.
public class ClassRecordingRequest {

    private String title;

    // An admin says whose recording it is. A teacher's own token decides it, so this is ignored for a teacher.
    private Integer tutorId;

    // "YYYY-MM-DD", optional
    private String classDate;

    private Integer durationMins;

    // optional link to where the video is hosted
    private String videoUrl;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getTutorId() {
        return tutorId;
    }

    public void setTutorId(Integer tutorId) {
        this.tutorId = tutorId;
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
}
