package com.examflow.backend.dto;

// What a teacher can change on My account > Edit profile. Sent as multipart form fields (the photo is a separate
// file part). Anything else (contact number, subject, exam level, username) is not accepted here.
public class TeacherProfileUpdateRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String bio;

    // The languages taught, as a comma separated list: "Sinhala,English".
    private String mediums;

    // true to remove the current photo when no new one is sent
    private Boolean removePhoto;

    // Both are needed only to change the password. The current one proves it is the teacher at the keyboard.
    private String currentPassword;
    private String newPassword;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getMediums() {
        return mediums;
    }

    public void setMediums(String mediums) {
        this.mediums = mediums;
    }

    public Boolean getRemovePhoto() {
        return removePhoto;
    }

    public void setRemovePhoto(Boolean removePhoto) {
        this.removePhoto = removePhoto;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
