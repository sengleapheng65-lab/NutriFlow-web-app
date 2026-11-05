package com.nutriflow.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
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

        JsonNode response;

        try {
            response = restClient.get()
                    .uri(url)
                    // Open Food Facts asks apps to send their name
                    .header("User-Agent", "NutriFlow/0.1 (SJSU CS160 student project)")
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpClientErrorException.NotFound e) {
            // They send 404 when the barcode is not in their database
            return null;
        }

        if (response == null) {
            return null;
        }

        // status is 1 when the product was found
        if (response.path("status").asInt() != 1) {
            return null;
        }

        JsonNode product = response.path("product");
        if (!product.isObject()) {
            return null;
        }

        String name = textOrNull(product, "product_name");
        if (name == null || name.isEmpty()) {
            name = "Unknown product";
        }

        String brand = textOrNull(product, "brands");
        String servingSize = textOrNull(product, "serving_size");

        // Nutrition info is inside "nutriments"
        JsonNode nutriments = product.path("nutriments");

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

        double calories = hasServingNutrition ? getNumber(nutriments, "energy-kcal_serving") : getNumber(nutriments, "energy-kcal_100g");
        double protein = hasServingNutrition ? getNumber(nutriments, "proteins_serving") : getNumber(nutriments, "proteins_100g");
        double carbs = hasServingNutrition ? getNumber(nutriments, "carbohydrates_serving") : getNumber(nutriments, "carbohydrates_100g");
        double fat = hasServingNutrition ? getNumber(nutriments, "fat_serving") : getNumber(nutriments, "fat_100g");
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
    private double getNumber(JsonNode nutriments, String key) {
        Double value = getNumberOrNull(nutriments, key);
        return value == null ? 0 : value.doubleValue();
    }

    // Some food records serialize their nutrition values as strings.
    private Double getNumberOrNull(JsonNode nutriments, String key) {
        JsonNode value = nutriments.get(key);
        if (value == null || value.isNull()) return null;
        if (value.isNumber()) return value.doubleValue();
        if (!value.isTextual()) return null;
        try {
            return Double.parseDouble(value.textValue());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String textOrNull(JsonNode object, String key) {
        JsonNode value = object.get(key);
        return value == null || value.isNull() || !value.isTextual() ? null : value.textValue();
    }
}
