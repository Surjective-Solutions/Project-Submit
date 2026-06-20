package com.examflow.backend.entity;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "instructor")
public class Instructor {

    private Integer instructorSeq;

    private String fullName;

    private String address;

    private String password;
    private String confirmPassword;
    private String finalPassword;

    private String contactNumber;

    private String nicNumber;

    private Boolean termsAccepted;

    private Integer status;

    private String email;

    private Boolean isOtpVerified;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "instructorSeq")
    public Integer getInstructorSeq() {
        return instructorSeq;
    }

    public void setInstructorSeq(Integer instructorSeq) {
        this.instructorSeq = instructorSeq;
    }

    @Column(name = "fullName")
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    @Column(name = "address")
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Column(name = "password")
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Column(name = "confirmPassword")
    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    @Column(name = "finalPassword")
    public String getFinalPassword() {
        return finalPassword;
    }

    public void setFinalPassword(String finalPassword) {
        this.finalPassword = finalPassword;
    }

    @Column(name = "contactNumber")
    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    @Column(name = "nicNumber")
    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    @Column(name = "termsAccepted")
    public Boolean getTermsAccepted() {
        return termsAccepted;
    }

    public void setTermsAccepted(Boolean termsAccepted) {
        this.termsAccepted = termsAccepted;
    }

    @Column(name = "email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @Column(name = "isOtpVerified")
    public Boolean getIsOtpVerified() {
        return isOtpVerified;
    }

    public void setIsOtpVerified(Boolean isOtpVerified) {
        this.isOtpVerified = isOtpVerified;
    }

}
