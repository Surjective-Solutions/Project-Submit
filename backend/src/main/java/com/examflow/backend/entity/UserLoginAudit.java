package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

// One row per successful login. The device columns are filled in by the follow-up
// /api/device/verify call; a row left at PENDING means that call never arrived.
@Entity
@Table(name = "user_login_audit", indexes = @Index(name = "idx_user_login_audit_user", columnList = "user_seq, user_role"))
public class UserLoginAudit {

    public static final String DEVICE_PENDING = "PENDING";
    public static final String DEVICE_REGISTERED = "REGISTERED";
    public static final String DEVICE_VERIFIED = "VERIFIED";
    public static final String DEVICE_BLOCKED = "BLOCKED";

    private Integer userLoginAuditSeq;

    private Integer userSeq;

    private String userRole;

    private LocalDateTime loginDateTime;

    private String jwtTokenHash;

    private String ipAddress;

    private String userAgent;

    private String deviceId;

    private String deviceStatus;

    private LocalDateTime deviceCheckedDateTime;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_login_audit_seq")
    public Integer getUserLoginAuditSeq() {
        return userLoginAuditSeq;
    }

    public void setUserLoginAuditSeq(Integer userLoginAuditSeq) {
        this.userLoginAuditSeq = userLoginAuditSeq;
    }

    @Column(name = "user_seq")
    public Integer getUserSeq() {
        return userSeq;
    }

    public void setUserSeq(Integer userSeq) {
        this.userSeq = userSeq;
    }

    @Column(name = "user_role")
    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    @Column(name = "login_date_time")
    public LocalDateTime getLoginDateTime() {
        return loginDateTime;
    }

    public void setLoginDateTime(LocalDateTime loginDateTime) {
        this.loginDateTime = loginDateTime;
    }

    // SHA-256 of the issued JWT, never the token itself
    @Column(name = "jwt_token_hash", length = 64)
    public String getJwtTokenHash() {
        return jwtTokenHash;
    }

    public void setJwtTokenHash(String jwtTokenHash) {
        this.jwtTokenHash = jwtTokenHash;
    }

    @Column(name = "ip_address", length = 64)
    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    @Column(name = "user_agent", length = 512)
    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    @Column(name = "device_id", length = 64)
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    @Column(name = "device_status", length = 20)
    public String getDeviceStatus() {
        return deviceStatus;
    }

    public void setDeviceStatus(String deviceStatus) {
        this.deviceStatus = deviceStatus;
    }

    @Column(name = "device_checked_date_time")
    public LocalDateTime getDeviceCheckedDateTime() {
        return deviceCheckedDateTime;
    }

    public void setDeviceCheckedDateTime(LocalDateTime deviceCheckedDateTime) {
        this.deviceCheckedDateTime = deviceCheckedDateTime;
    }

}
