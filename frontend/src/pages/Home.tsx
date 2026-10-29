// useState remembers whether the mobile menu is open
import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

// Information displayed in the feature cards
const features = [
  {
    icon: "bi-journal-plus",
    color: "icon-red",
    title: "Easy Meal Logging",
    description:
      "Quickly record your meals, calories, and important nutrients.",
  },
  {
    icon: "bi-bar-chart-line",
    color: "icon-blue",
    title: "Nutrition Dashboard",
    description:
      "See your daily calorie and nutrient progress in one dashboard.",
  },
  {
    icon: "bi-bullseye",
    color: "icon-purple",
    title: "Personal Goals",
    description: "Create nutrition goals and follow your daily progress.",
  },
  {
    icon: "bi-upc-scan",
    color: "icon-green",
    title: "Barcode Scanner",
    description: "Scan packaged foods to quickly find nutrition information.",
  },
  {
    icon: "bi-clock-history",
    color: "icon-cyan",
    title: "Meal History",
    description: "Review previous meals and understand your eating habits.",
  },
  {
    icon: "bi-phone",
    color: "icon-orange",
    title: "Works Everywhere",
    description: "Use NutriFlow from your phone, tablet, or computer.",
  },
];

type DemoMeal = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
  image?: string;
};

const quickMeals: Omit<DemoMeal, "id">[] = [
  {
    name: "Chicken Rice Bowl",
    calories: 520,
    protein: 38,
    carbs: 55,
    fat: 14,
    icon: "🍗",
    image: "/chicken.png",
  },
  {
    name: "Greek Yogurt",
    calories: 180,
    protein: 16,
    carbs: 22,
    fat: 3,
    icon: "🥣",
  },
  {
    name: "Salmon Salad",
    calories: 350,
    protein: 26,
    carbs: 12,
    fat: 22,
    icon: "🐟",
    image: "/salad.png",
  },
  {
    name: "Protein Shake",
    calories: 220,
    protein: 30,
    carbs: 8,
    fat: 3,
    icon: "🥤",
  },
];

