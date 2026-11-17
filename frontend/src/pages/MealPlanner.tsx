import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getMeals } from "../services/mealApi";
import type { Meal } from "../types/Meal";
import {
  addMealPlanEntry,
  clearMealPlanDay,
  deleteMealPlanEntry,
  getMealPlan,
  getPrepList,
  type MealPlan,
  type MealPlanDay,
  type MealPlanDraft,
  type MealPlanEntry,
  type PrepItem,
  updateMealPlanEntry,
} from "../services/mealPlanApi";
import "../styles/MealPlanner.css";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function MealCard({ entry, onDelete, onTogglePrepared, onToggleEaten }: {
  entry: MealPlanEntry;
  onDelete: (id: number) => void;
  onTogglePrepared: (entry: MealPlanEntry) => void;
  onToggleEaten: (entry: MealPlanEntry) => void;
}) {
  // Each card keeps preparation and eating as separate user actions.
  return (
    <article className={`planner-meal-card${entry.prepared ? " is-prepared" : ""}${entry.eaten ? " is-eaten" : ""}`}>
      <div className="planner-meal-card-top">
        <span className={`planner-meal-type planner-meal-type-${entry.mealType}`}>
          {entry.mealType}
        </span>
        <button type="button" className="planner-icon-button" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.name}`}>
          <i className="bi bi-trash3" aria-hidden="true" />
        </button>
      </div>
      <strong>{entry.name}</strong>
      <span className="planner-meal-meta">{entry.calories} kcal · {formatNumber(entry.servings)} serving{entry.servings === 1 ? "" : "s"}</span>
      <button type="button" className="planner-prepared-button" onClick={() => onTogglePrepared(entry)}>
        <i className={`bi ${entry.prepared ? "bi-check-circle-fill" : "bi-circle"}`} aria-hidden="true" />
        {entry.prepared ? "Prepared" : "Mark prepared"}
      </button>
      <button type="button" className={`planner-eaten-button${entry.eaten ? " is-eaten" : ""}`} onClick={() => onToggleEaten(entry)}>
        <i className={`bi ${entry.eaten ? "bi-check-circle-fill" : "bi-circle"}`} aria-hidden="true" />
        {entry.eaten ? "Eaten" : "Mark eaten"}
      </button>
    </article>
  );
}

function TotalsStrip({ totals, label }: { totals: MealPlan["totals"]; label: string }) {
  return (
    <div className="planner-totals-strip">
      <div><span>{label}</span><strong>{Math.round(totals.calories)} <small>kcal</small></strong></div>
      <div><span>Protein</span><strong>{formatNumber(totals.protein)}<small>g</small></strong></div>
      <div><span>Carbs</span><strong>{formatNumber(totals.carbs)}<small>g</small></strong></div>
      <div><span>Fat</span><strong>{formatNumber(totals.fat)}<small>g</small></strong></div>
    </div>
  );
}

function MealPlanner() {
  // The planner owns the 14-day view, add-meal dialog, and prep-list panel.
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [isPrepOpen, setIsPrepOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState<MealPlanDay | null>(null);
  const [mealType, setMealType] = useState("breakfast");
  const [savedMealId, setSavedMealId] = useState("");
  const [customName, setCustomName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servings, setServings] = useState("1");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPlan() {
    // Reload both the plan and saved meals after every mutation so totals stay fresh.
    setError("");
    try {
      const [nextPlan, meals] = await Promise.all([getMealPlan(), getMeals()]);
      setPlan(nextPlan);
      setSavedMeals(meals);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load your meal plan.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadPlan(); }, []);

  function openAddForm(day: MealPlanDay) {
    setSelectedDate(day.date);
    setSelectedDay(day);
    setMealType("breakfast");
    setSavedMealId(""); setCustomName(""); setCalories(""); setProtein(""); setCarbs(""); setFat(""); setServings("1"); setNotes("");
    setIsFormOpen(true);
  }

  function handleSavedMealChange(value: string) {
    setSavedMealId(value);
    const meal = savedMeals.find((item) => String(item.id) === value);
    if (!meal) return;
    setCustomName(meal.name); setCalories(String(meal.calories)); setProtein(String(meal.protein)); setCarbs(String(meal.carbs)); setFat(String(meal.fat));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true); setError("");
    // Saved meals provide nutrition automatically; manual meals provide their own values.
    const draft: MealPlanDraft = {
      date: selectedDate, mealType, ...(savedMealId ? { mealId: Number(savedMealId) } : { name: customName }),
      calories: calories ? Number(calories) : undefined, protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined, fat: fat ? Number(fat) : undefined,
      servings: Number(servings) || 1, notes: notes || undefined,
    };
    try {
      await addMealPlanEntry(draft);
      setIsFormOpen(false);
      await loadPlan();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add this meal.");
    } finally { setIsSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Remove this meal from your plan?")) return;
    try { await deleteMealPlanEntry(id); await loadPlan(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not remove this meal."); }
  }

  async function handleTogglePrepared(entry: MealPlanEntry) {
    // Prepared means ready in the kitchen; it does not count as eaten.
    try {
      await updateMealPlanEntry(entry.id, { date: entry.date, mealType: entry.mealType, prepared: !entry.prepared });
      await loadPlan();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not update this meal."); }
  }

  async function handleToggleEaten(entry: MealPlanEntry) {
    // Eaten is the state consumed by the Dashboard's daily totals.
    try {
      await updateMealPlanEntry(entry.id, { date: entry.date, mealType: entry.mealType, eaten: !entry.eaten });
      await loadPlan();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not update this meal."); }
  }

  async function handleClearDay(day: MealPlanDay) {
    if (!day.entries.length || !window.confirm(`Clear all meals planned for ${formatDate(day.date)}?`)) return;
    try { await clearMealPlanDay(day.date); await loadPlan(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not clear this day."); }
  }

  async function togglePrepList() {
    if (isPrepOpen) { setIsPrepOpen(false); return; }
    try {
      const result = await getPrepList(plan?.startDate, plan?.endDate);
      setPrepItems(result.items); setIsPrepOpen(true);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Could not load the prep list."); }
  }

  if (isLoading) return <main className="meal-planner-page"><div className="planner-loading">Loading your meal plan…</div></main>;

  return (
    <main className="meal-planner-page">
      <header className="planner-header">
        <div><p className="planner-eyebrow">Plan ahead, eat well</p><h1>Meal planner</h1><p>Organize the next two weeks of meals in one calm view.</p></div>
        <div className="planner-header-actions"><button type="button" className="planner-secondary-button" onClick={() => void togglePrepList()}><i className="bi bi-basket2" aria-hidden="true" /> Prep list</button><Link className="planner-primary-button" to="/add-meal"><i className="bi bi-plus-lg" aria-hidden="true" /> Save a meal</Link></div>
      </header>
      {error && <div className="planner-alert" role="alert"><i className="bi bi-exclamation-circle" /> {error}</div>}
      {plan && <TotalsStrip totals={plan.totals} label="Two-week overview" />}
      <section className="planner-intro"><div><h2>Your plan</h2><p>{plan ? `${formatDate(plan.startDate)} – ${formatDate(plan.endDate)}` : ""}</p></div><span className="planner-hint"><i className="bi bi-lightbulb" /> Tap a day to add a meal</span></section>
      <section className="planner-grid" aria-label="Two-week meal plan">
        {plan?.plan.map((day) => (
          <article className={`planner-day${day.date === new Date().toISOString().slice(0, 10) ? " is-today" : ""}`} key={day.date}>
            <header className="planner-day-header"><div><span>{day.dayOfWeek.slice(0, 3)}</span><strong>{formatDate(day.date)}</strong></div><div className="planner-day-actions"><button type="button" className="planner-day-add" onClick={() => openAddForm(day)} aria-label={`Add meal to ${day.dayOfWeek}`}><i className="bi bi-plus-lg" /></button><button type="button" className="planner-day-menu" onClick={() => void handleClearDay(day)} aria-label={`Clear ${day.dayOfWeek}`}><i className="bi bi-three-dots" /></button></div></header>
            <div className="planner-day-total">{day.totals.calories} kcal · {day.entries.length} meal{day.entries.length === 1 ? "" : "s"}</div>
            <div className="planner-day-meals">{day.entries.map((entry) => <MealCard key={entry.id} entry={entry} onDelete={handleDelete} onTogglePrepared={handleTogglePrepared} onToggleEaten={handleToggleEaten} />)}{!day.entries.length && <div className="planner-empty-day"><i className="bi bi-plus-circle" /><span>No meals yet</span></div>}</div>
          </article>
        ))}
      </section>
      {isPrepOpen && <aside className="planner-prep-panel"><div className="planner-panel-heading"><div><p className="planner-eyebrow">Kitchen view</p><h2>Prep list</h2></div><button type="button" className="planner-icon-button" onClick={() => setIsPrepOpen(false)} aria-label="Close prep list"><i className="bi bi-x-lg" /></button></div>{prepItems.length ? <div className="planner-prep-list">{prepItems.map((item) => <div className="planner-prep-item" key={`${item.name}-${item.sourceMealId}`}><i className={`bi ${item.preparedServings >= item.totalServings ? "bi-check-circle-fill" : "bi-circle"}`} /><div><strong>{item.name}</strong><span>{formatNumber(item.totalServings)} serving{item.totalServings === 1 ? "" : "s"} · {item.dates.map(formatDate).join(", ")}</span></div><b>{item.totalCalories} kcal</b></div>)}</div> : <p className="planner-muted">Add meals to see a consolidated prep list.</p>}</aside>}
      {isFormOpen && selectedDay && <div className="planner-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsFormOpen(false); }}><section className="planner-modal" role="dialog" aria-modal="true" aria-labelledby="add-plan-meal-title"><div className="planner-panel-heading"><div><p className="planner-eyebrow">{selectedDay.dayOfWeek}, {formatDate(selectedDate)}</p><h2 id="add-plan-meal-title">Add a planned meal</h2></div><button type="button" className="planner-icon-button" onClick={() => setIsFormOpen(false)} aria-label="Close"><i className="bi bi-x-lg" /></button></div><form onSubmit={handleSubmit} className="planner-form"><label>Meal type<select value={mealType} onChange={(event) => setMealType(event.target.value)}>{MEAL_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label><label>Use a saved meal (optional)<select value={savedMealId} onChange={(event) => handleSavedMealChange(event.target.value)}><option value="">Enter a meal manually</option>{savedMeals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}</select></label><label>Meal name<input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="e.g. Greek yogurt bowl" required={!savedMealId} /></label><div className="planner-form-grid"><label>Calories<input type="number" min="0" value={calories} onChange={(event) => setCalories(event.target.value)} placeholder="450" /></label><label>Servings<input type="number" min="0.1" step="0.1" value={servings} onChange={(event) => setServings(event.target.value)} /></label><label>Protein (g)<input type="number" min="0" step="0.1" value={protein} onChange={(event) => setProtein(event.target.value)} /></label><label>Carbs (g)<input type="number" min="0" step="0.1" value={carbs} onChange={(event) => setCarbs(event.target.value)} /></label><label>Fat (g)<input type="number" min="0" step="0.1" value={fat} onChange={(event) => setFat(event.target.value)} /></label></div><label>Notes (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything to remember?" rows={3} /></label><div className="planner-form-actions"><button type="button" className="planner-secondary-button" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit" className="planner-primary-button" disabled={isSaving}>{isSaving ? "Adding…" : "Add to plan"}</button></div></form></section></div>}
    </main>
  );
}

export default MealPlanner;
