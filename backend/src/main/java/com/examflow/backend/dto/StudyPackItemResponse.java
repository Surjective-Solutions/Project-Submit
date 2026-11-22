package com.examflow.backend.dto;

// One session of a study pack: the lesson title the admin gave it, its place in the pack, and a copy of the recording it
// points at (taken when the pack was saved).
public class StudyPackItemResponse {

    private String recordingCode;
    private String title;
    private Integer order;
    private Recording recording;

    // The recording as the pages show it. classDate is "YYYY-MM-DD" or null.
    public static class Recording {
        private String code;
        private String title;
        private String subject;
        private String medium;
        private String classDate;
        private Integer durationMins;
        private String teacherId;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getMedium() {
            return medium;
        }

        public void setMedium(String medium) {
            this.medium = medium;
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

        public String getTeacherId() {
            return teacherId;
        }

        public void setTeacherId(String teacherId) {
            this.teacherId = teacherId;
        }
    }

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

    public Recording getRecording() {
        return recording;
    }

    public void setRecording(Recording recording) {
        this.recording = recording;
    }
}
