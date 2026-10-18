import type { Meal } from "../types/Meal";

// Address of the Spring Boot Meal API
const MEAL_API_URL = "http://localhost:8080/api/meals";

// Information entered by the user when creating a meal.
// Spring Boot creates the ID and creation date.
type NewMeal = Omit<Meal, "id" | "createdAt">;

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
    throw new Error("Could not save meal.");
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
