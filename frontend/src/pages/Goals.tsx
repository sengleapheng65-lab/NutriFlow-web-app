import { useState, type FormEvent } from "react";

import "../styles/Goals.css";

// Structure of the user's daily nutrition goals
export type NutritionGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Default goals used when no settings have been saved
const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

function Goals() {
  // Load previously saved goals
  const [goals, setGoals] = useState<NutritionGoals>(() => {
    try {
      const savedGoals = localStorage.getItem("nutritionGoals");

      return savedGoals ? JSON.parse(savedGoals) : defaultGoals;
    } catch {
      return defaultGoals;
    }
  });

  const [message, setMessage] = useState("");

  // Update one goal when an input changes
  function updateGoal(goalName: keyof NutritionGoals, value: string) {
    setGoals((currentGoals) => ({
      ...currentGoals,
      [goalName]: Number(value),
    }));

    setMessage("");
  }

  // Save the goals
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    localStorage.setItem("nutritionGoals", JSON.stringify(goals));
    setMessage("Your daily nutrition goals were saved.");
  }

  // Restore the default goals
  function resetGoals() {
    setGoals(defaultGoals);
    localStorage.setItem("nutritionGoals", JSON.stringify(defaultGoals));
    setMessage("Your goals were reset to the default values.");
  }

  return (
    <main className="goals-main">
      {/* Page heading */}
      <header className="goals-header">
        <div>
          <p className="goals-label">Personal targets</p>
          <h1>Nutrition Goals</h1>
          <p>Set the daily targets shown on your dashboard.</p>
        </div>

        <div className="goals-header-icon">
          <i className="bi bi-bullseye" aria-hidden="true" />
        </div>
      </header>

      <div className="goals-content">
        {/* Goal form */}
        <section className="goals-form-card">
          <div className="goals-card-heading">
            <div>
              <h2>Daily Targets</h2>
              <p>Enter the amount you want to reach each day.</p>
            </div>
          </div>

          {/* Success message */}
          {message && (
            <div className="goals-message" role="status">
              <i className="bi bi-check-circle-fill" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="goals-fields">
              {/* Calories */}
              <div className="goal-field">
                <label htmlFor="goalCalories">Calories</label>

                <div className="goal-input">
                  <i className="bi bi-fire" aria-hidden="true" />

                  <input
                    id="goalCalories"
                    type="number"
                    min="1"
                    value={goals.calories}
                    onChange={(event) =>
                      updateGoal("calories", event.target.value)
                    }
                    required
                  />

                  <span>kcal</span>
                </div>

                <small>Your total daily calorie target</small>
              </div>

              {/* Protein */}
              <div className="goal-field">
                <label htmlFor="goalProtein">Protein</label>

                <div className="goal-input">
                  <i
                    className="bi bi-lightning-charge-fill"
                    aria-hidden="true"
                  />

                  <input
                    id="goalProtein"
                    type="number"
                    min="1"
                    value={goals.protein}
                    onChange={(event) =>
                      updateGoal("protein", event.target.value)
                    }
                    required
                  />

                  <span>g</span>
                </div>

                <small>Your daily protein target</small>
              </div>

              {/* Carbohydrates */}
              <div className="goal-field">
                <label htmlFor="goalCarbs">Carbohydrates</label>

                <div className="goal-input">
                  <i className="bi bi-circle-half" aria-hidden="true" />

                  <input
                    id="goalCarbs"
                    type="number"
                    min="1"
                    value={goals.carbs}
                    onChange={(event) =>
                      updateGoal("carbs", event.target.value)
                    }
                    required
                  />

                  <span>g</span>
                </div>

                <small>Your daily carbohydrate target</small>
              </div>

              {/* Fat */}
              <div className="goal-field">
                <label htmlFor="goalFat">Fat</label>

                <div className="goal-input">
                  <i className="bi bi-droplet-fill" aria-hidden="true" />

                  <input
                    id="goalFat"
                    type="number"
                    min="1"
                    value={goals.fat}
                    onChange={(event) => updateGoal("fat", event.target.value)}
                    required
                  />

                  <span>g</span>
                </div>

                <small>Your daily fat target</small>
              </div>
            </div>

            {/* Form buttons */}
            <div className="goals-actions">
              <button
                className="goals-reset-button"
                type="button"
                onClick={resetGoals}
              >
                Reset Goals
              </button>

              <button className="goals-save-button" type="submit">
                <i className="bi bi-check-lg" aria-hidden="true" />
                Save Goals
              </button>
            </div>
          </form>
        </section>

        {/* Right-side information */}
        <aside className="goals-information">
          <section className="goals-tip-card">
            <div className="goals-tip-icon">
              <i className="bi bi-lightbulb" aria-hidden="true" />
            </div>

            <h2>Setting Your Goals</h2>

            <p>
              Choose realistic nutrition targets based on your health and
              activity level.
            </p>

            <p>
              These targets are used to calculate the progress displayed on your
              Dashboard.
            </p>
          </section>

          <section className="goals-warning-card">
            <i className="bi bi-shield-check" aria-hidden="true" />

            <div>
              <strong>Health reminder</strong>

              <p>
                NutriFlow provides estimates and does not replace professional
                nutrition or medical advice.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Goals;
