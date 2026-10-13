package com.nutriflow.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.nutriflow.backend.model.Meal;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173")
public class MealController {

    // Temporary meal storage
    private final List<Meal> meals = new ArrayList<>();

    // Generates unique meal IDs
    private final AtomicLong nextId = new AtomicLong(1);

    // Return all meals
    @GetMapping
    public List<Meal> getMeals() {
        return meals;
    }

    // Add a new meal
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meal addMeal(@RequestBody Meal meal) {
        meal.setId(nextId.getAndIncrement());
        meals.add(meal);
        return meal;
    }

    // Delete a meal
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id) {
        meals.removeIf(meal -> meal.getId().equals(id));
    }
}