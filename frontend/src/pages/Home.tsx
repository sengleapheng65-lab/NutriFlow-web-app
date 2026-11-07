// useState remembers whether the mobile menu is open
import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { Link } from "react-router-dom";

import MacroIcon from "../components/MacroIcon";
import MealBowlIcon from "../components/MealBowlIcon";
import "../styles/Home.css";

// Information displayed in the feature cards
const features = [
  {
    icon: "bi-journal-plus",
    color: "icon-red",
    title: "Manual Meal Logging",
    description:
      "Add meals yourself with calories, protein, carbohydrates, and fat.",
  },
  {
    icon: "bi-stars",
    color: "icon-blue",
    title: "NutriVision AI",
    description:
      "Analyze a meal photo to estimate nutrition and fill in your meal details.",
  },
  {
    icon: "bi-card-text",
    color: "icon-purple",
    title: "Label Scanner",
    description: "Capture a Nutrition Facts label to extract serving details and macros.",
  },
  {
    icon: "bi-upc-scan",
    color: "icon-green",
    title: "Barcode Scanner",
    description: "Scan packaged foods to quickly find nutrition information.",
  },
  {
    icon: "bi-bar-chart-line",
    color: "icon-cyan",
    title: "Daily Dashboard",
    description: "Track daily calories and macro progress at a glance.",
  },
  {
    icon: "bi-bullseye",
    color: "icon-orange",
    title: "Personal Goals",
    description: "Set calorie and macro targets that match your nutrition goals.",
  },
  {
    icon: "bi-clock-history",
    color: "icon-red",
    title: "Meal History",
    description: "Review, search, sort, and manage your previous meal entries.",
  },
  {
    icon: "bi-sliders",
    color: "icon-blue",
    title: "Profile & Preferences",
    description: "Personalize your profile, daily targets, theme, and app settings.",
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

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const startedAt = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(target * easedProgress);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return Math.round(value);
}

function Home() {
  // The mobile menu starts closed
  const [menuOpen, setMenuOpen] = useState(false);
  const pullStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);
  const [demoMeals] = useState<DemoMeal[]>([
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

  // Close the mobile menu
  function closeMenu() {
    setMenuOpen(false);
  }

  function handlePreviewTouchStart(event: TouchEvent<HTMLElement>) {
    if (event.touches.length === 1 && !isRefreshingPreview) {
      pullStartY.current = event.touches[0].clientY;
    }
  }

  function handlePreviewTouchMove(event: TouchEvent<HTMLElement>) {
    if (pullStartY.current === null || isRefreshingPreview) return;

    const distance = event.touches[0].clientY - pullStartY.current;

    if (distance > 0) {
      event.preventDefault();
      setPullDistance(Math.min(70, distance * 0.45));
    }
  }

  function handlePreviewTouchEnd() {
    if (pullStartY.current === null) return;
    pullStartY.current = null;

    if (pullDistance >= 42) {
      setIsRefreshingPreview(true);
      window.setTimeout(() => {
        setIsRefreshingPreview(false);
        setPullDistance(0);
      }, 700);
      return;
    }

    setPullDistance(0);
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

  const animatedCalories = useCountUp(demoTotals.calories);
  const animatedProtein = useCountUp(demoTotals.protein);
  const animatedCarbs = useCountUp(demoTotals.carbs);
  const animatedFat = useCountUp(demoTotals.fat);
  const animatedCalorieProgress = Math.min(100, (animatedCalories / 2000) * 100);

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
          <div className="phone-mockup" aria-label="NutriFlow dashboard preview">
            <div className="phone-speaker" aria-hidden="true" />
            <span className="phone-action-button" aria-hidden="true" />
            <span className="phone-volume-up" aria-hidden="true" />
            <span className="phone-volume-down" aria-hidden="true" />
            <span className="phone-power-button" aria-hidden="true" />
            <div
              className="nutrition-preview"
              id="demo"
              onTouchStart={handlePreviewTouchStart}
              onTouchMove={handlePreviewTouchMove}
              onTouchEnd={handlePreviewTouchEnd}
              onTouchCancel={handlePreviewTouchEnd}
            >
              {(pullDistance > 0 || isRefreshingPreview) && (
                <div
                  className="home-mobile-pull-indicator"
                  style={{ transform: `translate(-50%, ${pullDistance - 42}px)` }}
                >
                  <i className={isRefreshingPreview ? "bi bi-arrow-clockwise spinning" : "bi bi-arrow-down"} aria-hidden="true" />
                  <span>{isRefreshingPreview ? "Refreshing…" : pullDistance >= 42 ? "Release to refresh" : "Pull to refresh"}</span>
                </div>
              )}
              <section className="home-mobile-dashboard" aria-label="Daily nutrition overview">
                <header className="home-mobile-greeting">
                  <div>
                    <p>DAILY NUTRITION</p>
                    <h2>Good morning, there</h2>
                  </div>
                  <div className="home-mobile-header-actions">
                    <button type="button" aria-label="Profile">
                      <i className="bi bi-person-fill" aria-hidden="true" />
                    </button>
                    <button type="button" aria-label="Notifications">
                      <i className="bi bi-bell" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div className="home-mobile-week" aria-label="Current week">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => (
                    <div className={index === 4 ? "active" : ""} key={day}>
                      <span>{day}</span>
                      <strong>{17 + index}</strong>
                    </div>
                  ))}
                </div>

                <article className="home-mobile-goal-card">
                  <div className="home-mobile-goal-topline">
                    <strong>Daily goal</strong>
                    <span>2,000</span>
                  </div>
                  <div className="home-mobile-goal-macros">
                    <span><i className="bi bi-fire" aria-hidden="true" /> 2,000 calories burned</span>
                    <span><MealBowlIcon /> {animatedCalories.toLocaleString()} calories eaten</span>
                  </div>
                  <div className="home-mobile-goal-total">
                    <strong>{animatedCalories.toLocaleString()}</strong><span>kcal</span>
                  </div>
                  <div className="home-mobile-goal-dots" style={{ "--goal-progress": `${animatedCalorieProgress}%` } as CSSProperties} aria-hidden="true" />
                </article>

                <div className="home-mobile-macros">
                  <article><MacroIcon type="protein" /><strong>{animatedProtein}<small>/ 120g</small></strong></article>
                  <article><MacroIcon type="carbs" /><strong>{animatedCarbs}<small>/ 250g</small></strong></article>
                  <article><MacroIcon type="fat" /><strong>{animatedFat}<small>/ 65g</small></strong></article>
                </div>

                <section className="home-mobile-history" aria-label="Meal history preview">
                  <div className="home-mobile-history-heading">
                    <strong>Meal history</strong>
                    <span>View all</span>
                  </div>
                  {demoMeals.slice(0, 1).map((meal) => (
                    <article key={meal.id}>
                      <span className="home-mobile-meal-icon" aria-hidden="true">{meal.icon}</span>
                      <div>
                        <strong>{meal.name}</strong>
                        <small>{meal.protein}g P · {meal.carbs}g C · {meal.fat}g F</small>
                      </div>
                      <b>{meal.calories} kcal</b>
                    </article>
                  ))}
                </section>

                <nav className="home-mobile-tabbar" aria-label="Primary navigation preview">
                  <span className="active"><i className="bi bi-house-door-fill" aria-hidden="true" /><small>Home</small></span>
                  <span><i className="bi bi-journal-text" aria-hidden="true" /><small>History</small></span>
                  <span className="add"><i className="bi bi-plus-lg" aria-hidden="true" /><small>Add meal</small></span>
                  <span><i className="bi bi-graph-up-arrow" aria-hidden="true" /><small>Goals</small></span>
                  <span><i className="bi bi-gear-wide-connected" aria-hidden="true" /><small>Settings</small></span>
                </nav>
              </section>
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
