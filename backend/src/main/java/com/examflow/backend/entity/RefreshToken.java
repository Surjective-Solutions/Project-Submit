package com.examflow.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

// One row per refresh token. Every refresh rotates the token: the old row becomes ROTATED and a
// new row joins the same family (one family = one login session). Only the SHA-256 of the token
// is stored, so this table can't be used to log in.
@Entity
@Table(name = "refresh_token", indexes = @Index(name = "idx_refresh_token_family", columnList = "family_id"))
public class RefreshToken {

    public static final int STATUS_REVOKED = 0;
    public static final int STATUS_ROTATED = 1;
    public static final int STATUS_ACTIVE = 2;
    public static final String REASON_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String REASON_ACCOUNT_DEACTIVATED = "ACCOUNT_DEACTIVATED";

    private Integer refreshTokenSeq;

    private Integer userSeq;

    private String userRole;

    private String subject;

    private String tokenHash;

    private String familyId;

    private String deviceId;

    private Integer status;

    private LocalDateTime createdDateTime;

    private LocalDateTime expiresDateTime;

    private LocalDateTime rotatedDateTime;

    private LocalDateTime revokedDateTime;

    private String revokeReason;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_seq")
    public Integer getRefreshTokenSeq() {
        return refreshTokenSeq;
    }

    public void setRefreshTokenSeq(Integer refreshTokenSeq) {
        this.refreshTokenSeq = refreshTokenSeq;
    }

    @Column(name = "user_seq")
    public Integer getUserSeq() {
        return userSeq;
    }

    public void setUserSeq(Integer userSeq) {
        this.userSeq = userSeq;
    }

    @Column(name = "user_role", length = 20)
    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    // the JWT subject (email / phone / username) the session logged in with, reused for renewed JWTs
    @Column(name = "subject")
    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    @Column(name = "token_hash", length = 64, unique = true)
    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    @Column(name = "family_id", length = 36)
    public String getFamilyId() {
        return familyId;
    }

    public void setFamilyId(String familyId) {
        this.familyId = familyId;
    }

    // students only: the device this session was verified on
    @Column(name = "device_id", length = 64)
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    @Column(name = "status")
    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    @Column(name = "created_date_time")
    public LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    // fixed at login and carried through every rotation, so a session can't outlive it
    @Column(name = "expires_date_time")
    public LocalDateTime getExpiresDateTime() {
        return expiresDateTime;
    }

    public void setExpiresDateTime(LocalDateTime expiresDateTime) {
        this.expiresDateTime = expiresDateTime;
    }

    @Column(name = "rotated_date_time")
    public LocalDateTime getRotatedDateTime() {
        return rotatedDateTime;
    }

    public void setRotatedDateTime(LocalDateTime rotatedDateTime) {
        this.rotatedDateTime = rotatedDateTime;
    }

    @Column(name = "revoked_date_time")
    public LocalDateTime getRevokedDateTime() {
        return revokedDateTime;
    }

    public void setRevokedDateTime(LocalDateTime revokedDateTime) {
        this.revokedDateTime = revokedDateTime;
    }

    // why the session was revoked (null = ordinary logout / expiry), so the login screen can explain it
    @Column(name = "revoke_reason", length = 30)
    public String getRevokeReason() {
        return revokeReason;
    }

    public void setRevokeReason(String revokeReason) {
        this.revokeReason = revokeReason;
    }

}
