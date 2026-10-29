package com.nutriflow.backend.controller;

import java.time.Instant;
import java.util.List;

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
import com.nutriflow.backend.repository.MealRepository;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealController {

    // Meals are now saved in MySQL
    private final MealRepository mealRepository;

    public MealController(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    // GET /api/meals
    @GetMapping
    public List<Meal> getMeals() {
        return mealRepository.findAll();
    }

    // POST /api/meals
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Meal addMeal(@RequestBody Meal meal) {
        // Let MySQL create the ID
        meal.setId(null);

        // Give this meal its own creation timestamp
        meal.setCreatedAt(Instant.now());

        // Save the meal
        return mealRepository.save(meal);
    }

    // DELETE /api/meals/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMeal(@PathVariable Long id) {
        mealRepository.deleteById(id);
    }
}
