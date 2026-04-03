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
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-6 md:p-8 overflow-auto no-scrollbar  ">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
