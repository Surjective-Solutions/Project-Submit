package com.examflow.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.examflow.backend.entity.RefreshToken;
import com.examflow.backend.repository.RefreshTokenRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    // the one call a student's login token may make before the device check gives it a session
    private static final String DEVICE_VERIFY_PATH = "/api/device/verify";

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException, java.io.IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null &&
                authHeader.startsWith("Bearer ")) {

            Claims claims = jwtUtil.parseClaims(authHeader.substring(7));

            if (claims != null && isSessionAllowed(claims, request)) {

                Integer userId = claims.get("userSeq", Integer.class);
                String role = claims.get("role", String.class);
                String username = claims.getSubject();

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.emptyList());

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
                request.setAttribute("username", username);
            }
        }

        filterChain.doFilter(request, response);
    }

    // Every JWT names its login session. Setting that session to status 0 (logout, block, deactivate,
    // or by hand when tokens are stolen) locks the JWT out on its next request, not when it expires.
    // A rejected token is simply left unauthenticated, so protected endpoints refuse it while public
    // ones (/api/auth/**, ...) keep working.
    private boolean isSessionAllowed(Claims claims, HttpServletRequest request) {
        String sessionId = claims.get(JwtUtil.SESSION_ID_CLAIM, String.class);

        if (sessionId == null) {
            // only a student's login token has no session yet, and it may only run the device check
            String path = request.getRequestURI().substring(request.getContextPath().length());
            return "student".equals(claims.get("role", String.class)) && DEVICE_VERIFY_PATH.equals(path);
        }

        return refreshTokenRepository.existsByFamilyIdAndStatusAndExpiresDateTimeAfter(
                sessionId, RefreshToken.STATUS_ACTIVE, LocalDateTime.now());
    }
}
