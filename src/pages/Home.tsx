// useState remembers whether the mobile menu is open
import { useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Home.css";

function Home() {
  // The mobile drawer starts closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the drawer
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main>
      {/* Main Home navigation */}
      <nav className="home-nav">
        {/* Nourivio logo */}
        <Link className="home-brand" to="/">
          <img className="home-logo" src="/NutriFlow.png" alt="NutriFlow" />
        </Link>

        {/* Desktop navigation */}
        <div className="home-links">
          <a href="#feature">Features</a>
          <a href="#about">About</a>

          <span className="nav-divider">|</span>

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

      {/* Dark blurred background behind the drawer */}
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
        {/* Drawer heading */}
        <header className="drawer-header">
          <div className="drawer-brand">
            <img src="/NutriFlow.png" alt="NutriFlow" />

            <div>
              <strong>NutriFlow</strong>
              <small>Nutrition Simplified</small>
            </div>
          </div>

          {/* Close button */}
          <button
            className="close-button"
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        {/* Drawer links */}
        <nav className="drawer-links">
          <Link to="/" onClick={closeMenu}>
            <i className="bi bi-house-door" aria-hidden="true" />
            <span>Home</span>
          </Link>

          <a href="#feature" onClick={closeMenu}>
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

        {/* Project information */}
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

      {/* Introduction section */}
      <section>
        <div className="app_adv">
          <div className="intro">
            <div className="Welcome">Track Your Daily Nutrition</div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="feature">
        <h2>Our Features</h2>
      </section>

      {/* About section */}
      <section id="about">
        <h2>About Nourivio</h2>
      </section>
    </main>
  );
}

export default Home;
