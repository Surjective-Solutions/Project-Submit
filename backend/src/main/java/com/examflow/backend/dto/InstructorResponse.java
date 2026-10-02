package com.examflow.backend.dto;

public class InstructorResponse {

    private Integer id;

    private String employee_id;

    private String first_name;

    private String last_name;

    private String email;

    private String name;

    private String contact_number;

    private String subject_area;

    private String status;

    private Integer statusSeq;

    private String profile_photo_url;

    private String address;

    private String nic_number;

    private java.time.LocalDateTime createdDateTime;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmployee_id() {
        return employee_id;
    }

    public void setEmployee_id(String employee_id) {
        this.employee_id = employee_id;
    }

    public String getFirst_name() {
        return first_name;
    }

    public void setFirst_name(String first_name) {
        this.first_name = first_name;
    }

    public String getLast_name() {
        return last_name;
    }

    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContact_number() {
        return contact_number;
    }

    public void setContact_number(String contact_number) {
        this.contact_number = contact_number;
    }

    public String getSubject_area() {
        return subject_area;
    }

    public void setSubject_area(String subject_area) {
        this.subject_area = subject_area;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProfile_photo_url() {
        return profile_photo_url;
    }

    public void setProfile_photo_url(String profile_photo_url) {
        this.profile_photo_url = profile_photo_url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getStatusSeq() {
        return statusSeq;
    }

    public void setStatusSeq(Integer statusSeq) {
        this.statusSeq = statusSeq;
    }

    public String getAddress(){
        return address;
    }
    public void setAddress(String address){
        this.address = address;
    }

    public String getNic_number(){
        return nic_number;
    }
    public void setNic_number(String nic_number){
        this.nic_number = nic_number;
    }

    public java.time.LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }
    public void setCreatedDateTime(java.time.LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }
}
