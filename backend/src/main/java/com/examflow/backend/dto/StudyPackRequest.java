package com.examflow.backend.dto;

// The study pack form, sent as multipart so the cover image can travel with it.
// `items` is the sessions as a JSON array (see StudyPackItemRequest) because a multipart
// field can only hold text — the same way PaperUploadRequest carries its questions.
public class StudyPackRequest {

    private String name;

    private String description;

    private Integer teacher_id;

    private String grade;

    private String subject;

    private Double price;

    // "1m" | "3m" | "6m" | "exam" | "custom"
    private String validity;

    private Integer custom_days;

    private Integer teacher_share;

    private Integer institute_share;

    private Integer system_share;

    // true for "Save & publish". A pack that is already published stays published.
    private Boolean publish;

    private String items;

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

    public Integer getTeacher_id() {
        return teacher_id;
    }

    public void setTeacher_id(Integer teacher_id) {
        this.teacher_id = teacher_id;
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

    public Integer getCustom_days() {
        return custom_days;
    }

    public void setCustom_days(Integer custom_days) {
        this.custom_days = custom_days;
    }

    public Integer getTeacher_share() {
        return teacher_share;
    }

    public void setTeacher_share(Integer teacher_share) {
        this.teacher_share = teacher_share;
    }

    public Integer getInstitute_share() {
        return institute_share;
    }

    public void setInstitute_share(Integer institute_share) {
        this.institute_share = institute_share;
    }

    public Integer getSystem_share() {
        return system_share;
    }

    public void setSystem_share(Integer system_share) {
        this.system_share = system_share;
    }

    public Boolean getPublish() {
        return publish;
    }

    public void setPublish(Boolean publish) {
        this.publish = publish;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

}
