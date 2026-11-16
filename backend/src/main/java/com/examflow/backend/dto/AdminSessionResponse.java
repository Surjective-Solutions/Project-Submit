package com.examflow.backend.dto;

// One session in the admin class page. Dates are local times, "YYYY-MM-DDTHH:mm".
public class AdminSessionResponse {

    private String id;

    private String name;

    private String access;

    private String mode;

    private String startsAt;

    private String expiresAt;

    private String hall;

    private String recordingCode;

    private AdminSessionRequest.Shares shares;

    private Integer resourceCount;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public AdminSessionRequest.Shares getShares() {
        return shares;
    }

    public void setShares(AdminSessionRequest.Shares shares) {
        this.shares = shares;
    }

    public Integer getResourceCount() {
        return resourceCount;
    }

    public void setResourceCount(Integer resourceCount) {
        this.resourceCount = resourceCount;
    }
}
