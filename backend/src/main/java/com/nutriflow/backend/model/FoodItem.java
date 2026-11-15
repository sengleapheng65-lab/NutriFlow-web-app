package com.nutriflow.backend.model;

import java.util.ArrayList;
import java.util.List;

// Food information we get back from a barcode lookup
// Nutrition values are per 100g
public class FoodItem {

    private String barcode;
    private String name;
    private String brand;
    private String servingSize;
    private String nutritionBasis;
    private int calories;
    private double protein;
    private double carbs;
    private double fat;
    private List<String> allergens;
    private Boolean vegan;
    private Boolean vegetarian;
    private List<String> warnings = new ArrayList<>();

    public FoodItem(
        String barcode,
        String name,
        String brand,
        String servingSize,
        String nutritionBasis,
        int calories,
        double protein,
        double carbs,
        double fat,
        List<String> allergens,
        Boolean vegan,
        Boolean vegetarian
    ) {
        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.servingSize = servingSize;
        this.nutritionBasis = nutritionBasis;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.allergens = allergens;
        this.vegan = vegan;
        this.vegetarian = vegetarian;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getName() {
        return name;
    }

    public String getBrand() {
        return brand;
    }

    public String getServingSize() {
        return servingSize;
    }

    public String getNutritionBasis() {
        return nutritionBasis;
    }

    public int getCalories() {
        return calories;
    }

    public double getProtein() {
        return protein;
    }

    public double getCarbs() {
        return carbs;
    }

    public double getFat() {
        return fat;
    }

    public List<String> getAllergens() {
        return allergens;
    }

    // true, false, or null when Open Food Facts doesn't know
    public Boolean getVegan() {
        return vegan;
    }

    public Boolean getVegetarian() {
        return vegetarian;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
