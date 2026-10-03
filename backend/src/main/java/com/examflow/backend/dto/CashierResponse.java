package com.examflow.backend.dto;

public class CashierResponse {

    private Integer id;

    private String fullName;

    private String email;

    private String username;

    private String contactNumber;

    private String nicNumber;

    private String cashierCode; 

    private java.time.LocalDateTime createdDateTime; 

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContactNumber() {
        return contactNumber;
    }
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getNicNumber() {
        return nicNumber;
    }
    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public java.time.LocalDateTime getCreatedDateTime() {
        return createdDateTime;
    }
    public void setCreatedDateTime(java.time.LocalDateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public String getCashierCode() {
        return cashierCode;
    }
    public void setCashierCode(String cashierCode) {
        this.cashierCode = cashierCode;
    }

}
