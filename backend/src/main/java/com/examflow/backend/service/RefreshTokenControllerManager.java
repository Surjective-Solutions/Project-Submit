package com.examflow.backend.service;

import org.springframework.stereotype.Service;

import com.examflow.backend.dto.GeneralResponse;
import com.examflow.backend.dto.LoginResponse;

@Service
public interface RefreshTokenControllerManager {

    // starts a new session: saves a refresh token, sets it as an HttpOnly cookie on the current
    // response and returns the session id to put in the JWT
    String issueRefreshToken(Integer userSeq, String role, String subject, String deviceId);

    LoginResponse refresh(String role);

    GeneralResponse logout(String role);

    // ends every session of one user, e.g. when the account is blocked, deactivated or deleted
    void revokeAllSessions(Integer userSeq, String role);

    // marks sessions past their hard expiry as revoked (browser closed without logging out)
    void revokeExpiredSessions();
}
