package com.examflow.backend.dto;

import java.util.List;

public class StudentsByStreamResponse {

    private Long total;

    private List<StreamCountResponse> streams;

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public List<StreamCountResponse> getStreams() {
        return streams;
    }

    public void setStreams(List<StreamCountResponse> streams) {
        this.streams = streams;
    }

}
