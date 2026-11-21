package com.examflow.backend.dto;

import java.time.LocalDate;
import java.util.List;

// One student on the teacher's Students page. It only holds what a teacher may see: no NIC, address, device id,
// password or payment data. status is the StudentStatus name; classes are this teacher's classes only.
public class TeacherStudentResponse {

    private String student_number;
    private String first_name;
    private String last_name;
    private String status;
    private String status_description;
    private String profile_photo_url;
    private String gender;
    private LocalDate date_of_birth;
    private String grade;
    private String subject_stream;
    private String school_name;
    private String district;
    private String contact_number;
    private String whatsapp_number;
    private String email;
    private String guardian_name;
    private String guardian_contact;
    private List<TeacherStudentClassResponse> classes;

    public String getStudent_number() {
        return student_number;
    }

    public void setStudent_number(String student_number) {
        this.student_number = student_number;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus_description() {
        return status_description;
    }

    public void setStatus_description(String status_description) {
        this.status_description = status_description;
    }

    public String getProfile_photo_url() {
        return profile_photo_url;
    }

    public void setProfile_photo_url(String profile_photo_url) {
        this.profile_photo_url = profile_photo_url;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public LocalDate getDate_of_birth() {
        return date_of_birth;
    }

    public void setDate_of_birth(LocalDate date_of_birth) {
        this.date_of_birth = date_of_birth;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSubject_stream() {
        return subject_stream;
    }

    public void setSubject_stream(String subject_stream) {
        this.subject_stream = subject_stream;
    }

    public String getSchool_name() {
        return school_name;
    }

    public void setSchool_name(String school_name) {
        this.school_name = school_name;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getContact_number() {
        return contact_number;
    }

    public void setContact_number(String contact_number) {
        this.contact_number = contact_number;
    }

    public String getWhatsapp_number() {
        return whatsapp_number;
    }

    public void setWhatsapp_number(String whatsapp_number) {
        this.whatsapp_number = whatsapp_number;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGuardian_name() {
        return guardian_name;
    }

    public void setGuardian_name(String guardian_name) {
        this.guardian_name = guardian_name;
    }

    public String getGuardian_contact() {
        return guardian_contact;
    }

    public void setGuardian_contact(String guardian_contact) {
        this.guardian_contact = guardian_contact;
    }

    public List<TeacherStudentClassResponse> getClasses() {
        return classes;
    }

    public void setClasses(List<TeacherStudentClassResponse> classes) {
        this.classes = classes;
    }
}
