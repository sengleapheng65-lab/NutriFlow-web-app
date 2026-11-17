package com.nutriflow.backend.model;

import java.time.Instant;
import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "meal_plan_entry",
        indexes = @Index(name = "idx_meal_plan_entry_user_date", columnList = "user_id, plan_date"))

// Represents one scheduled meal and its separate prepared/eaten states.
public class MealPlanEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType;

    @Column(nullable = false)
    private String name;
    private int calories;
    private double protein;
    private double carbs;
    private double fat;
    private double servings = 1;
    @Column(length = 500)
    private String notes;
    private boolean prepared;
    private boolean eaten;
    private Long sourceMealId;
    private Instant createdAt;

    protected MealPlanEntry() {}

    public MealPlanEntry(User user, LocalDate planDate, String mealType) {
        this.user = user;
        this.planDate = planDate;
        this.mealType = mealType;
        this.createdAt = Instant.now();
    }

    public MealPlanEntry copyTo(LocalDate date) {
        MealPlanEntry copy = new MealPlanEntry(user, date, mealType);
        copy.name = name;
        copy.calories = calories;
        copy.protein = protein;
        copy.carbs = carbs;
        copy.fat = fat;
        copy.servings = servings;
        copy.notes = notes;
        copy.sourceMealId = sourceMealId;
        copy.prepared = false;
        copy.eaten = false;
        return copy;
    }

    //Getters and setters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDate getPlanDate() { return planDate; }
    public void setPlanDate(LocalDate planDate) { this.planDate = planDate; }
    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }
    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }
    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }
    public double getFat() { return fat; }
    public void setFat(double fat) { this.fat = fat; }
    public double getServings() { return servings; }
    public void setServings(double servings) { this.servings = servings; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isPrepared() { return prepared; }
    public void setPrepared(boolean prepared) { this.prepared = prepared; }
    public boolean isEaten() { return eaten; }
    public void setEaten(boolean eaten) { this.eaten = eaten; }
    public Long getSourceMealId() { return sourceMealId; }
    public void setSourceMealId(Long sourceMealId) { this.sourceMealId = sourceMealId; }
    public Instant getCreatedAt() { return createdAt; }
}
