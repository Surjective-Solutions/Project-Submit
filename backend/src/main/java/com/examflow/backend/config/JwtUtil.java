package com.examflow.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final String SECRET = "my-secret-key-my-secret-key-my-secret-key"; // 32+ chars
    // kept short: the browser renews it through /api/auth/refresh using the refresh cookie
    private static final long EXPIRATION_TIME = 1000 * 60 * 15; // 15 minutes
    public static final String SESSION_ID_CLAIM = "sid";

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // no session yet: only used for a student's login token before the device check
    public String generateToken(String username, String role, Integer userSeq) {
        return generateToken(username, role, userSeq, null);
    }

    // sessionId (refresh_token.family_id) ties the JWT to its login session, so revoking the
    // session (status 0) stops the JWT on its very next request instead of when it expires
    public String generateToken(String username, String role, Integer userSeq, String sessionId) {
        JwtBuilder builder = Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("userSeq", userSeq)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME));
        if (sessionId != null) {
            builder.claim(SESSION_ID_CLAIM, sessionId);
        }
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    // null when the signature is wrong or the token has expired
    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }

    public Integer extractUserSeq(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("userSeq", Integer.class);
    }

    // SHA-256 fingerprint of a token, so it can be stored and matched without keeping a usable credential
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
