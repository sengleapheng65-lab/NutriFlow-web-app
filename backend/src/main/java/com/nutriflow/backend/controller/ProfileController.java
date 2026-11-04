package com.nutriflow.backend.controller;

import java.util.Map;

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
public class ProfileController {
    private final UserRepository users;

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
        return response(users.save(user));
    }

    private User findUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
    }

    private ProfileResponse response(User user) {
        return new ProfileResponse(user.getFullName(), user.getEmail(), user.getBio(), user.getAge(),
            user.getGender(), user.getHeight(), user.getWeight(), user.getActivityLevel(), user.getPhoto());
    }

    public record ProfileRequest(String fullName, String bio, String age, String gender, String height,
        String weight, String activityLevel, String photo) {}

    public record ProfileResponse(String fullName, String email, String bio, String age, String gender,
        String height, String weight, String activityLevel, String photo) {}
}
