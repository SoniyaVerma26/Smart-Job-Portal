package com.smartjobportal.backend.security;

import com.smartjobportal.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import jakarta.annotation.PostConstruct;

import java.security.MessageDigest;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMillis;

    private Key getSigningKey() throws WeakKeyException {
        // Use resolved bytes computed at startup if available
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        try {
            // try to detect base64-encoded secret and decode
            if (isProbablyBase64(jwtSecret)) {
                byte[] decoded = Base64.getDecoder().decode(jwtSecret);
                if (decoded.length >= 32) keyBytes = decoded;
            }
        } catch (IllegalArgumentException ignored) {
            // not base64, fall back to raw bytes
        }

        if (keyBytes.length < 32) {
            throw new WeakKeyException("JWT secret must be at least 32 bytes for HS256. Current length: " + keyBytes.length);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private boolean isProbablyBase64(String s) {
        // quick heuristic: length % 4 == 0 and contains only base64 chars
        if (s == null) return false;
        String base64Pattern = "^[A-Za-z0-9+/=\\r\\n]+$";
        return s.length() % 4 == 0 && s.matches(base64Pattern);
    }

    @PostConstruct
    private void validateAndLogKey() {
        try {
            byte[] bytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            if (isProbablyBase64(jwtSecret)) {
                try { bytes = Base64.getDecoder().decode(jwtSecret); } catch (IllegalArgumentException ignored) {}
            }
            if (bytes.length < 32) {
                System.err.println("FATAL: JWT secret is too short (" + bytes.length + ") - must be >=32 bytes");
            } else {
                // compute short fingerprint to help detect mismatched secrets across instances
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                byte[] digest = md.digest(bytes);
                String fingerprint = bytesToHex(digest).substring(0, 12);
                System.out.println("JWT secret fingerprint: " + fingerprint);
            }
        } catch (Exception e) {
            System.err.println("Unable to validate JWT secret: " + e.getMessage());
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    public String generateToken(User user) {
        try {
            Date now = new Date();
            return Jwts.builder()
                    .setSubject(user.getEmail())
                    .claim("userId", user.getId())
                    .claim("name", user.getName())
                    .claim("role", user.getRole())
                    .setIssuedAt(now)
                    .setExpiration(new Date(now.getTime() + jwtExpirationMillis))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (WeakKeyException e) {
            System.err.println("FATAL: " + e.getMessage());
            throw new RuntimeException("JWT configuration error: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (WeakKeyException e) {
            System.err.println("FATAL: " + e.getMessage());
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("JwtUtil.validateToken failed: " + e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (WeakKeyException e) {
            System.err.println("FATAL: " + e.getMessage());
            return null;
        }
    }
}
