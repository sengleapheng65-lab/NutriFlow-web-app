import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";

function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      {/* One sidebar shared by every signed-in page */}
      <AppSidebar />

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
