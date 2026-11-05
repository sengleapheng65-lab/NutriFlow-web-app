package com.nutriflow.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutriflow.backend.model.PasswordResetToken;

/** Spring Data queries for looking up and removing password-reset tokens. */
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void deleteAllByUserId(Long userId);
}
