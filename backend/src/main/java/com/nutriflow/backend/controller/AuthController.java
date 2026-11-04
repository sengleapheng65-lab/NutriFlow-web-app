package com.nutriflow.backend.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.UserRepository;
import com.nutriflow.backend.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(UserRepository users, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
        PasswordResetService passwordResetService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (request.fullName() == null || request.fullName().isBlank() || email.isBlank()
            || request.password() == null || request.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email, and an 8-character password are required.");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        User user = users.save(new User(request.fullName().trim(), email, passwordEncoder.encode(request.password())));
        return userResponse(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizeEmail(request.email()), request.password()));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
        User user = users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
        return userResponse(user);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        User user = users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
        return userResponse(user);
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        if (request.getSession(false) != null) request.getSession(false).invalidate();
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(normalizeEmail(request.email())).ifPresent(passwordResetService::sendResetEmail);
        return Map.of("message", "If an account exists for that email, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.password() == null || request.password().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
        }
        try {
            var resetToken = passwordResetService.findValidToken(request.token());
            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(request.password()));
            users.save(user);
            passwordResetService.markUsed(resetToken);
            return Map.of("message", "Your password has been reset.");
        } catch (IllegalArgumentException | java.util.NoSuchElementException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or expired.");
        }
    }

    private Map<String, Object> userResponse(User user) {
        return Map.of("id", user.getId(), "fullName", user.getFullName(), "email", user.getEmail());
    }

    private String normalizeEmail(String email) { return email == null ? "" : email.trim().toLowerCase(); }

    public record RegisterRequest(String fullName, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record ForgotPasswordRequest(String email) {}
    public record ResetPasswordRequest(String token, String password) {}
}
