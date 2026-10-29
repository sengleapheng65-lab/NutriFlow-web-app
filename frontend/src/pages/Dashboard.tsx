import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { Link } from "react-router-dom";

import type { Meal } from "../types/Meal";
import { deleteMeal as deleteMealFromApi, getMeals } from "../services/mealApi";

import "../styles/Dashboard.css";

// Daily Nutrition Goal Setting setup
// Describes the user's daily nutrition goals
type NutritionGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Goals used when the user has not saved custom settings
const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

// Load the nutrition goals saved by the Settings page
function loadNutritionGoals(): NutritionGoals {
  try {
    const savedGoals = localStorage.getItem("nutritionGoals");

    if (!savedGoals) {
      return defaultGoals;
    }

    const parsedGoals = JSON.parse(savedGoals);

    return {
      calories: Number(parsedGoals.calories) || defaultGoals.calories,
      protein: Number(parsedGoals.protein) || defaultGoals.protein,
      carbs: Number(parsedGoals.carbs) || defaultGoals.carbs,
      fat: Number(parsedGoals.fat) || defaultGoals.fat,
    };
  } catch {
    return defaultGoals;
  }
}

// Create a date key using the user's local timezone
function getLocalDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayRounded(value: number) {
  return Math.round(value);
}

function Dashboard() {
  // All meals returned by Spring Boot
  const [meals, setMeals] = useState<Meal[]>([]);

  // Track loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Track the current local date
  const [todayKey, setTodayKey] = useState(() => getLocalDateKey(new Date()));

  // Load the nutrition goals from Settings
  const [goals] = useState<NutritionGoals>(() => loadNutritionGoals());

  // Load meals when the Dashboard opens
  useEffect(() => {
    async function loadMeals() {
      try {
        setError("");

        // GET /api/meals
        const backendMeals = await getMeals();

        setMeals(backendMeals);
      } catch (requestError) {
        console.error(requestError);

        setError(
          "Could not load meals. Make sure the Spring Boot backend is running.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMeals();
  }, []);

  // Check every minute to determine whether a new day started
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTodayKey(getLocalDateKey(new Date()));
    }, 60_000);

    // Stop the timer when the Dashboard closes
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // Only include meals created today
  const todayMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (!meal.createdAt) {
        return false;
      }

      const mealDate = new Date(meal.createdAt);

      if (Number.isNaN(mealDate.getTime())) {
        return false;
      }

      return getLocalDateKey(mealDate) === todayKey;
    });
  }, [meals, todayKey]);

  // Calculate today's calories
  const totalCalories = todayMeals.reduce(
    (total, meal) => total + (meal.calories ?? 0),
    0,
  );

  // Calculate today's protein
  const totalProtein = todayMeals.reduce(
    (total, meal) => total + (meal.protein ?? 0),
    0,
  );

  // Calculate today's carbohydrates
  const totalCarbs = todayMeals.reduce(
    (total, meal) => total + (meal.carbs ?? 0),
    0,
  );

  // Calculate today's fat
  const totalFat = todayMeals.reduce(
    (total, meal) => total + (meal.fat ?? 0),
    0,
  );

  // Calculate progress percentages
  const calorieProgress = Math.min(
    Math.round((totalCalories / goals.calories) * 100),
    100,
  );

  const proteinProgress = Math.min(
    Math.round((totalProtein / goals.protein) * 100),
    100,
  );

  const carbProgress = Math.min(
    Math.round((totalCarbs / goals.carbs) * 100),
    100,
  );

  const fatProgress = Math.min(Math.round((totalFat / goals.fat) * 100), 100);

  // Prevent remaining calories from becoming negative
  const remainingCalories = Math.max(goals.calories - totalCalories, 0);

  // Display today's date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Delete a selected meal
  async function handleDeleteMeal(mealId: number) {
    try {
      setError("");

      // DELETE /api/meals/{id}
      await deleteMealFromApi(mealId);

      // Remove it from the frontend after deletion
      setMeals((currentMeals) =>
        currentMeals.filter((meal) => meal.id !== mealId),
      );
    } catch (requestError) {
      console.error(requestError);

      setError("Could not delete the meal. Make sure the backend is running.");
    }
  }

  // Send the calorie percentage to the CSS circle
  const calorieRingStyle = {
    "--calorie-progress": `${calorieProgress * 3.6}deg`,
  } as CSSProperties;

  return (
    <main className="dashboard-main">
      {/* Dashboard heading */}
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">{currentDate}</p>

          <h1>Nutrition Dashboard</h1>

          <p>A simple view of your nutrition progress today.</p>
        </div>

        <Link className="dashboard-add-button" to="/add-meal">
          <i className="bi bi-plus-lg" aria-hidden="true" />

          <span>Add Meal</span>
        </Link>
      </header>

      {/* Display a backend error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Daily nutrition summary */}
      <section className="dashboard-overview">
        {/* Calorie summary */}
        <article className="calorie-card">
          <div className="calorie-details">
            <p>Daily calories</p>

            <h2>
              {totalCalories > goals.calories
                ? "You passed your daily goal"
                : "You’re making good progress"}
            </h2>

            <div className="calorie-total">
              <strong>{displayRounded(totalCalories).toLocaleString()}</strong>

              <span>of {goals.calories.toLocaleString()} kcal</span>
            </div>

            <p className="remaining-calories">
              {totalCalories > goals.calories
                ? `${displayRounded(totalCalories - goals.calories)} calories over your goal`
                : `${displayRounded(remainingCalories)} calories remaining today`}
            </p>
          </div>

          {/* Calorie progress circle */}
          <div
            className="calorie-ring"
            style={calorieRingStyle}
            aria-label={`${calorieProgress}% completed`}
          >
            <div className="calorie-ring-center">
              <strong>{calorieProgress}%</strong>
              <span>completed</span>
            </div>
          </div>
        </article>

        {/* Daily nutrition statistics */}
        <div className="dashboard-stats">
          {/* Protein */}
          <article className="dashboard-stat-card">
            <div className="stat-icon protein-icon">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Protein</span>

              <strong>
                {displayRounded(totalProtein)} / {goals.protein}g
              </strong>

              <div className="stat-progress protein-progress">
                <div
                  style={{
                    width: `${proteinProgress}%`,
                  }}
                />
              </div>
            </div>
          </article>

          {/* Carbohydrates */}
          <article className="dashboard-stat-card">
            <div className="stat-icon carb-icon">
              <i className="bi bi-circle-half" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Carbohydrates</span>

              <strong>
                {displayRounded(totalCarbs)} / {goals.carbs}g
              </strong>

              <div className="stat-progress carb-progress">
                <div
                  style={{
                    width: `${carbProgress}%`,
                  }}
                />
              </div>
            </div>
          </article>

          {/* Fat */}
          <article className="dashboard-stat-card">
            <div className="stat-icon fat-icon">
              <i className="bi bi-droplet-fill" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Fat</span>

              <strong>
                {displayRounded(totalFat)} / {goals.fat}g
              </strong>

              <div className="stat-progress fat-progress">
                <div
                  style={{
                    width: `${fatProgress}%`,
                  }}
                />
              </div>
            </div>
          </article>

          {/* Number of meals */}
          <article className="dashboard-stat-card">
            <div className="stat-icon meal-count-icon">
              <i className="bi bi-egg-fried" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Meals logged today</span>

              <strong>
                {todayMeals.length} {todayMeals.length === 1 ? "meal" : "meals"}
              </strong>
            </div>
          </article>
        </div>
      </section>

      {/* Today's meal list */}
      <section className="dashboard-meals-section">
        <div className="meals-heading">
          <div>
            <h2>Today’s Meals</h2>

            <p>Meals logged for {currentDate}.</p>
          </div>

          <span>
            {todayMeals.length} {todayMeals.length === 1 ? "meal" : "meals"}
          </span>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="empty-meals">
            <div className="empty-meals-icon">
              <i className="bi bi-arrow-repeat" aria-hidden="true" />
            </div>

            <h3>Loading meals...</h3>

            <p>Please wait while your meals are loaded.</p>
          </div>
        ) : todayMeals.length === 0 ? (
          /* Empty state */
          <div className="empty-meals">
            <div className="empty-meals-icon">
              <i className="bi bi-egg-fried" aria-hidden="true" />
            </div>

            <h3>No meals logged today</h3>

            <p>Add your first meal for today to begin tracking.</p>

            <Link to="/add-meal">Add Your First Meal</Link>
          </div>
        ) : (
          /* Today's meal cards */
          <div className="dashboard-meal-list">
            {todayMeals.map((meal, index) => (
              <article className="dashboard-meal-card" key={meal.id}>
                <div className="meal-card-icon">
                  <i className="bi bi-egg-fried" aria-hidden="true" />
                </div>

                <div className="meal-card-information">
                  <h3>{meal.name}</h3>

                  <p>Meal {index + 1}</p>
                </div>

                <div className="meal-nutrition">
                  {/* Calories */}
                  <div>
                    <strong>{displayRounded(meal.calories ?? 0)}</strong>

                    <span>Calories</span>
                  </div>

                  {/* Protein */}
                  <div>
                    <strong>{displayRounded(meal.protein ?? 0)}g</strong>

                    <span>Protein</span>
                  </div>

                  {/* Carbohydrates */}
                  <div>
                    <strong>{displayRounded(meal.carbs ?? 0)}g</strong>

                    <span>Carbs</span>
                  </div>

                  {/* Fat */}
                  <div>
                    <strong>{displayRounded(meal.fat ?? 0)}g</strong>

                    <span>Fat</span>
                  </div>
                </div>

                {/* Delete meal */}
                <button
                  className="delete-meal-button"
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
        )}
      </section>
    </main>
  );
}

export default Dashboard;
