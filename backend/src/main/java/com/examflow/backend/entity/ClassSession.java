package com.examflow.backend.entity;

import java.time.LocalDateTime;

import com.examflow.backend.enums.SessionAccessLevel;
import com.examflow.backend.enums.SessionMode;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// One lesson of a class. A class has many sessions.
@Entity
@Table(name = "class_session")
public class ClassSession {

    private Integer sessionSeq;

    private Classes classes;

    private String name;

    // Who may open the session.
    private SessionAccessLevel accessLevel;

    // Online or physical.
    private SessionMode mode;

    private LocalDateTime startsAt;

    private LocalDateTime expiresAt;

    private String hall;

    private String recordingCode;

    // How the session's income is split, in percent; the three add up to 100.
    private Integer teacherShare;

    private Integer instituteShare;

    private Integer systemShare;

    // 2 = approved, 1 = open, 0 = deleted (soft delete: the row stays).
    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_seq")
    public Integer getSessionSeq() {
        return sessionSeq;
    }

    public void setSessionSeq(Integer sessionSeq) {
        this.sessionSeq = sessionSeq;
    }

    @ManyToOne
    @JoinColumn(name = "class_seq", nullable = false)
    public Classes getClasses() {
        return classes;
    }

    public void setClasses(Classes classes) {
        this.classes = classes;
    }

    @Column(name = "name", nullable = false, length = 120)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Convert(converter = SessionAccessLevelConverter.class)
    @Column(name = "access_level_seq")
    public SessionAccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(SessionAccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    @Convert(converter = SessionModeConverter.class)
    @Column(name = "mode_seq")
    public SessionMode getMode() {
        return mode;
    }

    public void setMode(SessionMode mode) {
        this.mode = mode;
    }

    @Column(name = "starts_at")
    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    @Column(name = "expires_at")
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    @Column(name = "hall")
    public String getHall() {
        return hall;
    }

    public void setHall(String hall) {
        this.hall = hall;
    }

    @Column(name = "recording_code")
    public String getRecordingCode() {
        return recordingCode;
    }

    public void setRecordingCode(String recordingCode) {
        this.recordingCode = recordingCode;
    }

    @Column(name = "teacher_share")
    public Integer getTeacherShare() {
        return teacherShare;
    }

    public void setTeacherShare(Integer teacherShare) {
        this.teacherShare = teacherShare;
    }

    @Column(name = "institute_share")
    public Integer getInstituteShare() {
        return instituteShare;
    }

    public void setInstituteShare(Integer instituteShare) {
        this.instituteShare = instituteShare;
    }

    @Column(name = "system_share")
    public Integer getSystemShare() {
        return systemShare;
    }

    public void setSystemShare(Integer systemShare) {
        this.systemShare = systemShare;
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
