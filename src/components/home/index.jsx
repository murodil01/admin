import { SidebarContext } from "../../context";
import SideBar from "../../components/sideBar";
import Navbar from "../../components/navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="flex h-screen overflow-hidden">
        <SideBar
          collapsed={collapsed}
          setIsMobileOpen={setIsMobileOpen}
          isMobileOpen={isMobileOpen}
        />
        <div className="flex flex-col flex-1">
          <Navbar
            onToggleDesktop={() => setCollapsed(!collapsed)}
            onToggleMobile={() => setIsMobileOpen(true)}
          />
<<<<<<< HEAD
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4 pr-4">
=======
          <main className="flex-1 overflow-y-auto bg-[#F2F2F2] p-4 pr-8">
>>>>>>> 916c5b010183979b3a0a63cbf2f23551b88e2511
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
