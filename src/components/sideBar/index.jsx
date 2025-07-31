import {
  MessageSquare,
  X,
  Calendar,
  ClipboardList,
  Landmark,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BsFillGridFill } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { useState, useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { IoFileTrayFull, IoLibrary } from "react-icons/io5";
import { TbReport } from "react-icons/tb";

import TaskProjectDropdown from "./TaskProjectDropdown";
import side_blue from "../../assets/side_blue.png";
import side_blue3 from "../../assets/side_blue3.png";
import { RiPieChart2Fill } from "react-icons/ri";
import { FaSackDollar } from "react-icons/fa6";
import { BiChevronRight } from "react-icons/bi";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Leads", icon: <RiPieChart2Fill size={20} />, path: "/leads" },
  { label: "Customers", icon: <FaSackDollar size={20} />, path: "/customers" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
  { label: "Inner Circle", icon: <FaUsers size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "M Library", icon: <IoLibrary size={20} />, path: "/files" },
  { label: "Reports", icon: <TbReport size={20} />, path: "/reports" },
  { label: "Archive", icon: <IoFileTrayFull size={20} />, path: "/archive" },
];

const SideBar = ({ isMobileOpen, setIsMobileOpen, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const [selectedProject, setSelectedProject] = useState();
  const [isHovered, setHoveredTask] = useState(false);

  // Handle logo click with mobile state preservation
  const handleLogoClick = () => {
    // Store mobile sidebar state before refresh
    if (isMobileOpen) {
      localStorage.setItem("sidebarMobileOpen", "true");
    } else {
      localStorage.removeItem("sidebarMobileOpen");
    }
    window.location.reload();
  };

  // Handle mobile logo click with mobile state preservation
  const handleMobileLogoClick = (e) => {
    e.stopPropagation();
    // Store mobile sidebar state before refresh
    localStorage.setItem("sidebarMobileOpen", "true");
    window.location.reload();
  };

  // Restore mobile sidebar state after page load
  useEffect(() => {
    const savedMobileState = localStorage.getItem("sidebarMobileOpen");
    if (savedMobileState === "true") {
      setIsMobileOpen(true);
      // Clean up the stored state after restoring
      localStorage.removeItem("sidebarMobileOpen");
    }
  }, [setIsMobileOpen]);

  return (
    <>
      <aside
        className={`hidden md:flex h-screen transition-all duration-300 bg-[#F2F2F2]
    ${collapsed
            ? "w-20 px-2 pt-[20px] pb-[10px]"
            : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
          }`}
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div
              className={`flex justify-center transition-all duration-300 ${collapsed ? "pt-6 pb-3" : "p-6"
                }`}
            >
              <img
                onClick={handleLogoClick}
                src={collapsed ? side_blue3 : side_blue}
                alt="Logo"
                className={`transition-all duration-500 ease-in-out transform cursor-pointer ${collapsed
                  ? "w-7 scale-90 opacity-80"
                  : "w-[150px] scale-100 opacity-100"
                  }`}
              />
            </div>

            <nav
              className={`flex flex-col gap-[5px] ${collapsed ? "items-center py-2" : "p-4"
                }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isTaskItem = item.path === "/tasks";

                const baseButton = (
                  <button
                    onMouseEnter={() => isTaskItem && setHoveredTask(true)}
                    onMouseLeave={() => isTaskItem && setHoveredTask(false)}
                    onClick={() => !isTaskItem && handleNavigate(item.path)}
                    className={`flex items-center gap-3 py-2 rounded-xl transition text-left
        ${collapsed ? "justify-center px-2 w-[48px]" : "px-4 w-full"}
        ${isActive ? "bg-[#0061fe] font-semibold text-white" : "text-[#231f20] hover:text-white"}
        hover:bg-[#0061fe] hover:text-white`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <div className="w-full flex items-center justify-between relative">
                        <span className="text-[16px] font-semibold">{item.label}</span>
                      </div>
                    )}
                    {isTaskItem && (
                      <BiChevronRight
                        className={`transition-transform duration-300 ease-in-out
      ${isDropdownOpen ? "rotate-90" : "rotate-0"}
      text-3xl
    `}
                      />
                    )}
                  </button>
                );

                if (isTaskItem) {
                  return (
                    <TaskProjectDropdown
                      key={item.label}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      isActive={isActive}
                      isHovered={true}
                      triggerButton={baseButton}
                      onOpenChange={(open) => setDropdownOpen(open)}
                    />
                  );
                }

                return (
                  <div key={item.label} className="relative">
                    {baseButton}
                  </div>
                );
              })}
            </nav>
          </div>

          <div
            className={`flex flex-col gap-4 ${collapsed ? "px-2 py-4" : "px-4 py-6"
              }`}
          >
            {!collapsed ? (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="w-full flex items-center justify-center gap-2 bg-[#0061fe] text-white mt-3 rounded-xl text-[18px] px-6 py-2 text-sm m-auto"
              >
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="flex items-center justify-center bg-[#0061fe] text-white rounded-md p-2"
              >
                <BiSupport size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 backdrop-blur-sm bg-blue-100/10 opacity-100 transition-opacity duration-500"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* Sidebar Panel */}
          <div className="relative z-50 w-64 bg-white text-[#231f20] h-screen flex flex-col px-10 py-8 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <img
                src={side_blue3}
                alt="Logo"
                className="w-10 m-auto cursor-pointer"
                onClick={handleMobileLogoClick}
              />

              <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 sm:gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isTaskItem = item.path === "/tasks";

                const baseButton = (
                  <button
                    onClick={() => !isTaskItem && handleNavigate(item.path)}
                    className={`flex items-center w-full rounded-xl transition px-3 py-2 sm:px-4 sm:py-2.5
          ${isActive
                        ? "bg-[#0061fe] text-white font-semibold"
                        : "text-[#231f20] hover:bg-[#0061fe] hover:text-white"
                      }`}
                  >
                    <div className="w-5 h-5 mr-2 sm:mr-3 flex-shrink-0">
                      {item.icon}
                    </div>

                    <span className="text-sm sm:text-base font-medium flex items-center gap-5">
                      {item.label}
                      {isTaskItem && (
                      <BiChevronRight
                        className={`transition-transform duration-300 ease-in-out
      ${isDropdownOpen ? "rotate-90" : "rotate-0"}
      text-md
    `}
                      />
                    )}
                    </span>
                  </button>
                );

                if (isTaskItem) {
                  return (
                    <TaskProjectDropdown
                      key={item.label}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      isActive={isActive}
                      isHovered={true}
                      triggerButton={baseButton}
                    />
                  );
                }

                return (
                  <div key={item.label} className="relative">
                    {baseButton}
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-4 flex flex-col gap-4">
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="flex items-center justify-center gap-2 border border-[#0061fe] bg-white text-[#0061fe] hover:bg-[#0061fe] hover:text-white rounded-xl text-[18px] px-6 py-3 text-sm w-full"
              >
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;