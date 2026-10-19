import type { Meal } from "../types/Meal";

// Use localhost on the Mac and the Mac's network address on the iPad
const BACKEND_HOST = window.location.hostname;
const MEAL_API_URL = `http://${BACKEND_HOST}:8080/api/meals`;

// Information entered when creating a meal
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
