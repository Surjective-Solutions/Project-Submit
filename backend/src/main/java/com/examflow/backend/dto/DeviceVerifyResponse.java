package com.examflow.backend.dto;

public class DeviceVerifyResponse {

    private String message;

    private Boolean isSuccess;

    // only set when a new device was just registered: the browser must store it for later logins
    private String deviceId;

    // the session JWT that replaces the login token once the device checks out
    private String token;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(Boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

}
