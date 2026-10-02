package com.examflow.backend.dto;

public class SlipsToVerifyResponse {

    private Long pending;

    private Long oldestWaitingMinutes;

    public Long getPending() {
        return pending;
    }

    public void setPending(Long pending) {
        this.pending = pending;
    }

    public Long getOldestWaitingMinutes() {
        return oldestWaitingMinutes;
    }

    public void setOldestWaitingMinutes(Long oldestWaitingMinutes) {
        this.oldestWaitingMinutes = oldestWaitingMinutes;
    }

}
