package com.nutriflow.backend.model;
import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// @Entity makes this class a table in MySQL (table name: meal)
@Entity
public class Meal {

    // MySQL creates the ID automatically (1, 2, 3, ...)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int calories;
    private double protein;
    private double fat;
    private double carbs;
    private Instant createdAt;

    // Empty constructor required for converting JSON into a Meal
    public Meal() {
    }

    // Constructor for creating a complete meal
    public Meal(
        Long id,
        String name,
        int calories,
        double protein,
        double carbs,
        double fat
    ) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public double getProtein() {
        return protein;
    }

    public void setProtein(double protein) {
        this.protein = protein;
    }

    public double getCarbs() {
        return carbs;
    }

    public void setCarbs(double carbs) {
        this.carbs = carbs;
    }

    public double getFat() {
        return fat;
    }

    public void setFat(double fat) {
        this.fat = fat;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}