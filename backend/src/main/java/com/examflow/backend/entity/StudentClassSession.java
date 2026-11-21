package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

// A student's place in one class session: the link between a session and an enrolment (student_class). A session
// has many of these (one per enrolled student), and each one has the attendance records (scans) made for it.
// There is at most one per session and enrolment.
@Entity
@Table(name = "student_class_session", uniqueConstraints = @UniqueConstraint(columnNames = { "session_seq",
        "student_class_seq" }))
public class StudentClassSession {

    private Integer studentClassSessionSeq;

    private ClassSession classSession;

    private StudentClass studentClass;

    // 2 = active, 0 = deleted
    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Column(name = "student_class_session_seq")
    public Integer getStudentClassSessionSeq() {
        return studentClassSessionSeq;
    }

    public void setStudentClassSessionSeq(Integer studentClassSessionSeq) {
        this.studentClassSessionSeq = studentClassSessionSeq;
    }

    @ManyToOne
    @JoinColumn(name = "session_seq", nullable = false)
    public ClassSession getClassSession() {
        return classSession;
    }

    public void setClassSession(ClassSession classSession) {
        this.classSession = classSession;
    }

    @ManyToOne
    @JoinColumn(name = "student_class_seq", nullable = false)
    public StudentClass getStudentClass() {
        return studentClass;
    }

    public void setStudentClass(StudentClass studentClass) {
        this.studentClass = studentClass;
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
