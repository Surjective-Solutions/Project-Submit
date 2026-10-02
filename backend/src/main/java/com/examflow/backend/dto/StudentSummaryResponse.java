package com.examflow.backend.dto;

public class StudentSummaryResponse {

    private Long active;

    private Long newThisMonth;

    public Long getActive() {
        return active;
    }

    public void setActive(Long active) {
        this.active = active;
    }

    public Long getNewThisMonth() {
        return newThisMonth;
    }

    public void setNewThisMonth(Long newThisMonth) {
        this.newThisMonth = newThisMonth;
    }

}
