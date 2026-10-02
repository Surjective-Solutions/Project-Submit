package com.examflow.backend.dto;

public class StreamCountResponse {

    private String stream;

    private Long count;

    public StreamCountResponse() {
    }

    // Used by the JPQL constructor expression in StudentRepository.countByStreamForStatus.
    public StreamCountResponse(String stream, Long count) {
        this.stream = stream;
        this.count = count;
    }

    public String getStream() {
        return stream;
    }

    public void setStream(String stream) {
        this.stream = stream;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

}
