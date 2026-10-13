import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSideBar";

function AppLayout() {
  return (
    <div className="app-layout">
      {/* One sidebar shared by every signed-in page */}
      <AppSidebar />

      {/* Display Dashboard, Add Meal, or another selected page */}
      <Outlet />
    </div>
  );
}

export default AppLayout;
