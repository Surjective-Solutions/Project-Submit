package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// One scan (or manual entry) for a student's place in a class session. A student can have several for the same
// session (a re-scan, a scan when leaving, joining an online session twice). The attendance status is worked out
// from the earliest active one; a wrong record is voided (status 0) instead of deleted.
@Entity
@Table(name = "student_class_session_attendance")
public class StudentClassSessionAttendance {

    private Integer attendanceSeq;

    private StudentClassSession studentClassSession;

    // when the student was scanned in
    private LocalDateTime scannedAt;

    // an AttendanceMethod number
    private Integer methodSeq;

    // 2 = active, 0 = voided
    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "attendance_seq")
    public Integer getAttendanceSeq() {
        return attendanceSeq;
    }

    public void setAttendanceSeq(Integer attendanceSeq) {
        this.attendanceSeq = attendanceSeq;
    }

    @ManyToOne
    @JoinColumn(name = "student_class_session_seq", nullable = false)
    public StudentClassSession getStudentClassSession() {
        return studentClassSession;
    }

    public void setStudentClassSession(StudentClassSession studentClassSession) {
        this.studentClassSession = studentClassSession;
    }

    @Column(name = "scanned_at", nullable = false)
    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public void setScannedAt(LocalDateTime scannedAt) {
        this.scannedAt = scannedAt;
    }

    @Column(name = "method_seq")
    public Integer getMethodSeq() {
        return methodSeq;
    }

    public void setMethodSeq(Integer methodSeq) {
        this.methodSeq = methodSeq;
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
