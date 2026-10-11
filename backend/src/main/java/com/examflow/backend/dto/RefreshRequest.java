package com.examflow.backend.dto;

public class RefreshRequest {

    // which portal is asking: each role has its own refresh cookie, so being logged in to
    // two portals in one browser doesn't mix their sessions up
    private String role;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

}
