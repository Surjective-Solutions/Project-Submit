package com.examflow.backend.entity;

import java.time.LocalDateTime;

import com.examflow.backend.enums.ResourceKind;
import com.examflow.backend.enums.ResourceType;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

// Study material attached to one class session: an uploaded file or a link.
@Entity
@Table(name = "class_session_resource")
public class ClassSessionResource {

    private Integer resourceSeq;

    private ClassSession session;

    private ResourceType type;

    private ResourceKind kind;

    private String title;

    // For a file: the name it was uploaded with, shown to the admin.
    private String fileName;

    // For a file: where it is served from, e.g. "/uploads/session_resources/papers/class_3/session_9/x.pdf".
    // For a link: the link itself.
    private String url;

    private Long fileSize;

    // 2 = active, 0 = deleted (soft delete: the row and the file stay).
    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime lastModifiedDateTime;

    private String createdBy;

    private String lastModifiedBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_seq")
    public Integer getResourceSeq() {
        return resourceSeq;
    }

    public void setResourceSeq(Integer resourceSeq) {
        this.resourceSeq = resourceSeq;
    }

    @ManyToOne
    @JoinColumn(name = "session_seq", nullable = false)
    public ClassSession getSession() {
        return session;
    }

    public void setSession(ClassSession session) {
        this.session = session;
    }

    @Convert(converter = ResourceTypeConverter.class)
    @Column(name = "type_seq")
    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    @Convert(converter = ResourceKindConverter.class)
    @Column(name = "kind_seq")
    public ResourceKind getKind() {
        return kind;
    }

    public void setKind(ResourceKind kind) {
        this.kind = kind;
    }

    @Column(name = "title", nullable = false, length = 120)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Column(name = "file_name")
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    @Column(name = "url", length = 1000)
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Column(name = "file_size")
    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
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
