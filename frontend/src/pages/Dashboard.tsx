import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { Link } from "react-router-dom";

import MacroIcon from "../components/MacroIcon";
import MealBowlIcon from "../components/MealBowlIcon";
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

type MobileProfile = {
  firstName: string;
  photo: string;
};

// Goals used when the user has not saved custom settings
const defaultGoals: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

const mobileDotRows = [16, 16, 16, 16, 16];

function loadMobileProfile(): MobileProfile {
  try {
    const savedProfile = localStorage.getItem("userProfile");
    const fullName = savedProfile ? JSON.parse(savedProfile).fullName || "" : "";

    return {
      firstName: fullName.trim().split(/\s+/)[0] || "there",
      photo: savedProfile ? JSON.parse(savedProfile).photo || "" : "",
    };
  } catch {
    return { firstName: "there", photo: "" };
  }
}

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

function Dashboard() {
  // All meals returned by Spring Boot
  const [meals, setMeals] = useState<Meal[]>([]);

  // Track loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    getLocalDateKey(new Date()),
  );
  const [visibleDayCount, setVisibleDayCount] = useState(() =>
    window.innerWidth >= 901 ? 14 : 7,
  );
  const weekPickerRef = useRef<HTMLDivElement>(null);
  const [weekIndicatorPosition, setWeekIndicatorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Load the nutrition goals from Settings
  const [goals] = useState<NutritionGoals>(() => loadNutritionGoals());
  const [mobileProfile] = useState<MobileProfile>(() => loadMobileProfile());

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

  // Measure the selected number so the animated circle remains centered at
  // every breakpoint, including the wider desktop date range.
  useLayoutEffect(() => {
    function positionWeekIndicator() {
      const picker = weekPickerRef.current;
      const selectedNumber = picker?.querySelector<HTMLElement>(
        ".mobile-week-day.active strong",
      );

      if (!picker || !selectedNumber) {
        return;
      }

      const pickerBounds = picker.getBoundingClientRect();
      const numberBounds = selectedNumber.getBoundingClientRect();

      setWeekIndicatorPosition({
        x: numberBounds.left - pickerBounds.left,
        y: numberBounds.top - pickerBounds.top,
      });
    }

    positionWeekIndicator();
    window.addEventListener("resize", positionWeekIndicator);

    return () => window.removeEventListener("resize", positionWeekIndicator);
  }, [selectedDateKey, visibleDayCount]);

  // Desktop has room for a two-week date range; compact screens retain one week.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const updateVisibleDayCount = () => {
      setVisibleDayCount(desktopQuery.matches ? 14 : 7);
    };

    updateVisibleDayCount();
    desktopQuery.addEventListener("change", updateVisibleDayCount);

    return () => desktopQuery.removeEventListener("change", updateVisibleDayCount);
  }, []);

  // Only include meals created on the day selected in the phone date picker.
  const todayMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (!meal.createdAt) {
        return false;
      }

      const mealDate = new Date(meal.createdAt);

      if (Number.isNaN(mealDate.getTime())) {
        return false;
      }

      return getLocalDateKey(mealDate) === selectedDateKey;
    });
  }, [meals, selectedDateKey]);

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

  // Prevent remaining calories from becoming negative for the desktop summary.
  const remainingCalories = Math.max(goals.calories - totalCalories, 0);

  const animatedCalories = useCountUp(totalCalories);
  const animatedGoalCalories = useCountUp(goals.calories);
  const animatedProtein = useCountUp(totalProtein);
  const animatedCarbs = useCountUp(totalCarbs);
  const animatedFat = useCountUp(totalFat);
  const animatedRemainingCalories = useCountUp(remainingCalories);

  const [selectedYear, selectedMonth, selectedDay] = selectedDateKey
    .split("-")
    .map(Number);
  const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);

  // Display the selected date
  const currentDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const isSelectedToday = selectedDateKey === getLocalDateKey(new Date());

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

  const mobileWeek = Array.from({ length: visibleDayCount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor((visibleDayCount - 1) / 2) + index);

    const dateKey = getLocalDateKey(date);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      dateKey,
      isSelected: dateKey === selectedDateKey,
    };
  });
  const selectedWeekIndex = mobileWeek.findIndex(
    (item) => item.dateKey === selectedDateKey,
  );

  return (
    <main className="dashboard-main">
      {/* Purpose-built condensed dashboard for phones */}
      <section className="mobile-dashboard-view" aria-label="Daily nutrition overview">
        <header className="mobile-dashboard-greeting">
          <div>
            <p className="mobile-dashboard-greeting-label">DAILY NUTRITION</p>
            <h1>Good morning, {mobileProfile.firstName}</h1>
          </div>

          <button type="button" aria-label="Notifications" className="mobile-notification-button">
            <i className="bi bi-bell" aria-hidden="true" />
          </button>
        </header>

        <div className="mobile-week-picker" aria-label="Current week" ref={weekPickerRef}>
          <span
            className={
              weekIndicatorPosition
                ? "mobile-week-indicator mobile-week-indicator-ready"
                : "mobile-week-indicator"
            }
            aria-hidden="true"
            style={{
              transform: weekIndicatorPosition
                ? `translate3d(${weekIndicatorPosition.x}px, ${weekIndicatorPosition.y}px, 0)`
                : "translate3d(-999px, -999px, 0)",
            }}
          />
          {mobileWeek.map((item) => (
            <button
              className={item.isSelected ? "mobile-week-day active" : "mobile-week-day"}
              type="button"
              key={item.dateKey}
              onClick={() => setSelectedDateKey(item.dateKey)}
              aria-pressed={item.isSelected}
              aria-label={`Show meals for ${item.day} ${item.date}`}
            >
              <span>{item.day}</span>
              <strong>{item.date}</strong>
            </button>
          ))}
        </div>

        <div className="mobile-selected-day-content" key={selectedDateKey}>
          <article className="mobile-daily-goal-card">
            <div className="mobile-goal-topline">
              <p>Daily goal</p>
              <span>{displayRounded(animatedGoalCalories).toLocaleString()}</span>
            </div>

            <div className="mobile-goal-macros">
              <div>
                <i className="bi bi-fire" aria-hidden="true" />
                <span>{displayRounded(animatedProtein)}g protein</span>
              </div>
              <div>
                <i className="bi bi-apple" aria-hidden="true" />
                <span>{displayRounded(animatedCarbs)}g carbs</span>
              </div>
            </div>

            <div className="mobile-goal-total">
              <strong>{displayRounded(animatedCalories).toLocaleString()}</strong>
              <span>kcal</span>
            </div>

            <div
              className="mobile-goal-dots"
              role="img"
              aria-label={`${calorieProgress}% of calorie goal completed`}
            >
              {mobileDotRows.map((rowLength, rowIndex) => {
                return (
                  <div className="mobile-goal-dot-row" key={rowIndex}>
                    {Array.from({ length: rowLength }, (_, dotIndex) => (
                      <span
                        className={
                          dotIndex < Math.round((calorieProgress / 100) * rowLength)
                            ? "lit"
                            : ""
                        }
                        key={dotIndex}
                        style={
                          {
                            ["--dot-delay"]: `${dotIndex * 35}ms`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </article>

          <div className="mobile-macro-capsules">
            <article>
              <div className="mobile-macro-capsule-icon">
                <MacroIcon type="protein" />
              </div>
              <strong>
                <b>{displayRounded(animatedProtein)}</b> / {goals.protein}g
              </strong>
            </article>
            <article>
              <div className="mobile-macro-capsule-icon">
                <MacroIcon type="carbs" />
              </div>
              <strong>
                <b>{displayRounded(animatedCarbs)}</b> / {goals.carbs}g
              </strong>
            </article>
            <article>
              <div className="mobile-macro-capsule-icon">
                <MacroIcon type="fat" />
              </div>
              <strong>
                <b>{displayRounded(animatedFat)}</b> / {goals.fat}g
              </strong>
            </article>
          </div>
        </div>
      </section>

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
              <strong>{displayRounded(animatedCalories).toLocaleString()}</strong>

              <span>of {goals.calories.toLocaleString()} kcal</span>
            </div>

            <p className="remaining-calories">
              {totalCalories > goals.calories
                ? `${Math.max(displayRounded(animatedCalories - goals.calories), 0)} calories over your goal`
                : `${displayRounded(animatedRemainingCalories)} calories remaining today`}
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
              <MacroIcon type="protein" />
            </div>

            <div className="stat-content">
              <span>Protein</span>

              <strong>
                {displayRounded(animatedProtein)} / {goals.protein}g
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
              <MacroIcon type="carbs" />
            </div>

            <div className="stat-content">
              <span>Carbohydrates</span>

              <strong>
                {displayRounded(animatedCarbs)} / {goals.carbs}g
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
              <MacroIcon type="fat" />
            </div>

            <div className="stat-content">
              <span>Fat</span>

              <strong>
                {displayRounded(animatedFat)} / {goals.fat}g
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
              <MealBowlIcon />
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
            <h2>{isSelectedToday ? "Today’s Meals" : "Selected Day Meals"}</h2>

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
              <MealBowlIcon />
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
                  {meal.photo ? (
                    <img src={meal.photo} alt={`${meal.name} meal`} />
                  ) : (
                    <MealBowlIcon />
                  )}
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
