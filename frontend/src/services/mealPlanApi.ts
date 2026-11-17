import type { Meal } from "../types/Meal";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// Every meal-plan request uses the same API prefix and the browser session cookie.

export type MealPlanTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type MealPlanEntry = {
  id: number;
  date: string;
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  notes: string | null;
  prepared: boolean;
  eaten: boolean;
  sourceMealId: number | null;
};

export type MealPlanDay = {
  date: string;
  dayOfWeek: string;
  entries: MealPlanEntry[];
  totals: MealPlanTotals;
};

export type MealPlan = {
  startDate: string;
  endDate: string;
  days: number;
  mealTypes: string[];
  plan: MealPlanDay[];
  totals: MealPlanTotals;
};

export type PrepItem = {
  name: string;
  sourceMealId: number | null;
  totalServings: number;
  preparedServings: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  dates: string[];
  entryIds: number[];
};

export type MealPlanDraft = {
  date: string;
  mealType: string;
  mealId?: number;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servings?: number;
  notes?: string;
  prepared?: boolean;
  eaten?: boolean;
};

function timeZoneHeaders() {
  // The backend uses the browser's timezone to decide which 14 days to return.
  return { "X-Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Keep response parsing in one place so backend validation messages reach the UI.
  const response = await fetch(`${API_URL}/meal-plan${path}`, {
    ...options,
    credentials: "include",
    headers: { ...timeZoneHeaders(), ...(options.headers || {}) },
  });
  if (!response.ok) {
    let message = `Meal planner request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // Keep the status-based fallback for non-JSON errors.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function getMealPlan() {
  // Loads the current 14-day window and its daily totals.
  return request<MealPlan>("");
}

export function addMealPlanEntry(draft: MealPlanDraft) {
  // Creates a planned meal, either from a saved meal or manual nutrition values.
  return request<MealPlanEntry>("/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
}

export function updateMealPlanEntry(id: number, draft: MealPlanDraft) {
  // Updates details or completion state without replacing the whole entry.
  return request<MealPlanEntry>(`/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
}

export function deleteMealPlanEntry(id: number) {
  return request<void>(`/entries/${id}`, { method: "DELETE" });
}

export function clearMealPlanDay(date: string) {
  return request<void>(`/days/${date}`, { method: "DELETE" });
}

export function repeatMealPlanEntry(id: number, dates: string[]) {
  return request<MealPlanEntry[]>(`/entries/${id}/repeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dates }),
  });
}

export function getPrepList(from?: string, to?: string) {
  // Groups planned meals into a kitchen-friendly preparation list.
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return request<{ from: string; to: string; items: PrepItem[] }>(
    `/prep-list${params.toString() ? `?${params}` : ""}`,
  );
}

export type { Meal };
