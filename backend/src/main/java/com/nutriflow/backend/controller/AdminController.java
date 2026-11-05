package com.nutriflow.backend.controller;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import com.nutriflow.backend.model.Meal;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.MealRepository;
import com.nutriflow.backend.repository.PasswordResetTokenRepository;
import com.nutriflow.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
/** Supplies ADMIN-only user summaries, meal details, and account deletion. */
public class AdminController {
    private final UserRepository users;
    private final MealRepository meals;
    private final PasswordResetTokenRepository resetTokens;

    public AdminController(UserRepository users, MealRepository meals, PasswordResetTokenRepository resetTokens) {
        this.users = users;
        this.meals = meals;
        this.resetTokens = resetTokens;
    }

    @GetMapping("/users")
    public List<UserSummary> listUsers(@RequestParam(defaultValue = "") String search) {
        String normalizedSearch = search.trim().toLowerCase(Locale.ROOT);
        return users.findAll().stream()
            .filter(user -> normalizedSearch.isBlank()
                || user.getFullName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || user.getEmail().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .map(user -> new UserSummary(user.getId(), user.getFullName(), user.getEmail(), meals.countByUserId(user.getId())))
            .sorted(Comparator.comparing(UserSummary::id).reversed())
            .toList();
    }

    @GetMapping("/users/{id}")
    public UserDetails getUser(@PathVariable Long id) {
        User user = users.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        List<MealSummary> userMeals = meals.findAllByUserIdOrderByCreatedAtDesc(id).stream()
            .map(meal -> new MealSummary(meal.getId(), meal.getName(), meal.getCalories(), meal.getProtein(),
                meal.getCarbs(), meal.getFat(), meal.getCreatedAt()))
            .toList();
        return new UserDetails(user.getId(), user.getFullName(), user.getEmail(), user.getBio(), user.getAge(),
            user.getGender(), user.getHeight(), user.getWeight(), user.getActivityLevel(), userMeals);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = users.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        resetTokens.deleteAllByUserId(id);
        meals.deleteAllByUserId(id);
        users.delete(user);
    }

    public record UserSummary(Long id, String fullName, String email, long mealCount) {}

    public record UserDetails(Long id, String fullName, String email, String bio, String age, String gender,
        String height, String weight, String activityLevel, List<MealSummary> meals) {}

    public record MealSummary(Long id, String name, int calories, double protein, double carbs, double fat,
        java.time.Instant createdAt) {}
}
