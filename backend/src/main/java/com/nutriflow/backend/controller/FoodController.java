package com.nutriflow.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

import com.nutriflow.backend.model.FoodItem;
import com.nutriflow.backend.service.FoodLookupService;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodLookupService foodLookupService;

    public FoodController(FoodLookupService foodLookupService) {
        this.foodLookupService = foodLookupService;
    }

    // GET /api/foods/barcode/{barcode}
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Object> getFoodByBarcode(@PathVariable String barcode) {
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

        return ResponseEntity.ok(food);
    }
}
