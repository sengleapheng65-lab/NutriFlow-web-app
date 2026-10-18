import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { deleteMeal as deleteMealFromApi, getMeals } from "../services/mealApi";

import "../styles/Settings.css";

function Settings() {
  // Load the saved nutrition-tip preference
  const [showTips, setShowTips] = useState(() => {
    return localStorage.getItem("showNutritionTips") !== "false";
  });

  // Track status messages and backend requests
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  // Save application preferences
  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    localStorage.setItem("showNutritionTips", String(showTips));

    // Remove the old measurement setting because it is no longer used
    localStorage.removeItem("measurementUnit");

    setError("");
    setMessage("Your application preferences were saved.");
  }

  // Delete all meals from the Spring Boot backend
  async function clearMealHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all meal history? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsClearing(true);
      setMessage("");
      setError("");

      // Load every meal from the backend
      const meals = await getMeals();

      // Delete the meals one at a time
      for (const meal of meals) {
        await deleteMealFromApi(meal.id);
      }

      // Remove meals saved by an older frontend version
      localStorage.removeItem("meals");

      setMessage("Your meal history was cleared.");
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Could not clear your meal history. Make sure the backend is running.",
      );
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <main className="settings-main">
      {/* Page heading */}
      <header className="settings-header">
        <div>
          <p className="settings-label">Application preferences</p>

          <h1>Settings</h1>

          <p>Manage your preferences and NutriFlow data.</p>
        </div>

        <div className="settings-header-icon">
          <i className="bi bi-gear" aria-hidden="true" />
        </div>
      </header>

      {/* Display a success message */}
      {message && (
        <div className="settings-message settings-success" role="status">
          <i className="bi bi-check-circle-fill" aria-hidden="true" />

          <span>{message}</span>
        </div>
      )}

      {/* Display an error message */}
      {error && (
        <div className="settings-message settings-error" role="alert">
          <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />

          <span>{error}</span>
        </div>
      )}

      <div className="settings-content">
        <div className="settings-sections">
          {/* Application preferences */}
          <form className="settings-card" onSubmit={handleSave}>
            <div className="settings-card-heading">
              <div className="settings-card-icon preference-icon">
                <i className="bi bi-sliders" aria-hidden="true" />
              </div>

              <div>
                <h2>Application Preferences</h2>

                <p>Control helpful information displayed by NutriFlow.</p>
              </div>
            </div>

            {/* Nutrition-tip preference */}
            <div className="settings-row">
              <div>
                <span className="settings-row-label">Show nutrition tips</span>

                <p>
                  Display helpful nutrition suggestions throughout the
                  application.
                </p>
              </div>

              <label className="settings-switch">
                <input
                  type="checkbox"
                  checked={showTips}
                  onChange={(event) => {
                    setShowTips(event.target.checked);
                    setMessage("");
                  }}
                  aria-label="Show nutrition tips"
                />

                <span className="settings-switch-slider" />
              </label>
            </div>

            {/* Save preference */}
            <div className="settings-save-area">
              <button className="settings-save-button" type="submit">
                <i className="bi bi-check-lg" aria-hidden="true" />
                Save Preferences
              </button>
            </div>
          </form>

          {/* Data and account */}
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-card-icon data-icon">
                <i className="bi bi-database" aria-hidden="true" />
              </div>

              <div>
                <h2>Data and Account</h2>

                <p>Manage your meal records and application access.</p>
              </div>
            </div>

            {/* Clear meal history */}
            <div className="settings-danger-row">
              <div>
                <strong>Clear meal history</strong>

                <p>Permanently delete every meal you have logged.</p>
              </div>

              <button
                className="settings-clear-button"
                type="button"
                onClick={() => void clearMealHistory()}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    Clearing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash3" aria-hidden="true" />
                    Clear History
                  </>
                )}
              </button>
            </div>

            {/* Sign out */}
            <div className="settings-danger-row">
              <div>
                <strong>Sign out</strong>

                <p>Return to the NutriFlow login page.</p>
              </div>

              <Link className="settings-signout-button" to="/login">
                <i className="bi bi-box-arrow-left" aria-hidden="true" />
                Sign Out
              </Link>
            </div>
          </section>
        </div>

        {/* Settings information */}
        <aside className="settings-information">
          <div className="settings-information-icon">
            <i className="bi bi-shield-check" aria-hidden="true" />
          </div>

          <h2>Your Preferences</h2>

          <p>Your application preferences are stored in this browser.</p>

          <p>
            Your meal history is loaded from the NutriFlow Spring Boot backend.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Settings;
