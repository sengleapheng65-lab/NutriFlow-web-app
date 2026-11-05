import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import PullToRefresh from "./PullToRefresh";

/** Shared authenticated layout: navigation, mobile refresh gesture, and route animation. */
function AppLayout({ isAdmin }: { isAdmin: boolean }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* One sidebar shared by every signed-in page */}
      <AppSidebar isAdmin={isAdmin} />
      <PullToRefresh />

      {/* Display Dashboard, Add Meal, or another selected page */}
      <div className="app-layout-content">
        <div className="page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
