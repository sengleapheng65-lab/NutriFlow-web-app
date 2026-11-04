import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMeal from "./pages/AddMeal";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AppLayout from "./components/AppLayout";
import ThemeToggle from "./components/ThemeToggle";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrentUser, type AuthUser } from "./services/authApi";
import { setActiveUserEmail } from "./services/userStorage";

import "./App.css";

function AppContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (currentUser) setActiveUserEmail(currentUser.email);
      setUser(currentUser);
    }).catch(() => setUser(null)).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      {/* Global light and dark mode button */}
      <ThemeToggle />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Pages that share the application sidebar */}
        <Route element={<ProtectedRoute isLoading={isLoading} isAuthenticated={Boolean(user)} />}>
          <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-meal" element={<AddMeal />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Unknown URLs return to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
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
