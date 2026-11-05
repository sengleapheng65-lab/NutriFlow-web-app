package com.nutriflow.backend.service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
/** Resolves whether an account email appears in the configured ADMIN_EMAILS allow-list. */
public class AdminAccessService {
    private final Set<String> adminEmails;

    public AdminAccessService(@Value("${app.admin-emails:}") String configuredEmails) {
        this.adminEmails = Arrays.stream(configuredEmails.split(","))
            .map(String::trim)
            .map(email -> email.toLowerCase(Locale.ROOT))
            .filter(email -> !email.isBlank())
            .collect(Collectors.toUnmodifiableSet());
    }

    public boolean isAdmin(String email) {
        return email != null && adminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }
}
