// React tools for storing form values and handling submission
import { useState, type FormEvent } from "react";

// Used to move the user to another page
import { useNavigate } from "react-router-dom";

// Defines the structure of a Meal object
import type { Meal } from "../types/Meal";

import "../styles/AddMeal.css";

function AddMeal() {
  // Store the values entered by the user
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  // Allows navigation to the dashboard
  const navigate = useNavigate();

  // Runs when the user submits the form
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent the browser from refreshing
    event.preventDefault();

    // Create a new meal object
    const newMeal: Meal = {
      id: Date.now(),
      name: name,
      calories: Number(calories),
      protein: Number(protein),
    };

    // Get previously saved meals from localStorage
    const savedMeals: Meal[] = JSON.parse(
      localStorage.getItem("meals") || "[]",
    );

    // Add the new meal and save the updated list
    localStorage.setItem("meals", JSON.stringify([...savedMeals, newMeal]));

    // Return to the dashboard
    navigate("/dashboard");
  }

  return (
    <main className="add-meal">
      <h1>Add Meal</h1>

      {/* Meal form */}
      <form className="meal-form" onSubmit={handleSubmit}>
        {/* Meal-name field */}
        <div className="form-field">
          <label htmlFor="mealName">Meal name</label>

          <input
            className="meal-input"
            id="mealName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        {/* Calories field */}
        <div className="form-field">
          <label htmlFor="calories">Calories</label>

          <input
            className="meal-input"
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            required
          />
        </div>

        {/* Protein field */}
        <div className="form-field">
          <label htmlFor="protein">Protein (grams)</label>

          <input
            className="meal-input"
            id="protein"
            type="number"
            min="0"
            value={protein}
            onChange={(event) => setProtein(event.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <button className="save-button" type="submit">
          Save Meal
        </button>
      </form>
    </main>
  );
}

export default AddMeal;
