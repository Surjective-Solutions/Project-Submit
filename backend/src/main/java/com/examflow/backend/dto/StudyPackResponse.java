package com.examflow.backend.dto;

import java.util.List;

// A study pack as the Study Packs pages use it, with its sessions. status is draft | published | expired.
// coverUrl is a path on this server ("/uploads/study_pack_covers/...") or null.
public class StudyPackResponse {

    private Integer id;
    private String name;
    private String description;
    private Integer teacherId;
    private Integer classId;
    private String className;
    private String grade;
    private String subject;
    private Double price;
    private String validity;
    private Integer customDays;
    private Shares shares;
    private String coverUrl;
    private String status;
    private Integer sessions;
    private Integer totalDuration;
    private Integer sold;
    private String updatedAt;
    private List<StudyPackItemResponse> items;

    // The three cuts of every sale, in percent.
    public static class Shares {
        private Integer teacher;
        private Integer institute;
        private Integer system;

        public Integer getTeacher() {
            return teacher;
        }

        public void setTeacher(Integer teacher) {
            this.teacher = teacher;
        }

        public Integer getInstitute() {
            return institute;
        }

        public void setInstitute(Integer institute) {
            this.institute = institute;
        }

        public Integer getSystem() {
            return system;
        }

        public void setSystem(Integer system) {
            this.system = system;
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Integer teacherId) {
        this.teacherId = teacherId;
    }

    public Integer getClassId() {
        return classId;
    }

    public void setClassId(Integer classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getValidity() {
        return validity;
    }

    public void setValidity(String validity) {
        this.validity = validity;
    }

    public Integer getCustomDays() {
        return customDays;
    }

    public void setCustomDays(Integer customDays) {
        this.customDays = customDays;
    }

    public Shares getShares() {
        return shares;
    }

    public void setShares(Shares shares) {
        this.shares = shares;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getSessions() {
        return sessions;
    }

    public void setSessions(Integer sessions) {
        this.sessions = sessions;
    }

    public Integer getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(Integer totalDuration) {
        this.totalDuration = totalDuration;
    }

    public Integer getSold() {
        return sold;
    }

    public void setSold(Integer sold) {
        this.sold = sold;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<StudyPackItemResponse> getItems() {
        return items;
    }

    public void setItems(List<StudyPackItemResponse> items) {
        this.items = items;
    }
}
