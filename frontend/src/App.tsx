import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMeal from "./pages/AddMeal";
import History from "./pages/History";
import Settings from "./pages/Settings";

import AppLayout from "./components/AppLayout";
import ThemeToggle from "./components/ThemeToggle";

import "./App.css";

function AppContent() {
  return (
    <>
      {/* Global light and dark mode button */}
      <ThemeToggle />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages that share the application sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-meal" element={<AddMeal />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Unknown URLs return to Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
