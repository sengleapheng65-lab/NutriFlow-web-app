package com.nutriflow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutriflow.backend.model.Meal;

// Spring creates the database code for us
// (save, findAll, deleteById, ...)
public interface MealRepository extends JpaRepository<Meal, Long> {
}
