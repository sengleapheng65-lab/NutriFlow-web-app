// Import tools used to create navigation and page routes
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Import the application pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMeal from "./pages/AddMeal";

// Import application-wide styles
import "./App.css";

function AppContent() {
  // Get the current page location
  const location = useLocation();

  // Hide the navbar on the Login and Register pages
  const showNavigation = !["/", "/login", "/register"].includes(
    location.pathname,
  );

  return (
    <>
      {/* Display the navbar only on authenticated application pages */}
      {showNavigation && (
        <nav className="navbar navbar-dark bg-success px-4">
          {/* Clicking the application name opens the Dashboard */}
          <Link className="navbar-brand" to="/dashboard">
            Nourivio
          </Link>

          {/* Main navigation buttons */}
          <div>
            <Link className="btn btn-light me-2" to="/add-meal">
              Add Meal
            </Link>

            {/* Return the user to the Login page */}
            <Link className="btn btn-outline-light" to="/login">
              Sign Out
            </Link>
          </div>
        </nav>
      )}

      {/* Define the pages and their URL paths */}
      <Routes>
        {/* Display the Home page at the default URL */}
        <Route path="/" element={<Home />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main application pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-meal" element={<AddMeal />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    // BrowserRouter enables navigation without refreshing the browser
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Make the App component available to main.tsx
export default App;
