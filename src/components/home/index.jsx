import { SidebarContext } from "../../context";
import SideBar from "../../components/sideBar";
import Navbar from "../../components/navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const AppLayout = () => {
  // ⬇️ Boshlang‘ich qiymatni localStorage'dan o‘qish
  const [collapsed, setCollapsed] = useState(() => {
    const storedValue = localStorage.getItem("sidebarCollapsed");
    return storedValue === "true"; // default false
  });

  const [paddingRight, setPaddingRight] = useState("1.5rem"); // default pr-6

  useEffect(() => {
    if (navigator.userAgent.includes("Macintosh")) {
      // Mac uchun biroz ko'proq padding
      setPaddingRight("2rem");
    } else {
      // Windows va boshqa platformalar uchun standart
      setPaddingRight("1.5rem");
    }
  }, []);

  // ⬇️ Har safar collapsed o‘zgarsa localStorage ga yozish
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="flex h-screen overflow-hidden">
        <SideBar
          collapsed={collapsed}
          setIsMobileOpen={setIsMobileOpen}
          isMobileOpen={isMobileOpen}
        />

        <div className="flex flex-col flex-1 bg-[#F2F2F2]">
          <Navbar
            onToggleDesktop={() => setCollapsed(!collapsed)}
            onToggleMobile={() => setIsMobileOpen(true)}
          />
          <main
            className="flex-1 overflow-y-scroll  w-full bg-gray-100 p-4"
            style={{ paddingRight }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
