import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Meal } from "../types/Meal";
import "../styles/AddMeal.css";

function AddMeal() {
  const navigate = useNavigate();

  // Store the form values
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Create a meal using the information entered by the user
    const newMeal: Meal = {
      id: Date.now(),
      name: name.trim(),
      calories: Number(calories),
      protein: Number(protein),
      fat: Number(fat),
    };

    // Load previously saved meals
    let savedMeals: Meal[] = [];

    try {
      const storedMeals = localStorage.getItem("meals");
      savedMeals = storedMeals ? JSON.parse(storedMeals) : [];
    } catch {
      savedMeals = [];
    }

    // Save the new meal with the previous meals
    localStorage.setItem("meals", JSON.stringify([...savedMeals, newMeal]));

    // Return to the Dashboard
    navigate("/dashboard");
  }

  return (
    <main className="add-meal-main">
      {/* Page heading */}
      <header className="add-meal-header">
        <div>
          <p className="add-meal-label">Meal tracking</p>
          <h1>Add a Meal</h1>
          <p>Enter your meal’s nutrition information.</p>
        </div>

        <Link className="back-dashboard-button" to="/dashboard">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
      </header>

      <div className="add-meal-content">
        {/* Meal form */}
        <section className="add-meal-form-card">
          <div className="form-card-heading">
            <h2>Meal Details</h2>
            <p>All fields are required before saving.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Meal name */}
            <div className="meal-form-field">
              <label htmlFor="mealName">Meal name</label>

              <div className="meal-input">
                <i className="bi bi-egg-fried" aria-hidden="true" />

                <input
                  id="mealName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="For example, chicken rice bowl"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* Calories, protein and fat */}
            <div className="nutrition-fields">
              {/* Calories */}
              <div className="meal-form-field">
                <label htmlFor="calories">Calories</label>

                <div className="meal-input">
                  <i className="bi bi-fire" aria-hidden="true" />

                  <input
                    id="calories"
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(event) => setCalories(event.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <small>Total kcal</small>
              </div>

              {/* Protein */}
              <div className="meal-form-field">
                <label htmlFor="protein">Protein</label>

                <div className="meal-input">
                  <i className="bi bi-lightning-charge" aria-hidden="true" />

                  <input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={protein}
                    onChange={(event) => setProtein(event.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <small>Amount in grams</small>
              </div>

              {/* Fat */}
              <div className="meal-form-field">
                <label htmlFor="fat">Fat</label>

                <div className="meal-input">
                  <i className="bi bi-droplet" aria-hidden="true" />

                  <input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fat}
                    onChange={(event) => setFat(event.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <small>Amount in grams</small>
              </div>
            </div>

            {/* Form buttons */}
            <div className="meal-form-actions">
              <button
                className="cancel-meal-button"
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button className="save-meal-button" type="submit">
                <i className="bi bi-check-lg" aria-hidden="true" />
                Save Meal
              </button>
            </div>
          </form>
        </section>

        {/* Helpful information */}
        <aside className="meal-information">
          {/* Quick tip */}
          <section className="meal-tip-card">
            <div className="meal-tip-icon">
              <i className="bi bi-lightbulb" aria-hidden="true" />
            </div>

            <h2>Quick Tip</h2>

            <p>
              Use the food label or serving information for more accurate
              nutrition values.
            </p>
          </section>

          {/* Live meal preview */}
          <section className="meal-preview-card">
            <h2>Meal Preview</h2>

            <div className="preview-meal-name">
              <div>
                <i className="bi bi-egg-fried" aria-hidden="true" />
              </div>

              <span>{name.trim() || "Your meal"}</span>
            </div>

            <div className="preview-information">
              <span>Calories</span>
              <strong>{calories || "—"} kcal</strong>
            </div>

            <div className="preview-information">
              <span>Protein</span>
              <strong>{protein || "—"}g</strong>
            </div>

            <div className="preview-information">
              <span>Fat</span>
              <strong>{fat || "—"}g</strong>
            </div>
          </section>

          {/* Privacy information */}
          <section className="meal-private-card">
            <p>
              <i className="bi bi-shield-check" aria-hidden="true" />
              Private by default
            </p>

            <span>Your meal will only appear in your nutrition history.</span>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default AddMeal;
