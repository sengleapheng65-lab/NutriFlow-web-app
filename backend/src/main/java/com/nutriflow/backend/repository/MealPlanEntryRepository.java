package com.nutriflow.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nutriflow.backend.model.MealPlanEntry;

public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {
    List<MealPlanEntry> findAllByUserIdAndPlanDateBetweenOrderByPlanDateAscIdAsc(Long userId, LocalDate start, LocalDate end);
    Optional<MealPlanEntry> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndPlanDate(Long userId, LocalDate planDate);
    long deleteAllByUserIdAndPlanDate(Long userId, LocalDate planDate);
}