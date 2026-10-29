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

        // Package labels use serving values, so prefer them whenever the
        // database provides the full set. Fall back to its standard 100 g data.
        Double servingCalories = getNumberOrNull(nutriments, "energy-kcal_serving");
        Double servingProtein = getNumberOrNull(nutriments, "proteins_serving");
        Double servingCarbs = getNumberOrNull(nutriments, "carbohydrates_serving");
        Double servingFat = getNumberOrNull(nutriments, "fat_serving");
        boolean hasServingNutrition = servingCalories != null
                && servingProtein != null
                && servingCarbs != null
                && servingFat != null;

        double calories = hasServingNutrition ? servingCalories : getNumber(nutriments, "energy-kcal_100g");
        double protein = hasServingNutrition ? servingProtein : getNumber(nutriments, "proteins_100g");
        double carbs = hasServingNutrition ? servingCarbs : getNumber(nutriments, "carbohydrates_100g");
        double fat = hasServingNutrition ? servingFat : getNumber(nutriments, "fat_100g");
        String nutritionBasis = hasServingNutrition ? "per serving" : "per 100 g";

        return new FoodItem(
                barcode,
                name,
                brand,
                servingSize,
                nutritionBasis,
                (int) Math.round(calories),
                protein,
                carbs,
                fat);
    }

    // Get a number from nutriments, or 0 if it's missing
    private double getNumber(Map<String, Object> nutriments, String key) {
        Double value = getNumberOrNull(nutriments, key);
        return value == null ? 0 : value;
    }

    // Some food records serialize their nutrition values as strings.
    private Double getNumberOrNull(Map<String, Object> nutriments, String key) {
        Object value = nutriments.get(key);

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        if (value instanceof String stringValue) {
            try {
                return Double.parseDouble(stringValue);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }
}
