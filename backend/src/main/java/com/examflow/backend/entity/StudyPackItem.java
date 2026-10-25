package com.examflow.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// One session of a study pack: a link to a class recording, plus the lesson title the admin
// wrote for it and the position it is watched in.
//
// recordingCode is the only real link. The recording_* columns beside it are a copy of what
// the recording looked like when the pack was saved, so the pack page can show dates and
// durations while the Class Recordings module is still a frontend stub. Once that module has
// a backend, fill these from it instead of from the request and they become a plain snapshot.
@Entity
@Table(name = "study_pack_item")
public class StudyPackItem {

    public static final Integer STATUS_ACTIVE = 2;

    private Integer studyPackItemSeq;

    private StudyPack studyPack;

    private String recordingCode;

    private String lessonTitle;

    // 1-based position in the pack
    private Integer displayOrder;

    private String recordingTitle;

    private LocalDate recordingClassDate;

    private Integer recordingDurationMins;

    private String recordingMedium;

    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "study_pack_item_seq")
    public Integer getStudyPackItemSeq() {
        return studyPackItemSeq;
    }

    public void setStudyPackItemSeq(Integer studyPackItemSeq) {
        this.studyPackItemSeq = studyPackItemSeq;
    }

    @ManyToOne
    @JoinColumn(name = "study_pack_seq", nullable = false)
    public StudyPack getStudyPack() {
        return studyPack;
    }

    public void setStudyPack(StudyPack studyPack) {
        this.studyPack = studyPack;
    }

    @Column(name = "recording_code")
    public String getRecordingCode() {
        return recordingCode;
    }

    public void setRecordingCode(String recordingCode) {
        this.recordingCode = recordingCode;
    }

    @Column(name = "lesson_title")
    public String getLessonTitle() {
        return lessonTitle;
    }

    public void setLessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
    }

    @Column(name = "display_order")
    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    @Column(name = "recording_title")
    public String getRecordingTitle() {
        return recordingTitle;
    }

    public void setRecordingTitle(String recordingTitle) {
        this.recordingTitle = recordingTitle;
    }

    @Column(name = "recording_class_date")
    public LocalDate getRecordingClassDate() {
        return recordingClassDate;
    }

    public void setRecordingClassDate(LocalDate recordingClassDate) {
        this.recordingClassDate = recordingClassDate;
    }

    @Column(name = "recording_duration_mins")
    public Integer getRecordingDurationMins() {
        return recordingDurationMins;
    }

    public void setRecordingDurationMins(Integer recordingDurationMins) {
        this.recordingDurationMins = recordingDurationMins;
    }

    @Column(name = "recording_medium")
    public String getRecordingMedium() {
        return recordingMedium;
    }

    public void setRecordingMedium(String recordingMedium) {
        this.recordingMedium = recordingMedium;
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
