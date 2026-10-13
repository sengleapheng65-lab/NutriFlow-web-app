// useState remembers whether the mobile menu is open
import { useState } from "react";
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

function Home() {
  // The mobile menu starts closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu
  function closeMenu() {
    setMenuOpen(false);
  }

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
            <span className="hero-label">Simple nutrition tracking</span>

            <h1>
              Know what you eat.
              <span> Feel better every day.</span>
            </h1>

            <p className="hero-description">
              Log meals, understand calories and nutrients, and build healthier
              habits without a complicated interface.
            </p>

            <div className="hero-buttons">
              <Link className="primary-button" to="/register">
                Start tracking
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
                Daily progress
              </span>
            </div>
          </div>

          {/* Right-side dashboard preview */}
          <div className="nutrition-preview">
            <div className="preview-heading">
              <div>
                <small>Today</small>
                <h2>Daily progress</h2>
              </div>

              <div className="user-icon">
                <i className="bi bi-person-fill" aria-hidden="true" />
              </div>
            </div>

            <div className="calorie-summary">
              <div className="calorie-circle">
                <div>
                  <strong>1,420</strong>
                  <span>of 2,000 kcal</span>
                </div>
              </div>

              <div className="nutrient-list">
                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Protein</span>
                    <strong>82 / 120g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span className="protein-progress" />
                  </div>
                </div>

                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Carbohydrates</span>
                    <strong>145 / 220g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span className="carb-progress" />
                  </div>
                </div>

                <div className="nutrient">
                  <div className="nutrient-heading">
                    <span>Fat</span>
                    <strong>42 / 65g</strong>
                  </div>

                  <div className="nutrient-track">
                    <span className="fat-progress" />
                  </div>
                </div>
              </div>
            </div>

            <div className="meal-preview">
              <div className="meal-icon">
                <img
                  className="meal-img"
                  src="/turkey.png"
                  alt="chicken.icon"
                />
              </div>

              <div className="meal-information">
                <small>Latest meal</small>
                <strong>Chicken rice bowl</strong>
              </div>

              <strong className="meal-calories">520 kcal</strong>
            </div>

            <div className="meal-preview">
              <div className="meal-icon">
                <img className="meal-img" src="/salad.png" alt="salad.icon" />
              </div>

              <div className="meal-information">
                <small>Low calories meal</small>
                <strong>Salad</strong>
              </div>

              <strong className="meal-calories">320 kcal</strong>
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

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-brand">
          <img src="/NutriFlow.png" alt="" />
          <span>NutriFlow</span>
        </div>

        <p>Nutrition simplified.</p>

        <p>© 2026 NutriFlow All Rights Reserved.</p>
      </footer>
    </main>
  );
}

export default Home;
