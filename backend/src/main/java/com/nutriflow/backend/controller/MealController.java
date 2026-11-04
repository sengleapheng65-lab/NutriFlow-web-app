package com.nutriflow.backend.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.nutriflow.backend.model.Meal;
import com.nutriflow.backend.repository.MealRepository;
import com.nutriflow.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    // Meals are now saved in MySQL
    private final MealRepository mealRepository;
    private final UserRepository userRepository;

    public MealController(MealRepository mealRepository, UserRepository userRepository) {
        this.mealRepository = mealRepository;
        this.userRepository = userRepository;
    }

    // GET /api/meals
    @GetMapping
    public List<Meal> getMeals(Authentication authentication) {
        return mealRepository.findAllByUserEmailIgnoreCase(authentication.getName());
    }

    // POST /api/meals
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meal addMeal(@RequestBody Meal meal, Authentication authentication) {
        // Let MySQL create the ID
        meal.setId(null);

        // Give this meal its own creation timestamp
        meal.setCreatedAt(Instant.now());
        meal.setUser(userRepository.findByEmailIgnoreCase(authentication.getName()).orElseThrow());

        // Save the meal
        return mealRepository.save(meal);
    }

    // DELETE /api/meals/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id, Authentication authentication) {
        Meal meal = mealRepository.findById(id).orElseThrow();
        if (meal.getUser() == null || !meal.getUser().getEmail().equalsIgnoreCase(authentication.getName())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        mealRepository.delete(meal);
    }
}
