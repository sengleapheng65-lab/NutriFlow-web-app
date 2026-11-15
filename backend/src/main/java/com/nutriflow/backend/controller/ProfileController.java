package com.nutriflow.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/profile")
/** Reads and updates the profile record belonging to the authenticated account. */
public class ProfileController {
    private final UserRepository users;

    /** Supported diet and allergen keys; they match Open Food Facts tags. */
    private static final List<String> ALLOWED_RESTRICTIONS = List.of("vegan", "vegetarian", "gluten", "milk",
        "eggs", "peanuts", "nuts", "soybeans", "fish", "crustaceans", "sesame-seeds");

    public ProfileController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {
        return response(findUser(authentication));
    }

    @PutMapping
    public ProfileResponse updateProfile(@RequestBody ProfileRequest request, Authentication authentication) {
        User user = findUser(authentication);
        user.setFullName(request.fullName());
        user.setBio(request.bio());
        user.setAge(request.age());
        user.setGender(request.gender());
        user.setHeight(request.height());
        user.setWeight(request.weight());
        user.setActivityLevel(request.activityLevel());
        user.setPhoto(request.photo());
        if (request.dietaryRestrictions() != null) {
            user.setDietaryRestrictions(cleanRestrictions(request.dietaryRestrictions()));
        }
        return response(users.save(user));
    }

    private User findUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
    }

    private List<String> cleanRestrictions(List<String> restrictions) {
        List<String> result = new ArrayList<>();
        for (String restriction : restrictions) {
            if (restriction == null) continue;
            String value = restriction.trim().toLowerCase();
            if (ALLOWED_RESTRICTIONS.contains(value) && !result.contains(value)) result.add(value);
        }
        return result;
    }

    private ProfileResponse response(User user) {
        return new ProfileResponse(user.getFullName(), user.getEmail(), user.getBio(), user.getAge(),
            user.getGender(), user.getHeight(), user.getWeight(), user.getActivityLevel(), user.getPhoto(),
            new ArrayList<>(user.getDietaryRestrictions()));
    }

    public record ProfileRequest(String fullName, String email, String bio, String age, String gender, String height,
        String weight, String activityLevel, String photo, List<String> dietaryRestrictions) {}

    public record ProfileResponse(String fullName, String email, String bio, String age, String gender,
        String height, String weight, String activityLevel, String photo, List<String> dietaryRestrictions) {}
}
