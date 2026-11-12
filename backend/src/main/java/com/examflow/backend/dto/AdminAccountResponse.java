package com.examflow.backend.dto;

// The signed-in admin's account, as shown on the My Account page. Also the answer to an update:
// isSuccess=false carries a message and no account fields.
public class AdminAccountResponse {

    private Boolean isSuccess;

    private String message;

    private String fullName;

    private String username;

    private String email;

    // local form, e.g. "0771234567"; empty when the admin has no number
    private String phone;

    private String role;

    // a path under /uploads, or empty when there is no picture
    private String photoUrl;

    public Boolean getIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(Boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

}
