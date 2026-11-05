import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = { isLoading: boolean; isAuthenticated: boolean };

/** Prevents unauthenticated visitors from rendering private application routes. */
function ProtectedRoute({ isLoading, isAuthenticated }: Props) {
  const location = useLocation();
  if (isLoading) return <main className="auth-loading">Loading your account…</main>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default ProtectedRoute;
