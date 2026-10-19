package com.nutriflow.backend.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nutriflow.backend.model.Meal;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealController {

    // Temporary storage until a database is connected
    private final List<Meal> meals = new ArrayList<>();

    // Generate a unique ID for each meal
    private final AtomicLong nextId = new AtomicLong(1);

    // GET /api/meals
    @GetMapping
    public List<Meal> getMeals() {
        return meals;
    }

    // POST /api/meals
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meal addMeal(@RequestBody Meal meal) {
        // Generate the ID
        meal.setId(nextId.getAndIncrement());

        // Give this meal its own creation timestamp
        meal.setCreatedAt(Instant.now());

        // Save the meal
        meals.add(meal);

        return meal;
    }

    // DELETE /api/meals/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id) {
        meals.removeIf(meal -> meal.getId().equals(id));
    }
}