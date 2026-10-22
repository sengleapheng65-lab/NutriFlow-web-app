package com.nutriflow.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import com.nutriflow.backend.model.FoodItem;

@Service
public class FoodLookupService {

    private final RestClient restClient = RestClient.create();

    // Look up a food by its barcode using Open Food Facts
    // Returns null if the food is not found
    public FoodItem findByBarcode(String barcode) {
        String url = "https://world.openfoodfacts.org/api/v2/product/" + barcode + ".json";

        Map<String, Object> response;

        try {
            response = restClient.get()
                    .uri(url)
                    // Open Food Facts asks apps to send their name
                    .header("User-Agent", "NutriFlow/0.1 (SJSU CS160 student project)")
                    .retrieve()
                    .body(Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            // They send 404 when the barcode is not in their database
            return null;
        }

        if (response == null) {
            return null;
        }

        // status is 1 when the product was found
        Number status = (Number) response.get("status");
        if (status == null || status.intValue() != 1) {
            return null;
        }

        Map<String, Object> product = (Map<String, Object>) response.get("product");
        if (product == null) {
            return null;
        }

        String name = (String) product.get("product_name");
        if (name == null || name.isEmpty()) {
            name = "Unknown product";
        }

        String brand = (String) product.get("brands");
        String servingSize = (String) product.get("serving_size");

        // Nutrition info is inside "nutriments"
        Map<String, Object> nutriments = (Map<String, Object>) product.get("nutriments");
        if (nutriments == null) {
            nutriments = new HashMap<>();
        }

        double calories = getNumber(nutriments, "energy-kcal_100g");
        double protein = getNumber(nutriments, "proteins_100g");
        double carbs = getNumber(nutriments, "carbohydrates_100g");
        double fat = getNumber(nutriments, "fat_100g");

        return new FoodItem(barcode, name, brand, servingSize, (int) calories, protein, carbs, fat);
    }

    // Get a number from nutriments, or 0 if it's missing
    private double getNumber(Map<String, Object> nutriments, String key) {
        Object value = nutriments.get(key);

        if (value == null) {
            return 0;
        }

        return ((Number) value).doubleValue();
    }
}
