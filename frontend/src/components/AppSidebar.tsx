import { useEffect, useState, type CSSProperties } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/authApi";
import { getUserStorageKey } from "../services/userStorage";

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
    const savedProfile = localStorage.getItem(getUserStorageKey("userProfile"));

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

function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname.startsWith("/admin") ? "/admin" : location.pathname;

  // Store the profile information shown in the sidebar
  const [profile, setProfile] = useState<SidebarProfile>(() =>
    loadSidebarProfile(),
  );

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

        {/* Phone profile shortcut */}
        <Link className="app-mobile-profile-button" to="/profile" aria-label="Open profile">
          {profile.photo ? (
            <img src={profile.photo} alt={`${profile.fullName || "User"} profile`} />
          ) : (
            <i className="bi bi-person-fill" aria-hidden="true" />
          )}
        </Link>

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
        <nav
          className="app-sidebar-links"
          style={
            {
              ["--active-index"]: [
                "/dashboard",
                "/add-meal",
                "/goals",
                "/history",
                "/profile",
                "/settings",
                ...(isAdmin ? ["/admin"] : []),
              ].indexOf(activePath),
            } as CSSProperties
          }
        >
          <span className="sidebar-active-indicator" aria-hidden="true" />
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-house-door-fill" aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          {/* Add Meal */}
          <NavLink
            to="/add-meal"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-plus-lg" aria-hidden="true" />
            <span>Add Meal</span>
          </NavLink>

          {/* Goals */}
          <NavLink
            to="/goals"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-graph-up-arrow" aria-hidden="true" />
            <span>Goals</span>
          </NavLink>

          {/* Meal History */}
          <NavLink
            to="/history"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <i className="bi bi-journal-text" aria-hidden="true" />
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
            <i className="bi bi-gear-wide-connected" aria-hidden="true" />
            <span>Settings</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              <i className="bi bi-shield-lock" aria-hidden="true" />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Sign out */}
        <button className="app-sidebar-signout" type="button" onClick={() => void logout().finally(() => navigate("/login"))}>
          <i className="bi bi-box-arrow-left" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Primary phone navigation stays within easy thumb reach. */}
      <nav
        className={`${location.pathname === "/profile"
          ? "app-mobile-tabbar app-mobile-tabbar-no-active"
          : "app-mobile-tabbar"}${isAdmin ? " app-mobile-tabbar-admin" : ""}`}
        aria-label="Primary navigation"
        style={
          {
            ["--mobile-tab-index"]: [
              "/dashboard",
              "/history",
              "/add-meal",
              "/goals",
              "/settings",
              ...(isAdmin ? ["/admin"] : []),
            ].indexOf(activePath),
          } as CSSProperties
        }
      >
        <span className="app-mobile-tab-indicator" aria-hidden="true" />
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? "active" : "")}
          aria-label="Home"
        >
          <i className="bi bi-house-door-fill" aria-hidden="true" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? "active" : "")}
          aria-label="History"
        >
          <i className="bi bi-journal-text" aria-hidden="true" />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/add-meal"
          className={({ isActive }) => (isActive ? "active add-meal" : "add-meal")}
          aria-label="Add meal"
        >
          <span className="app-mobile-add-icon" aria-hidden="true">
            <i className="bi bi-plus-lg" />
          </span>
          <span>Add meal</span>
        </NavLink>

        <NavLink
          to="/goals"
          className={({ isActive }) => (isActive ? "active" : "")}
          aria-label="Goals"
        >
          <i className="bi bi-graph-up-arrow" aria-hidden="true" />
          <span>Goals</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "active" : "")}
          aria-label="Settings"
        >
          <i className="bi bi-gear-wide-connected" aria-hidden="true" />
          <span>Settings</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
            aria-label="Admin"
          >
            <i className="bi bi-shield-lock" aria-hidden="true" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </>
  );
}

export default AppSidebar;
