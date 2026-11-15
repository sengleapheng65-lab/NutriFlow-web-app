package com.nutriflow.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

import com.nutriflow.backend.model.FoodItem;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.UserRepository;
import com.nutriflow.backend.service.FoodLookupService;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodLookupService foodLookupService;
    private final UserRepository userRepository;

    public FoodController(FoodLookupService foodLookupService, UserRepository userRepository) {
        this.foodLookupService = foodLookupService;
        this.userRepository = userRepository;
    }

    // GET /api/foods/barcode/{barcode}
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Object> getFoodByBarcode(@PathVariable String barcode, Authentication authentication) {
        // Barcodes should be 8 to 14 numbers
        if (!barcode.matches("[0-9]{8,14}")) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid barcode"));
        }

        FoodItem food;

        try {
            food = foodLookupService.findByBarcode(barcode);
        } catch (RestClientException e) {
            // Open Food Facts is down or not responding
            return ResponseEntity.status(502).body(Map.of("message", "Food lookup service unavailable"));
        }

        if (food == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Food not found"));
        }

        // Check the food against the signed-in user's diet and allergy restrictions
        if (authentication != null) {
            List<String> restrictions = userRepository.findByEmailIgnoreCase(authentication.getName())
                    .map(User::getDietaryRestrictions)
                    .orElse(List.of());
            food.setWarnings(findWarnings(food, restrictions));
        }

        return ResponseEntity.ok(food);
    }

    // Make a warning for each restriction this food breaks
    // Unknown vegan/vegetarian status does not make a warning
    private List<String> findWarnings(FoodItem food, List<String> restrictions) {
        List<String> warnings = new ArrayList<>();

        for (String restriction : restrictions) {
            if (restriction.equals("vegan")) {
                if (Boolean.FALSE.equals(food.getVegan())) {
                    warnings.add("Not vegan");
                }
            } else if (restriction.equals("vegetarian")) {
                if (Boolean.FALSE.equals(food.getVegetarian())) {
                    warnings.add("Not vegetarian");
                }
            } else if (food.getAllergens().contains(restriction)) {
                warnings.add("Contains " + restriction.replace("-", " "));
            }
        }

        return warnings;
    }
}
