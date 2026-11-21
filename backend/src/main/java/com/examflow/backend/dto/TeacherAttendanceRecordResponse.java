package com.examflow.backend.dto;

// One class session in a student's attendance record. date is "YYYY-MM-DD", startTime "HH:mm", status one of
// present | late | absent, and scannedAt the local time of the first scan ("YYYY-MM-DDTHH:mm:ss"), null when absent.
public class TeacherAttendanceRecordResponse {

    private String date;
    private String className;
    private String tutor;
    private String startTime;
    private String status;
    private String scannedAt;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getTutor() {
        return tutor;
    }

    public void setTutor(String tutor) {
        this.tutor = tutor;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(String scannedAt) {
        this.scannedAt = scannedAt;
    }
}
