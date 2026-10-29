package com.nutriflow.backend.model;

// Food information we get back from a barcode lookup
// Nutrition values are per 100g
public class FoodItem {

    private String barcode;
    private String name;
    private String brand;
    private String servingSize;
    private int calories;
    private double protein;
    private double carbs;
    private double fat;

    public FoodItem(
        String barcode,
        String name,
        String brand,
        String servingSize,
        int calories,
        double protein,
        double carbs,
        double fat
    ) {
        this.barcode = barcode;
        this.name = name;
        this.brand = brand;
        this.servingSize = servingSize;
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
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
}
