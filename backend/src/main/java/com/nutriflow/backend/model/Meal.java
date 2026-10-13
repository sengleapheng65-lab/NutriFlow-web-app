package com.nutriflow.backend.model;

public class Meal {

    private Long id;
    private String name;
    private int calories;
    private double protein;
    private double fat;

    // Empty constructor required for converting JSON into a Meal
    public Meal() {
    }

    // Constructor for creating a complete meal
    public Meal(
        Long id,
        String name,
        int calories,
        double protein,
        double fat
    ) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.protein = protein;
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

    public double getFat() {
        return fat;
    }

    public void setFat(double fat) {
        this.fat = fat;
    }
}