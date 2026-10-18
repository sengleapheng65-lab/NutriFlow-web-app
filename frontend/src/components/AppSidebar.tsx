import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import "../styles/AppSidebar.css";

// Information displayed in the sidebar profile card
type SidebarProfile = {
  fullName: string;
  weight: string;
  photo: string;
};

// Load the saved profile from localStorage
function loadSidebarProfile(): SidebarProfile {
  try {
    const savedProfile = localStorage.getItem("userProfile");

    if (!savedProfile) {
      return {
        fullName: "",
        weight: "",
        photo: "",
      };
    }

    const parsedProfile = JSON.parse(savedProfile);

    return {
      fullName: parsedProfile.fullName || "",
      weight: parsedProfile.weight || "",
      photo: parsedProfile.photo || "",
    };
  } catch {
    return {
      fullName: "",
      weight: "",
      photo: "",
    };
  }
}

function AppSidebar() {
  const location = useLocation();

  // Remember whether the phone menu is open
  const [menuOpen, setMenuOpen] = useState(false);

  // Store the profile information shown in the sidebar
  const [profile, setProfile] = useState<SidebarProfile>(() =>
    loadSidebarProfile(),
  );

  // Close the phone menu
  function closeMenu() {
    setMenuOpen(false);
  }

  // Close the phone menu whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Reload the sidebar after the Profile page saves new information
  useEffect(() => {
    function updateProfile() {
      setProfile(loadSidebarProfile());
    }

    window.addEventListener("profileUpdated", updateProfile);
    window.addEventListener("storage", updateProfile);

    return () => {
      window.removeEventListener("profileUpdated", updateProfile);
      window.removeEventListener("storage", updateProfile);
    };
  }, []);

  return (
    <>
      {/* Shared desktop sidebar and phone header */}
      <aside className="app-sidebar">
        {/* Application logo */}
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
          aria-controls="app-mobile-menu"
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>

        {/* User profile summary */}
        <Link className="app-sidebar-profile" to="/profile">
          <div className="app-sidebar-avatar">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={`${profile.fullName || "User"} profile`}
              />
            ) : (
              <i className="bi bi-person" aria-hidden="true" />
            )}
          </div>

          <div className="app-sidebar-profile-info">
            <strong>{profile.fullName || "Complete your profile"}</strong>

            <small>
              {profile.weight ? `${profile.weight} kg` : "Add your information"}
            </small>
          </div>
        </Link>

        <p className="app-sidebar-label">Menu</p>

        {/* Desktop navigation */}
        <nav className="app-sidebar-links">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-grid" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          {/* Add Meal */}
          <NavLink
            to="/add-meal"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-plus-circle" aria-hidden="true" />
            <span>Add Meal</span>
          </NavLink>

          {/* Goals */}
          <NavLink
            to="/goals"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-bullseye" aria-hidden="true" />
            <span>Goals</span>
          </NavLink>

          {/* Meal History */}
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-clock-history" aria-hidden="true" />
            <span>History</span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-person-circle" aria-hidden="true" />
            <span>Profile</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-gear-wide" aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Sign out */}
        <Link className="app-sidebar-signout" to="/login">
          <i className="bi bi-box-arrow-left" aria-hidden="true" />
          <span>Sign Out</span>
        </Link>
      </aside>

      {/* Dark background behind the phone drawer */}
      <button
        className={
          menuOpen
            ? "app-menu-overlay app-menu-overlay-open"
            : "app-menu-overlay"
        }
        type="button"
        onClick={closeMenu}
        aria-label="Close navigation menu"
        tabIndex={menuOpen ? 0 : -1}
      />

      {/* Phone navigation drawer */}
      <aside
        className={
          menuOpen
            ? "app-mobile-drawer app-mobile-drawer-open"
            : "app-mobile-drawer"
        }
        id="app-mobile-menu"
        aria-hidden={!menuOpen}
      >
        {/* Drawer heading */}
        <header className="app-drawer-header">
          <Link to="/dashboard" onClick={closeMenu}>
            <img src="/NutriFlow.png" alt="NutriFlow" />

            <div>
              <strong>NutriFlow</strong>
              <small>Nutrition simplified</small>
            </div>
          </Link>

          {/* Close drawer */}
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        {/* Mobile profile summary */}
        <Link
          className="app-sidebar-profile app-drawer-profile"
          to="/profile"
          onClick={closeMenu}
        >
          <div className="app-sidebar-avatar">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={`${profile.fullName || "User"} profile`}
              />
            ) : (
              <i className="bi bi-person" aria-hidden="true" />
            )}
          </div>

          <div className="app-sidebar-profile-info">
            <strong>{profile.fullName || "Complete your profile"}</strong>

            <small>
              {profile.weight ? `${profile.weight} kg` : "Add your information"}
            </small>
          </div>
        </Link>

        <p className="app-drawer-label">Menu</p>

        {/* Phone navigation links */}
        <nav className="app-drawer-links">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-grid" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          {/* Add Meal */}
          <NavLink
            to="/add-meal"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-plus-circle" aria-hidden="true" />
            <span>Add Meal</span>
          </NavLink>

          {/* Goals */}
          <NavLink
            to="/goals"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-bullseye" aria-hidden="true" />
            <span>Goals</span>
          </NavLink>

          {/* Meal History */}
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-clock-history" aria-hidden="true" />
            <span>History</span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-person-circle" aria-hidden="true" />
            <span>Profile</span>
          </NavLink>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={closeMenu}
          >
            <i className="bi bi-gear-wide" aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Phone sign out */}
        <Link className="app-drawer-signout" to="/login" onClick={closeMenu}>
          <i className="bi bi-box-arrow-left" aria-hidden="true" />
          <span>Sign Out</span>
        </Link>
      </aside>
    </>
  );
}

export default AppSidebar;
