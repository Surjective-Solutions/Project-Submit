package com.examflow.backend.scheduller;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.examflow.backend.service.RefreshTokenControllerManager;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenScheduler {

    private final RefreshTokenControllerManager refreshTokenControllerManager;

    // Sessions whose browser was closed without logging out never tell the server they ended;
    // once past their hard expiry they can't be used, so mark them revoked (status 0).
    @Scheduled(cron = "${app.auth.refresh-token-cleanup-cron:0 0 * * * *}") // default: every hour, on the hour
    public void revokeExpiredRefreshTokens() {
        refreshTokenControllerManager.revokeExpiredSessions();
    }

}
