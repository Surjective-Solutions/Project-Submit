package com.examflow.backend.dto;

import java.util.List;

public class SlipQueueResponse {

    private Long total;

    private List<SlipQueueItemResponse> slips;

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public List<SlipQueueItemResponse> getSlips() {
        return slips;
    }

    public void setSlips(List<SlipQueueItemResponse> slips) {
        this.slips = slips;
    }

}
