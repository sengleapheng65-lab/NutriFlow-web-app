package com.nutriflow.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.nutriflow.backend.model.PasswordResetToken;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetService {
    private final PasswordResetTokenRepository tokens;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String resetUrl;
    private final String mailFrom;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(PasswordResetTokenRepository tokens, ObjectProvider<JavaMailSender> mailSender,
        @Value("${app.password-reset-url}") String resetUrl, @Value("${app.mail.from:}") String mailFrom) {
        this.tokens = tokens;
        this.mailSender = mailSender;
        this.resetUrl = resetUrl;
        this.mailFrom = mailFrom;
    }

    public void sendResetEmail(User user) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null || mailFrom.isBlank()) {
            throw new IllegalStateException("Password reset email is not configured.");
        }
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(random.generateSeed(32));
        tokens.save(new PasswordResetToken(hash(rawToken), Instant.now().plus(Duration.ofMinutes(30)), user));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject("Reset your NutriFlow password");
        message.setText("Reset your password using this link (valid for 30 minutes):\n\n"
            + resetUrl + "?token=" + rawToken);
        sender.send(message);
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
}
