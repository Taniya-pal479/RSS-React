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
    /* h-screen + overflow-hidden here is correct: 
       it locks the browser window so only the internal parts scroll. */
    <div className="flex h-screen bg-[#FDFCF8] font-sans overflow-hidden">
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 1. Removed mb-20: This was pushing your content off the bottom of the screen.
          2. min-w-0: Prevents the main content from breaking the flex layout when tables are wide. */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* 3. Removed overflow-hidden from <main>: 
              We want the 'Outlet' (the Dashboard or Table pages) to handle their own scrolling.
        */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
