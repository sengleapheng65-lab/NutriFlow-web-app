package com.nutriflow.backend.config;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Limits high-risk anonymous authentication requests before they reach the controllers.
 * Limits are tracked per route and client IP for the configured time window. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 50)
public class RateLimitFilter extends OncePerRequestFilter {
    private final ConcurrentHashMap<String, RateLimitWindow> windows = new ConcurrentHashMap<>();
    private final int authMaxRequests;
    private final int passwordResetMaxRequests;
    private final long windowMillis;

    public RateLimitFilter(
        @Value("${app.rate-limit.auth-max-requests:10}") int authMaxRequests,
        @Value("${app.rate-limit.password-reset-max-requests:5}") int passwordResetMaxRequests,
        @Value("${app.rate-limit.window-seconds:900}") long windowSeconds
    ) {
        this.authMaxRequests = authMaxRequests;
        this.passwordResetMaxRequests = passwordResetMaxRequests;
        this.windowMillis = windowSeconds * 1_000;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !"POST".equalsIgnoreCase(request.getMethod()) || limitFor(request.getRequestURI()) == null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        int limit = limitFor(request.getRequestURI());
        long now = System.currentTimeMillis();
        String key = request.getRequestURI() + ":" + clientIp(request);
        AtomicBoolean allowed = new AtomicBoolean(true);
        RateLimitWindow current = windows.compute(key, (ignored, previous) -> {
            if (previous == null || now - previous.startedAt() >= windowMillis) {
                return new RateLimitWindow(1, now);
            }
            if (previous.requests() >= limit) {
                allowed.set(false);
                return previous;
            }
            return new RateLimitWindow(previous.requests() + 1, previous.startedAt());
        });

        if (!allowed.get()) {
            long retryAfterSeconds = Math.max(1, (windowMillis - (now - current.startedAt()) + 999) / 1_000);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", Long.toString(retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many attempts. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Integer limitFor(String uri) {
        return switch (uri) {
            case "/api/auth/login", "/api/auth/register", "/api/auth/google", "/api/auth/google/code" -> authMaxRequests;
            case "/api/auth/forgot-password", "/api/auth/reset-password" -> passwordResetMaxRequests;
            default -> null;
        };
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",", 2)[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record RateLimitWindow(int requests, long startedAt) {}
}
