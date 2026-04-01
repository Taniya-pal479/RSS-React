import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavigationSidebar from "../../components/common/Sidebar/NavigationSidebar";
import TopBar from "../../components/common/TopBar/TopBar";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans overflow-hidden">
      {/* Sidebar gets the state */}
      <NavigationSidebar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
