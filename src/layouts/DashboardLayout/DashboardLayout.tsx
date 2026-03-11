import { Outlet } from "react-router-dom";
import NavigationSidebar from "../../components/common/Sidebar/NavigationSidebar";
import TopBar from "../../components/common/TopBar/TopBar";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";

const DashboardLayout = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  if (!isAuthenticated) return null;
  return (
    <div className="flex min-h-screen bg-[#FDFCF8] font-sans">
      <NavigationSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
