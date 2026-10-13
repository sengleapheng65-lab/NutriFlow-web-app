import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Meal } from "../types/Meal";
import "../styles/Dashboard.css";

// Temporary daily nutrition goals
const calorieGoal = 2000;
const proteinGoal = 120;
const fatGoal = 65;

function Dashboard() {
  // Load saved meals from localStorage
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const storedMeals = localStorage.getItem("meals");
      const parsedMeals = storedMeals ? JSON.parse(storedMeals) : [];

      return Array.isArray(parsedMeals) ? parsedMeals : [];
    } catch {
      return [];
    }
  });

  // Calculate the total calories
  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

  // Calculate the total protein
  const totalProtein = meals.reduce((total, meal) => total + meal.protein, 0);

  // Older saved meals might not contain fat
  const totalFat = meals.reduce((total, meal) => total + (meal.fat ?? 0), 0);

  // Calculate progress percentages
  const calorieProgress = Math.min(
    Math.round((totalCalories / calorieGoal) * 100),
    100,
  );

  const proteinProgress = Math.min(
    Math.round((totalProtein / proteinGoal) * 100),
    100,
  );

  const fatProgress = Math.min(Math.round((totalFat / fatGoal) * 100), 100);

  // Prevent the remaining calories from becoming negative
  const remainingCalories = Math.max(calorieGoal - totalCalories, 0);

  // Display today's date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Delete a selected meal
  function deleteMeal(mealId: number) {
    const updatedMeals = meals.filter((meal) => meal.id !== mealId);

    setMeals(updatedMeals);
    localStorage.setItem("meals", JSON.stringify(updatedMeals));
  }

  // Pass the calorie percentage to the CSS progress circle
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

      {/* Daily nutrition summary */}
      <section className="dashboard-overview">
        {/* Calorie summary */}
        <article className="calorie-card">
          <div className="calorie-details">
            <p>Daily calories</p>

            <h2>
              {totalCalories > calorieGoal
                ? "You passed your daily goal"
                : "You’re making good progress"}
            </h2>

            <div className="calorie-total">
              <strong>{totalCalories.toLocaleString()}</strong>

              <span>of {calorieGoal.toLocaleString()} kcal</span>
            </div>

            <p className="remaining-calories">
              {totalCalories > calorieGoal
                ? `${totalCalories - calorieGoal} calories over your goal`
                : `${remainingCalories} calories remaining today`}
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

        {/* Protein, fat and meal totals */}
        <div className="dashboard-stats">
          {/* Protein */}
          <article className="dashboard-stat-card">
            <div className="stat-icon protein-icon">
              <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Protein</span>

              <strong>
                {totalProtein} / {proteinGoal}g
              </strong>

              <div className="stat-progress protein-progress">
                <div style={{ width: `${proteinProgress}%` }} />
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
                {totalFat} / {fatGoal}g
              </strong>

              <div className="stat-progress fat-progress">
                <div style={{ width: `${fatProgress}%` }} />
              </div>
            </div>
          </article>

          {/* Number of meals */}
          <article className="dashboard-stat-card">
            <div className="stat-icon meal-count-icon">
              <i className="bi bi-egg-fried" aria-hidden="true" />
            </div>

            <div className="stat-content">
              <span>Meals logged</span>

              <strong>
                {meals.length} {meals.length === 1 ? "meal" : "meals"}
              </strong>
            </div>
          </article>
        </div>
      </section>

      {/* Meal history */}
      <section className="dashboard-meals-section">
        <div className="meals-heading">
          <div>
            <h2>Today’s Meals</h2>
            <p>Your meals and nutrition information.</p>
          </div>

          <span>
            {meals.length} {meals.length === 1 ? "meal" : "meals"}
          </span>
        </div>

        {/* Show an empty message when there are no meals */}
        {meals.length === 0 ? (
          <div className="empty-meals">
            <div className="empty-meals-icon">
              <i className="bi bi-egg-fried" aria-hidden="true" />
            </div>

            <h3>No meals logged yet</h3>
            <p>Add your first meal to begin tracking.</p>

            <Link to="/add-meal">Add Your First Meal</Link>
          </div>
        ) : (
          <div className="dashboard-meal-list">
            {meals.map((meal, index) => (
              <article className="dashboard-meal-card" key={meal.id}>
                <div className="meal-card-icon">
                  <i className="bi bi-egg-fried" aria-hidden="true" />
                </div>

                <div className="meal-card-information">
                  <h3>{meal.name}</h3>
                  <p>Meal {index + 1}</p>
                </div>

                <div className="meal-nutrition">
                  <div>
                    <strong>{meal.calories}</strong>
                    <span>Calories</span>
                  </div>

                  <div>
                    <strong>{meal.protein}g</strong>
                    <span>Protein</span>
                  </div>

                  <div>
                    <strong>{meal.fat ?? 0}g</strong>
                    <span>Fat</span>
                  </div>
                </div>

                <button
                  className="delete-meal-button"
                  type="button"
                  onClick={() => deleteMeal(meal.id)}
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
