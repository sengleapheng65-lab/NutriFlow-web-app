import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../styles/AppSidebar.css";

function AppSidebar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu when the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Shared desktop and phone header */}
      <aside className="app-sidebar">
        <Link className="app-sidebar-brand" to="/dashboard">
          <img src="/NutriFlow.png" alt="NutriFlow" />

          <div>
            <strong>NutriFlow</strong>
            <small>Nutrition simplified</small>
          </div>
        </Link>

        {/* Phone hamburger button */}
        <button
          className="app-menu-button"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>

        <p className="app-sidebar-label">Menu</p>

        {/* Desktop navigation */}
        <nav className="app-sidebar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-grid" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/add-meal"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-plus-circle" aria-hidden="true" />
            <span>Add Meal</span>
          </NavLink>

          <button type="button">
            <i className="bi bi-bullseye" aria-hidden="true" />
            <span>Goals</span>
          </button>

          <button type="button">
            <i className="bi bi-clock-history" aria-hidden="true" />
            <span>History</span>
          </button>
        </nav>

        <Link className="app-sidebar-signout" to="/login">
          <i className="bi bi-box-arrow-left" aria-hidden="true" />
          <span>Sign Out</span>
        </Link>
      </aside>

      {/* Phone menu background */}
      <button
        className={
          menuOpen
            ? "app-menu-overlay app-menu-overlay-open"
            : "app-menu-overlay"
        }
        type="button"
        onClick={() => setMenuOpen(false)}
        aria-label="Close navigation menu"
      />

      {/* Phone navigation drawer */}
      <aside
        className={
          menuOpen
            ? "app-mobile-drawer app-mobile-drawer-open"
            : "app-mobile-drawer"
        }
        aria-hidden={!menuOpen}
      >
        <header className="app-drawer-header">
          <Link to="/dashboard">
            <img src="/NutriFlow.png" alt="NutriFlow" />

            <div>
              <strong>NutriFlow</strong>
              <small>Nutrition simplified</small>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <p className="app-drawer-label">Menu</p>

        <nav className="app-drawer-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-grid" aria-hidden="true" />
            Dashboard
          </NavLink>

          <NavLink
            to="/add-meal"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-plus-circle" aria-hidden="true" />
            Add Meal
          </NavLink>

          <button type="button">
            <i className="bi bi-bullseye" aria-hidden="true" />
            Goals
          </button>

          <button type="button">
            <i className="bi bi-clock-history" aria-hidden="true" />
            History
          </button>
        </nav>

        <Link className="app-drawer-signout" to="/login">
          <i className="bi bi-box-arrow-left" aria-hidden="true" />
          Sign Out
        </Link>
      </aside>
    </>
  );
}

export default AppSidebar;
