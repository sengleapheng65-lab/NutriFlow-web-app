import type { Meal } from "../types/Meal";

// Use localhost on the Mac and the Mac's network address on the iPad
const BACKEND_HOST = window.location.hostname;
const MEAL_API_URL = `http://${BACKEND_HOST}:8080/api/meals`;
const FOOD_API_URL = `http://${BACKEND_HOST}:8080/api/foods`;

// Information entered when creating a meal
type NewMeal = Omit<Meal, "id" | "createdAt">;

export type BarcodeFood = {
  barcode: string;
  name: string;
  brand?: string;
  servingSize?: string;
  nutritionBasis?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type OpenFoodFactsProduct = {
  product_name?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: Record<string, number | string | undefined>;
};

function numberFromNutriments(
  nutriments: Record<string, number | string | undefined>,
  key: string,
) {
  const value = Number(nutriments[key]);
  return Number.isFinite(value) ? value : undefined;
}

function toBarcodeFood(
  barcode: string,
  product: OpenFoodFactsProduct,
): BarcodeFood | null {
  const nutrients = product.nutriments;

  if (!nutrients) return null;

  const servingValues = {
    calories: numberFromNutriments(nutrients, "energy-kcal_serving"),
    protein: numberFromNutriments(nutrients, "proteins_serving"),
    carbs: numberFromNutriments(nutrients, "carbohydrates_serving"),
    fat: numberFromNutriments(nutrients, "fat_serving"),
  };
  const hasServingValues = Object.values(servingValues).every(
    (value) => value !== undefined,
  );
  const values = hasServingValues
    ? servingValues
    : {
        calories:
          numberFromNutriments(nutrients, "energy-kcal_100g") ??
          numberFromNutriments(nutrients, "energy-kcal"),
        protein: numberFromNutriments(nutrients, "proteins_100g"),
        carbs: numberFromNutriments(nutrients, "carbohydrates_100g"),
        fat: numberFromNutriments(nutrients, "fat_100g"),
      };

  if (Object.values(values).some((value) => value === undefined)) return null;

  return {
    barcode,
    name: product.product_name || "Unknown product",
    brand: product.brands,
    servingSize: product.serving_size,
    nutritionBasis: hasServingValues ? "per serving" : "per 100 g",
    calories: values.calories!,
    protein: values.protein!,
    carbs: values.carbs!,
    fat: values.fat!,
  };
}

export async function getFoodByBarcode(barcode: string): Promise<BarcodeFood> {
  try {
    const response = await fetch(
      `${FOOD_API_URL}/barcode/${encodeURIComponent(barcode)}`,
    );

    if (response.ok) return response.json();
  } catch {
    // A deployed frontend cannot reach a local development backend.
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
  );

  if (!response.ok) throw new Error(`Could not find food. Status: ${response.status}`);

  const data = (await response.json()) as {
    status?: number;
    product?: OpenFoodFactsProduct;
  };
  const food = data.status === 1 && data.product
    ? toBarcodeFood(barcode, data.product)
    : null;

  if (!food) throw new Error("This product has incomplete nutrition data.");

  return food;
}

// Get every meal from the backend
export async function getMeals(): Promise<Meal[]> {
  const response = await fetch(MEAL_API_URL);

  if (!response.ok) {
    throw new Error("Could not load meals.");
  }

  return response.json();
}

// Send a new meal to the backend
export async function createMeal(meal: NewMeal): Promise<Meal> {
  const response = await fetch(MEAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meal),
  });

  if (!response.ok) {
    throw new Error(`Could not save meal. Status: ${response.status}`);
  }

  return response.json();
}

// Delete a meal from the backend
export async function deleteMeal(id: number): Promise<void> {
  const response = await fetch(`${MEAL_API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Could not delete meal.");
  }
}
