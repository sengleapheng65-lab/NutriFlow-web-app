package com.nutriflow.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.nutriflow.backend.model.PasswordResetToken;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetService {
    private final PasswordResetTokenRepository tokens;
    private final String resetUrl;
    private final String mailFrom;
    private final String resendApiKey;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(PasswordResetTokenRepository tokens,
        @Value("${app.password-reset-url}") String resetUrl,
        @Value("${app.mail.from:}") String mailFrom,
        @Value("${app.resend.api-key:}") String resendApiKey) {
        this.tokens = tokens;
        this.resetUrl = resetUrl;
        this.mailFrom = mailFrom;
        this.resendApiKey = resendApiKey;
    }

    public void sendResetEmail(User user) {
        if (resendApiKey.isBlank() || mailFrom.isBlank()) throw new IllegalStateException("Password reset email is not configured.");
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random.generateSeed(32));
        tokens.save(new PasswordResetToken(hash(rawToken), Instant.now().plus(Duration.ofMinutes(30)), user));
        String text = "Reset your password using this link (valid for 30 minutes):\n\n"
            + resetUrl + "?token=" + rawToken;
        String body = "{\"from\":\"" + json(mailFrom) + "\",\"to\":[\"" + json(user.getEmail())
            + "\"],\"subject\":\"Reset your NutriFlow password\",\"text\":\"" + json(text) + "\"}";
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Email provider rejected the message: " + response.body());
            }
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Email sending was interrupted.", error);
        } catch (java.io.IOException error) {
            throw new IllegalStateException("Could not connect to the email provider.", error);
        }
    }

    public PasswordResetToken findValidToken(String rawToken) {
        PasswordResetToken token = tokens.findByTokenHash(hash(rawToken)).orElseThrow();
        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) throw new IllegalArgumentException("Reset link is invalid or expired.");
        return token;
    }

    public void markUsed(PasswordResetToken token) {
        token.setUsed(true);
        tokens.save(token);
    }

    private String hash(String value) {
        try {
            return Base64.getUrlEncoder().encodeToString(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception error) {
            throw new IllegalStateException(error);
        }
    }

    private String json(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