function Home() {
  // The mobile menu starts closed
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoMeals, setDemoMeals] = useState<DemoMeal[]>([
    {
      id: 1,
      name: "Oatmeal & Banana",
      calories: 580,
      protein: 34,
      carbs: 72,
      fat: 6,
      icon: "🥣",
    },
  ]);
  const [dashboardMessage, setDashboardMessage] = useState("");

  // Close the mobile menu
  function closeMenu() {
    setMenuOpen(false);
  }

  function addQuickMeal(meal: Omit<DemoMeal, "id">) {
    setDemoMeals((currentMeals) => [
      { ...meal, id: Date.now() },
      ...currentMeals,
    ]);
    setDashboardMessage(`${meal.name} added`);
  }

  function deleteDemoMeal(mealId: number) {
    setDemoMeals((currentMeals) =>
      currentMeals.filter((meal) => meal.id !== mealId),
    );
  }

  function resetDashboard() {
    setDemoMeals([
      {
        id: 1,
        name: "Oatmeal & Banana",
        calories: 580,
        protein: 34,
        carbs: 72,
        fat: 6,
        icon: "🥣",
      },
    ]);
    setDashboardMessage("Dashboard reset");
  }

  const demoTotals = useMemo(
    () =>
      demoMeals.reduce(
        (totals, meal) => ({
          calories: totals.calories + meal.calories,
          protein: totals.protein + meal.protein,
          carbs: totals.carbs + meal.carbs,
          fat: totals.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [demoMeals],
  );

  const remainingCalories = 2000 - demoTotals.calories;
  const calorieProgress = Math.min(100, (demoTotals.calories / 2000) * 100);

  return (
    <main className="home-page">
      {/* =========================
          DESKTOP NAVIGATION
          ========================= */}
      <nav className="home-nav">
        <Link className="home-brand" to="/" aria-label="NutriFlow home page">
          <img className="home-logo" src="/NutriFlow.png" alt="NutriFlow" />
        </Link>

        <div className="home-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <span className="nav-divider" aria-hidden="true">
            |
          </span>

          <Link className="sign-in-button" to="/login">
            Sign In
          </Link>

          <Link className="get-started-button" to="/register">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>
      </nav>

      {/* =========================
          MOBILE MENU
          ========================= */}

      {/* Dark background behind the drawer */}
      <button
        className={menuOpen ? "menu-overlay overlay-open" : "menu-overlay"}
        type="button"
        onClick={closeMenu}
        aria-label="Close navigation menu"
      />

      {/* Mobile side drawer */}
      <aside
        className={menuOpen ? "mobile-drawer drawer-open" : "mobile-drawer"}
        id="mobile-menu"
        aria-hidden={!menuOpen}
      >
        <header className="drawer-header">
          <div className="drawer-brand">
            <img src="/NutriFlow.png" alt="" />

            <div>
              <strong>NutriFlow</strong>
              <small>Nutrition Simplified</small>
            </div>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <nav className="drawer-links">
          <Link to="/" onClick={closeMenu}>
            <i className="bi bi-house-door" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <a href="#features" onClick={closeMenu}>
            <i className="bi bi-grid" aria-hidden="true" />
            <span>Features</span>
          </a>

          <a href="#about" onClick={closeMenu}>
            <i className="bi bi-info-circle" aria-hidden="true" />
            <span>About</span>
          </a>

          <Link to="/login" onClick={closeMenu}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
            <span>Sign In</span>
          </Link>

          <Link to="/register" onClick={closeMenu}>
            <i className="bi bi-person-plus" aria-hidden="true" />
            <span>Get Started</span>
          </Link>
        </nav>

        <section className="drawer-card">
          <h3>Project Information</h3>

          <div>
            <span>Status</span>
            <strong>Beta</strong>
          </div>

          <div>
            <span>Platform</span>
            <strong>Responsive Web</strong>
          </div>

          <div>
            <span>Purpose</span>
            <strong>Class Project</strong>
          </div>
        </section>
      </aside>

      {/* =========================
          HERO SECTION
          ========================= */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Left side */}
          <div className="hero-content">
            <span className="hero-label">✨ Simple nutrition tracking</span>

            <h1>
              Know what you eat.
              <span> Feel better</span> every day.
            </h1>

            <p className="hero-description">
              Log meals instantly, understand your calories and macros in
              real-time, and build sustainable habits without complicated
              interfaces.
            </p>

            <div className="hero-buttons">
              <Link className="primary-button" to="/register">
                Start tracking free
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>

              <a className="secondary-button" href="#features">
                Explore features
              </a>
            </div>

            <div className="hero-benefits">
              <span>
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                Easy meal logging
              </span>

              <span>
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                Daily progress ring
              </span>

              <span>
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                No ads or bloat
              </span>
            </div>
          </div>

          {/* Right-side dashboard preview */}
          <div className="nutrition-preview" id="demo">
            <div className="preview-heading">
              <div>
                <small>Today's overview</small>
                <h2>
                  Daily Progress <span className="progress-status">On Track</span>
                </h2>
              </div>

              <div className="dashboard-actions">
                <button type="button" onClick={resetDashboard}>
                  <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />
                  Reset
                </button>
                <div className="user-icon">
                  <i className="bi bi-person-fill" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="calorie-summary">
              <div
                className="calorie-circle"
                style={{
                  "--calorie-progress": `${calorieProgress}%`,
                } as CSSProperties}
              >
                <div>
                  <strong>{demoTotals.calories.toLocaleString()}</strong>
                  <span>of 2,000 kcal</span>
                </div>
              </div>

              <div className="nutrient-list">
                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Protein</span>
                    <strong>{demoTotals.protein} / 120g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span
                      className="protein-progress"
                      style={{ width: `${Math.min(100, (demoTotals.protein / 120) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Carbohydrates</span>
                    <strong>{demoTotals.carbs} / 220g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span
                      className="carb-progress"
                      style={{ width: `${Math.min(100, (demoTotals.carbs / 220) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Fat</span>
                    <strong>{demoTotals.fat} / 65g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span
                      className="fat-progress"
                      style={{ width: `${Math.min(100, (demoTotals.fat / 65) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <span className="remaining-calories">
              {remainingCalories >= 0
                ? `${remainingCalories.toLocaleString()} kcal remaining`
                : `${Math.abs(remainingCalories).toLocaleString()} kcal over goal`}
            </span>

            <div className="quick-meals-heading">
              <strong>
                <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
                Interactive quick-add meals
              </strong>
              <span>Click to add to widget</span>
            </div>

            <div className="quick-meal-buttons">
              {quickMeals.map((meal) => (
                <button
                  key={meal.name}
                  type="button"
                  onClick={() => addQuickMeal(meal)}
                >
                  {meal.image ? (
                    <img src={meal.image} alt="" aria-hidden="true" />
                  ) : (
                    <span aria-hidden="true">{meal.icon}</span>
                  )}
                  {meal.name} <b>+{meal.calories} kcal</b>
                </button>
              ))}
            </div>

            {dashboardMessage && (
              <p className="dashboard-message" role="status">
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                {dashboardMessage}
              </p>
            )}

            <div className="demo-meal-feed" aria-live="polite">
              {demoMeals.map((meal) => (
                <div className="meal-preview featured-meal" key={meal.id}>
                  <div className="meal-icon meal-emoji" aria-hidden="true">
                    {meal.image ? (
                      <img className="meal-food-image" src={meal.image} alt="" />
                    ) : (
                      meal.icon
                    )}
                  </div>

                  <div className="meal-information">
                    <strong>{meal.name}</strong>
                    <small>
                      {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
                    </small>
                  </div>

                  <strong className="meal-calories">{meal.calories} kcal</strong>
                  <button
                    className="meal-delete-button"
                    type="button"
                    onClick={() => deleteDemoMeal(meal.id)}
                    aria-label={`Delete ${meal.name} meal`}
                    title="Delete meal"
                  >
                    <i className="bi bi-trash3" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURES SECTION
          ========================= */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span>Our Features</span>

          <h2>Everything you need to build healthier habits</h2>

          <p>
            NutriFlow makes nutrition tracking simple, understandable, and
            useful.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className={`feature-icon ${feature.color}`}>
                <i className={`bi ${feature.icon}`} aria-hidden="true" />
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =========================
          ABOUT SECTION
          ========================= */}
      <section className="about-section" id="about">
        <div className="about-visual">
          <div className="about-stat main-stat">
            <strong>2,000</strong>
            <span>Daily calorie goal</span>
          </div>

          <div className="about-stat">
            <strong>3</strong>
            <span>Meals logged today</span>
          </div>

          <div className="about-stat">
            <strong>82g</strong>
            <span>Protein consumed</span>
          </div>
        </div>

        <div className="about-content">
          <span className="section-label">About NutriFlow</span>

          <h2>Nutrition information should be easy to understand.</h2>

          <p>
            NutriFlow is a responsive nutrition web application that helps users
            record meals, monitor nutrients, and understand their daily eating
            habits.
          </p>

          <p>
            It is designed to provide useful information without overwhelming
            users with complicated charts or unnecessary details.
          </p>

          <Link className="about-button" to="/register">
            Create your account
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* =========================
          CALL TO ACTION
          ========================= */}
      <section className="home-cta">
        <div>
          <h2>Ready to understand your nutrition?</h2>
          <p>Create an account and start tracking your meals today.</p>
        </div>

        <Link className="cta-button" to="/register">
          Get Started
        </Link>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-intro">
              <Link className="footer-brand" to="/" aria-label="NutriFlow home">
                <img src="/NutriFlow.png" alt="" aria-hidden="true" />
                <span>NutriFlow</span>
              </Link>
              <p>
                Simple, actionable nutrition tracking to build lifelong healthy
                habits.
              </p>
            </div>

            <nav className="footer-column" aria-label="Product links">
              <h2>Product</h2>
              <a href="#features">Features</a>
              <Link to="/goals">Macro Calculator</Link>
              <a href="#demo">Live Demo</a>
            </nav>

            <nav className="footer-column" aria-label="Company links">
              <h2>Company</h2>
              <a href="#about">About Us</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </nav>

            <div className="footer-connect">
              <h2>Connect</h2>
              <div className="footer-socials">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NutriFlow on Twitter"
                >
                  <i className="bi bi-twitter" aria-hidden="true" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NutriFlow on GitHub"
                >
                  <i className="bi bi-github" aria-hidden="true" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NutriFlow on Instagram"
                >
                  <i className="bi bi-instagram" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 NutriFlow. All Rights Reserved.</p>
            <p>Nutrition simplified.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
