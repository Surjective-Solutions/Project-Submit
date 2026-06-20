package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "otp_configuration")
public class OtpConfiguration {

    private Integer otpConfigSeq;

    private String contactNumber;

    private String email;

    private Integer otp;

    private LocalDateTime generatedTime;

    private Long otpExpiryTime;

    private Instructor instructor;

    private Integer status;

    private Integer sendStatus;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "otp_config_seq")
    public Integer getOtpConfigSeq() {
        return otpConfigSeq;
    }

    public void setOtpConfigSeq(Integer otpConfigSeq) {
        this.otpConfigSeq = otpConfigSeq;
    }

    @Column(name = "contact_number")
    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    @Column(name = "email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Column(name = "otp")
    public Integer getOtp() {
        return otp;
    }

    public void setOtp(Integer otp) {
        this.otp = otp;
    }

    @Column(name = "otpExpiryTime")
    public Long getOtpExpiryTime() {
        return otpExpiryTime;
    }

    public void setOtpExpiryTime(Long otpExpiryTime) {
        this.otpExpiryTime = otpExpiryTime;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @Column(name = "sendStatus")
    public Integer getSendStatus() {
        return sendStatus;
    }

    public void setSendStatus(Integer sendStatus) {
        this.sendStatus = sendStatus;
    }

    @ManyToOne
    @JoinColumn(name = "instructor_seq", nullable = true)
    public Instructor getInstructor() {
        return instructor;
    }

    public void setInstructor(Instructor instructor) {
        this.instructor = instructor;
    }

    @Column(name = "generated_time")
    public LocalDateTime getGeneratedTime() {
        return generatedTime;
    }

    public void setGeneratedTime(LocalDateTime generatedTime) {
        this.generatedTime = generatedTime;
    }

}
