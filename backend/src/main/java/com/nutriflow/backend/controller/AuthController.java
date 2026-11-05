package com.nutriflow.backend.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.UserRepository;
import com.nutriflow.backend.service.PasswordResetService;
import com.nutriflow.backend.service.AdminAccessService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetService passwordResetService;
    private final ObjectMapper objectMapper;
    private final AdminAccessService adminAccess;
    @Value("${app.google-client-id:}")
    private String googleClientId;
    @Value("${app.google-client-secret:}")
    private String googleClientSecret;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(UserRepository users, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager,
        PasswordResetService passwordResetService, ObjectMapper objectMapper, AdminAccessService adminAccess) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.passwordResetService = passwordResetService;
        this.objectMapper = objectMapper;
        this.adminAccess = adminAccess;
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
        try {
            User user = users.save(new User(request.fullName().trim(), email, passwordEncoder.encode(request.password())));
            return userResponse(user);
        } catch (DataIntegrityViolationException error) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(normalizeEmail(request.email()), request.password()));
        establishSession(authentication, httpRequest, httpResponse);
        User user = users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
        return userResponse(user);
    }

    @PostMapping("/google")
    public Map<String, Object> googleLogin(@RequestBody GoogleLoginRequest request,
        HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (googleClientId.isBlank() || request.credential() == null || request.credential().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google sign-in is not configured.");
        }
        try {
            HttpRequest tokenRequest = HttpRequest.newBuilder(URI.create(
                    "https://oauth2.googleapis.com/tokeninfo?id_token=" + java.net.URLEncoder.encode(request.credential(), java.nio.charset.StandardCharsets.UTF_8)))
                .GET().build();
            HttpResponse<String> tokenResponse = HttpClient.newHttpClient().send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() != 200) throw new IllegalArgumentException("Invalid Google token");
            JsonNode token = objectMapper.readTree(tokenResponse.body());
            if (!googleClientId.equals(token.path("aud").asText()) || !"true".equals(token.path("email_verified").asText())) {
                throw new IllegalArgumentException("Google token was not issued for this app");
            }
            String email = normalizeEmail(token.path("email").asText());
            User user = users.findByEmailIgnoreCase(email).orElseGet(() ->
                users.save(new User(token.path("name").asText("Google user"), email,
                    passwordEncoder.encode(java.util.UUID.randomUUID().toString()))));
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                email, null, authoritiesFor(email));
            establishSession(authentication, httpRequest, httpResponse);
            return userResponse(user);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google sign-in was interrupted.");
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google sign-in could not be verified.");
        }
    }

    @PostMapping("/google/code")
    public Map<String, Object> googleCodeLogin(@RequestBody GoogleCodeRequest request,
        HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (googleClientId.isBlank() || googleClientSecret.isBlank() || request.code() == null || request.code().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google sign-in is not configured.");
        }
        if (!"XMLHttpRequest".equals(httpRequest.getHeader("X-Requested-With"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid Google sign-in request.");
        }
        String origin = httpRequest.getHeader("Origin");
        if (origin == null || origin.isBlank()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing request origin.");
        try {
            String form = "code=" + encode(request.code()) + "&client_id=" + encode(googleClientId)
                + "&client_secret=" + encode(googleClientSecret) + "&redirect_uri=" + encode(origin)
                + "&grant_type=authorization_code";
            HttpRequest tokenRequest = HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form)).build();
            HttpResponse<String> tokenResponse = HttpClient.newHttpClient().send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() != 200) throw new IllegalArgumentException("Google code exchange failed");
            String idToken = objectMapper.readTree(tokenResponse.body()).path("id_token").asText();
            User user = googleUserFromToken(idToken);
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getEmail(), null, authoritiesFor(user.getEmail()));
            establishSession(authentication, httpRequest, httpResponse);
            return userResponse(user);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google sign-in was interrupted.");
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google sign-in could not be verified.");
        }
    }

    private User googleUserFromToken(String idToken) throws java.io.IOException, InterruptedException {
        HttpRequest tokenRequest = HttpRequest.newBuilder(URI.create(
                "https://oauth2.googleapis.com/tokeninfo?id_token=" + encode(idToken))).GET().build();
        HttpResponse<String> tokenResponse = HttpClient.newHttpClient().send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        if (tokenResponse.statusCode() != 200) throw new IllegalArgumentException("Invalid Google token");
        JsonNode token = objectMapper.readTree(tokenResponse.body());
        if (!googleClientId.equals(token.path("aud").asText()) || !"true".equals(token.path("email_verified").asText())) {
            throw new IllegalArgumentException("Google token was not issued for this app");
        }
        String email = normalizeEmail(token.path("email").asText());
        return users.findByEmailIgnoreCase(email).orElseGet(() ->
            users.save(new User(token.path("name").asText("Google user"), email,
                passwordEncoder.encode(java.util.UUID.randomUUID().toString()))));
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private void establishSession(Authentication authentication, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in.");
        }
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
        return Map.of("id", user.getId(), "fullName", user.getFullName(), "email", user.getEmail(),
            "isAdmin", adminAccess.isAdmin(user.getEmail()));
    }

    private java.util.List<org.springframework.security.core.GrantedAuthority> authoritiesFor(String email) {
        String role = adminAccess.isAdmin(email) ? "ROLE_ADMIN" : "ROLE_USER";
        return java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
    }

    private String normalizeEmail(String email) { return email == null ? "" : email.trim().toLowerCase(); }

    public record RegisterRequest(String fullName, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record GoogleLoginRequest(String credential) {}
    public record GoogleCodeRequest(String code) {}
    public record ForgotPasswordRequest(String email) {}
    public record ResetPasswordRequest(String token, String password) {}
}
