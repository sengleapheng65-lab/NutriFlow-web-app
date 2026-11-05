package com.nutriflow.backend.model;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
/** Stores a hashed, expiring one-time token used to authorize password replacement. */
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tokenHash;
    private Instant expiresAt;
    private boolean used;

    @ManyToOne(optional = false)
    private User user;

    protected PasswordResetToken() {}

    public PasswordResetToken(String tokenHash, Instant expiresAt, User user) {
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.user = user;
    }

    public String getTokenHash() { return tokenHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
    public User getUser() { return user; }
}
