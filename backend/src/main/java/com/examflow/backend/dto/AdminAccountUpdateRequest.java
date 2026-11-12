package com.examflow.backend.dto;

// The My Account form (multipart; the photo itself arrives as a separate "photo" part).
public class AdminAccountUpdateRequest {

    private String fullName;

    private String email;

    // "0771234567", or empty to clear the number
    private String phone;

    // true when the admin removed their picture and did not choose a new one
    private Boolean removePhoto;

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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getRemovePhoto() {
        return removePhoto;
    }

    public void setRemovePhoto(Boolean removePhoto) {
        this.removePhoto = removePhoto;
    }

}
