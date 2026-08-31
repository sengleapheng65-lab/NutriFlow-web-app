import { useState } from "react";
import type { Meal } from "../types/Meal";

function Dashboard() {
  const [meals] = useState<Meal[]>(() =>
    JSON.parse(localStorage.getItem("meals") || "[]"),
  );

  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

  const totalProtein = meals.reduce((total, meal) => total + meal.protein, 0);

  return (
    <main className="container py-4">
      <h1>Nutrition Dashboard</h1>
      <p className="text-muted">Track your daily nutrition</p>

      <section className="card p-3 mb-4">
        <h2>{totalCalories} / 2,000 calories</h2>
        <p>Protein: {totalProtein}g</p>
      </section>

      <h2>Today&apos;s Meals</h2>

      {meals.length === 0 && <p>No meals recorded yet.</p>}

      {meals.map((meal) => (
        <article className="card p-3 mb-3" key={meal.id}>
          <h3>{meal.name}</h3>
          <p>{meal.calories} calories</p>
          <p>{meal.protein}g protein</p>
        </article>
      ))}
    </main>
  );
}

export default Dashboard;
