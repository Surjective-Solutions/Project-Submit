package com.examflow.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// The record of one class recording. The video file is never stored here: this is only what a study pack (and the
// session form) needs to point at it. recordingCode is made when the record is saved and is the link other tables
// keep (StudyPackItem.recordingCode, ClassSession.recordingCode).
@Entity
@Table(name = "class_recording")
public class ClassRecording {

    public static final Integer STATUS_ACTIVE = 2;
    public static final Integer STATUS_DELETED = 0;

    private Integer recordingSeq;

    private String recordingCode;

    private String title;

    private Tutor tutor;

    // the day the class was held
    private LocalDate classDate;

    private Integer durationMins;

    // where the video can be watched, when it is already hosted somewhere (optional)
    private String videoUrl;

    // 2 = active, 0 = deleted
    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "recording_seq")
    public Integer getRecordingSeq() {
        return recordingSeq;
    }

    public void setRecordingSeq(Integer recordingSeq) {
        this.recordingSeq = recordingSeq;
    }

    @Column(name = "recording_code", nullable = false, unique = true, length = 40)
    public String getRecordingCode() {
        return recordingCode;
    }

    public void setRecordingCode(String recordingCode) {
        this.recordingCode = recordingCode;
    }

    @Column(name = "title", nullable = false, length = 120)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @ManyToOne
    @JoinColumn(name = "tutor_seq", nullable = false)
    public Tutor getTutor() {
        return tutor;
    }

    public void setTutor(Tutor tutor) {
        this.tutor = tutor;
    }

    @Column(name = "class_date")
    public LocalDate getClassDate() {
        return classDate;
    }

    public void setClassDate(LocalDate classDate) {
        this.classDate = classDate;
    }

    @Column(name = "duration_mins")
    public Integer getDurationMins() {
        return durationMins;
    }

    public void setDurationMins(Integer durationMins) {
        this.durationMins = durationMins;
    }

    @Column(name = "video_url", length = 500)
    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @Column(name = "createdDateTime")
    public LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    @Column(name = "lastModifiedDateTime")
    public LocalDateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(LocalDateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    @Column(name = "createdBy")
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    @Column(name = "lastModifiedBy")
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }
}
