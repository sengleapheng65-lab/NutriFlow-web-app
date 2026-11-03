import { useEffect, useMemo, useState } from "react";

import MacroIcon from "../components/MacroIcon";
import type { Meal } from "../types/Meal";
import { deleteMeal as deleteMealFromApi, getMeals } from "../services/mealApi";

import "../styles/History.css";

type SortOption = "newest" | "oldest" | "highest-calories" | "lowest-calories";

// Convert a meal timestamp into a number for sorting
function getMealTime(meal: Meal) {
  const time = new Date(meal.createdAt).getTime();

  // Put meals with invalid dates at the end
  return Number.isNaN(time) ? 0 : time;
}

// Format the saved timestamp for display
function formatMealDate(createdAt?: string | null) {
  if (!createdAt) {
    return "Date unavailable";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getHistoryDateKey(createdAt?: string | Date | null) {
  if (!createdAt) return "unknown-date";

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "unknown-date";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatHistoryDateHeading(dateKey: string) {
  if (dateKey === "unknown-date") return "Date unavailable";

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayKey = getHistoryDateKey(today);
  const yesterdayKey = getHistoryDateKey(yesterday);

  if (dateKey === todayKey) return "Today";
  if (dateKey === yesterdayKey) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(target * easedProgress);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return value;
}

function History() {
  // Meals returned by Spring Boot
  const [meals, setMeals] = useState<Meal[]>([]);

  // Search, sorting and request states
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load meals when the page opens
  useEffect(() => {
    async function loadMeals() {
      try {
        setError("");

        const backendMeals = await getMeals();
        setMeals(backendMeals);
      } catch {
        setError(
          "Could not load your meal history. Make sure the backend is running.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMeals();
  }, []);

  // Search and sort meals
  const displayedMeals = useMemo(() => {
    const filteredMeals = meals.filter((meal) =>
      meal.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    return [...filteredMeals].sort((firstMeal, secondMeal) => {
      switch (sortOption) {
        case "oldest":
          return getMealTime(firstMeal) - getMealTime(secondMeal);

        case "highest-calories":
          return secondMeal.calories - firstMeal.calories;

        case "lowest-calories":
          return firstMeal.calories - secondMeal.calories;

        case "newest":
        default:
          return getMealTime(secondMeal) - getMealTime(firstMeal);
      }
    });
  }, [meals, search, sortOption]);

  const groupedMeals = useMemo(() => {
    const groups = new Map<string, Meal[]>();

    displayedMeals.forEach((meal) => {
      const dateKey = getHistoryDateKey(meal.createdAt);
      const existingMeals = groups.get(dateKey) || [];
      groups.set(dateKey, [...existingMeals, meal]);
    });

    return Array.from(groups, ([dateKey, groupMeals]) => ({
      dateKey,
      meals: groupMeals,
    }));
  }, [displayedMeals]);

  // Calculate history totals
  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

  const totalProtein = meals.reduce((total, meal) => total + meal.protein, 0);

  const totalCarbs = meals.reduce(
    (total, meal) => total + (meal.carbs ?? 0),
    0,
  );

  const totalFat = meals.reduce((total, meal) => total + meal.fat, 0);

  const animatedTotalCalories = useCountUp(totalCalories);
  const animatedTotalProtein = useCountUp(totalProtein);
  const animatedTotalCarbs = useCountUp(totalCarbs);
  const animatedTotalFat = useCountUp(totalFat);

  // Delete a meal from Spring Boot
  async function handleDeleteMeal(mealId: number) {
    try {
      setError("");

      await deleteMealFromApi(mealId);

      setMeals((currentMeals) =>
        currentMeals.filter((meal) => meal.id !== mealId),
      );
    } catch {
      setError("Could not delete the selected meal.");
    }
  }

  return (
    <main className="history-main">
      {/* Page heading */}
      <header className="history-header">
        <div>
          <p className="history-label">Nutrition records</p>

          <h1>Meal History</h1>

          <p>Review and manage your previously logged meals.</p>
        </div>

        <div className="history-count">
          <i className="bi bi-clock-history" aria-hidden="true" />

          <div>
            <strong>{meals.length}</strong>

            <span>{meals.length === 1 ? "meal" : "meals"} logged</span>
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Nutrition totals */}
      <section className="history-summary">
        {/* Calories */}
        <article>
          <div className="history-summary-icon calories">
            <i className="bi bi-fire" aria-hidden="true" />
          </div>

          <div>
            <span>Total calories</span>
            <strong>{Math.round(animatedTotalCalories).toLocaleString()} kcal</strong>
          </div>
        </article>

        {/* Protein */}
        <article>
          <div className="history-summary-icon protein">
            <MacroIcon type="protein" />
          </div>

          <div>
            <span>Total protein</span>
            <strong>{Math.round(animatedTotalProtein)}g</strong>
          </div>
        </article>

        {/* Carbohydrates */}
        <article>
          <div className="history-summary-icon carbs">
            <MacroIcon type="carbs" />
          </div>

          <div>
            <span>Total carbohydrates</span>
            <strong>{Math.round(animatedTotalCarbs)}g</strong>
          </div>
        </article>

        {/* Fat */}
        <article>
          <div className="history-summary-icon fat">
            <MacroIcon type="fat" />
          </div>

          <div>
            <span>Total fat</span>
            <strong>{Math.round(animatedTotalFat)}g</strong>
          </div>
        </article>
      </section>

      {/* History list */}
      <section className="history-card">
        <div className="history-card-heading">
          <div>
            <h2>Logged Meals</h2>

            <p>Search or sort your nutrition records.</p>
          </div>

          <div className="history-controls">
            {/* Search */}
            <label className="history-search">
              <i className="bi bi-search" aria-hidden="true" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search meals"
                aria-label="Search meals"
              />
            </label>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value as SortOption)
              }
              aria-label="Sort meals"
            >
              <option value="newest">Newest first</option>

              <option value="oldest">Oldest first</option>

              <option value="highest-calories">Highest calories</option>

              <option value="lowest-calories">Lowest calories</option>
            </select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="history-empty">
            <i className="bi bi-arrow-repeat" aria-hidden="true" />

            <h3>Loading history...</h3>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && displayedMeals.length === 0 && (
          <div className="history-empty">
            <i className="bi bi-journal-x" aria-hidden="true" />

            <h3>{search ? "No matching meals" : "No meal history yet"}</h3>

            <p>
              {search
                ? "Try searching for a different meal."
                : "Meals you add will appear here."}
            </p>
          </div>
        )}

        {/* Meal records */}
        {!isLoading && displayedMeals.length > 0 && (
          <div className="history-groups">
            {groupedMeals.map((group) => (
              <section className="history-date-group" key={group.dateKey}>
                <div className="history-date-heading">
                  <div>
                    <i className="bi bi-calendar3" aria-hidden="true" />
                    <h3>{formatHistoryDateHeading(group.dateKey)}</h3>
                  </div>
                  <span>{group.meals.length} {group.meals.length === 1 ? "meal" : "meals"}</span>
                </div>

                <div className="history-list">
                  {group.meals.map((meal) => (
                    <article className="history-meal" key={meal.id}>
                <div className="history-meal-icon">
                  {meal.photo ? (
                    <img src={meal.photo} alt={`${meal.name} meal`} />
                  ) : (
                    <i className="bi bi-egg-fried" aria-hidden="true" />
                  )}
                </div>

                <div className="history-meal-name">
                  <h3>{meal.name}</h3>

                  {/* Display this meal's saved date */}
                  <span className="history-meal-date">
                    <i className="bi bi-calendar3" aria-hidden="true" />

                    {formatMealDate(meal.createdAt)}
                  </span>
                </div>

                <div className="history-nutrients">
                  <span>
                    <strong>{meal.calories}</strong>
                    kcal
                  </span>

                  <span>
                    <strong>{meal.protein}g</strong>
                    protein
                  </span>

                  <span>
                    <strong>{meal.carbs ?? 0}g</strong>
                    carbs
                  </span>

                  <span>
                    <strong>{meal.fat}g</strong>
                    fat
                  </span>
                </div>

                <button
                  className="history-delete"
                  type="button"
                  onClick={() => void handleDeleteMeal(meal.id)}
                  aria-label={`Delete ${meal.name}`}
                  title={`Delete ${meal.name}`}
                >
                  <i className="bi bi-trash3" aria-hidden="true" />
                </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default History;
