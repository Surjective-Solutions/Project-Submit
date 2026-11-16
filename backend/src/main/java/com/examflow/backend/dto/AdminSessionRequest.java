package com.examflow.backend.dto;

// The session form of the admin class page. Dates are local times, "YYYY-MM-DDTHH:mm".
public class AdminSessionRequest {

    private String name;

    private String access;

    private String mode;

    private String startsAt;

    private String expiresAt;

    private String hall;

    private String recordingCode;

    private Shares shares;

    public static class Shares {

        private Integer teacher;

        private Integer institute;

        private Integer system;

        public Integer getTeacher() {
            return teacher;
        }

        public void setTeacher(Integer teacher) {
            this.teacher = teacher;
        }

        public Integer getInstitute() {
            return institute;
        }

        public void setInstitute(Integer institute) {
            this.institute = institute;
        }

        public Integer getSystem() {
            return system;
        }

        public void setSystem(Integer system) {
            this.system = system;
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAccess() {
        return access;
    }

    public void setAccess(String access) {
        this.access = access;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(String startsAt) {
        this.startsAt = startsAt;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getHall() {
        return hall;
    }

    public void setHall(String hall) {
        this.hall = hall;
    }

    public String getRecordingCode() {
        return recordingCode;
    }

    public void setRecordingCode(String recordingCode) {
        this.recordingCode = recordingCode;
    }

    public Shares getShares() {
        return shares;
    }

    public void setShares(Shares shares) {
        this.shares = shares;
    }
}
