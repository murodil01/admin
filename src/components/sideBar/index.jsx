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
import { HiTrophy } from "react-icons/hi2";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Leads", icon: <RiPieChart2Fill size={20} />, path: "/leads" },
  { label: "Customers", icon: <HiTrophy size={20} />, path: "/customers" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
  { label: "Inner Circle", icon: <FaUsers size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "M Library", icon: <IoLibrary size={20} />, path: "/library" },
  { label: "Reports", icon: <TbReport size={20} />, path: "/reports" },
  { label: "Archive", icon: <IoFileTrayFull size={20} />, path: "/archive" },
];

const SideBar = ({ isMobileOpen, setIsMobileOpen, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const [selectedProject, setSelectedProject] = useState();
  // const [isHovered, setHoveredTask] = useState(false);

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
    ${
      collapsed
        ? "w-20 px-2 pt-[20px] pb-[10px]"
        : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
    }`}
      >
        <div className="w-full h-full bg-white rounded-[24px] shadow-xl flex flex-col overflow-hidden">
          {/* Header Section - Fixed */}
          <div className="flex-shrink-0 mb-[5px]">
            <div
              className={`flex justify-center transition-all duration-300 ${
                collapsed ? "pt-6 pb-3" : "p-6"
              }`}
            >
              <img
                onClick={handleLogoClick}
                src={collapsed ? side_blue3 : side_blue}
                alt="Logo"
                className={`transition-all duration-500 ease-in-out transform cursor-pointer ${
                  collapsed
                    ? "w-7 scale-90 opacity-80"
                    : "w-[150px] scale-100 opacity-100"
                }`}
              />
            </div>
          </div>

          {/* Navigation Section - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <nav
              className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 transition-colors duration-200 ${
                collapsed ? "px-2 py-2" : "px-2 py-2"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
              }}
            >
              <div
                className={`flex flex-col gap-[2px] ${
                  collapsed ? "items-center" : ""
                }`}
              >
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center gap-3 py-2 rounded-xl transition-all duration-200 text-left group
              ${collapsed ? "justify-center px-2 w-[48px]" : "px-4 w-full"}
              ${
                isActive
                  ? "bg-[#0061fe] text-white shadow-md"
                  : "text-[#231f20] hover:text-white hover:shadow-sm"
              }
              hover:bg-[#0061fe] `}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {item.icon}
                      </span>
                      {!collapsed && (
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[16px] font-medium">
                            {item.label}
                          </span>

                          {item.path === "/tasks" && (
                            <TaskProjectDropdown
                              selectedProject={selectedProject}
                              setSelectedProject={setSelectedProject}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Footer Section - Fixed */}
          <div
            className={`flex-shrink-0  ${
              collapsed ? "px-2 py-4" : "px-4 py-6"
            }`}
          >
            {!collapsed ? (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="w-full flex items-center justify-center gap-2 bg-[#0061fe] text-white rounded-xl text-[18px] px-6 py-[8px] text-sm mx-auto transition-all duration-200 hover:bg-[#0056e0] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="flex items-center justify-center bg-[#0061fe] text-white rounded-xl p-2 transition-all duration-200 hover:bg-[#0056e0] hover:shadow-lg hover:scale-[1.05] active:scale-[0.95]"
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
            <nav className="flex flex-col gap-[2px]">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                // const isTaskItem = item.path === "/tasks";

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition
          ${
            isActive
              ? "bg-[#0061fe] text-white font-semibold"
              : "text-[#231f20] hover:bg-[#0061fe] hover:text-white"
          }`}
                  >
                    {item.icon}
                    <span className="text-[16px]">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-2 flex flex-col gap-4">
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

/*import {
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
import { HiTrophy } from "react-icons/hi2";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Leads", icon: <RiPieChart2Fill size={20} />, path: "/leads" },
  { label: "Customers", icon: <HiTrophy size={20} />, path: "/customers" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
  { label: "Inner Circle", icon: <FaUsers size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "M Library", icon: <IoLibrary size={20} />, path: "/library" },
  { label: "Reports", icon: <TbReport size={20} />, path: "/reports" },
  { label: "Archive", icon: <IoFileTrayFull size={20} />, path: "/archive" },
];

const SideBar = ({ isMobileOpen, setIsMobileOpen, collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const [selectedProject, setSelectedProject] = useState();

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
    ${
      collapsed
        ? "w-20 px-2 pt-[20px] pb-[10px]"
        : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
    }`}
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div
              className={`flex justify-center transition-all duration-300 ${
                collapsed ? "pt-6 pb-3" : "p-6"
              }`}
            >
              <img
                onClick={handleLogoClick}
                src={collapsed ? side_blue3 : side_blue}
                alt="Logo"
                className={`transition-all duration-500 ease-in-out transform cursor-pointer ${
                  collapsed
                    ? "w-7 scale-90 opacity-80"
                    : "w-[150px] scale-100 opacity-100"
                }`}
              />
            </div>

            <nav
              className={`flex flex-col gap-[2px] ${
                collapsed ? "items-center py-2" : "p-4"
              }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3 py-2 rounded-xl transition text-left
          ${collapsed ? "justify-center px-2 w-[48px]" : "px-4 w-full"}
          ${
            isActive
              ? "bg-[#0061fe] text-white"
              : "text-[#231f20] hover:text-white"
          }
          hover:bg-[#0061fe] `}
                  >
                    {item.icon}
                    {!collapsed && (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[16px]">{item.label}</span>

                        {item.path === "/tasks" && (
                          <TaskProjectDropdown
                            selectedProject={selectedProject}
                            setSelectedProject={setSelectedProject}
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={`flex flex-col gap-4 ${
              collapsed ? "px-2 py-4" : "px-4 py-6"
            }`}
          >
            {!collapsed ? (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="w-full flex items-center justify-center gap-2 bg-[#0061fe] text-white rounded-xl text-[18px] px-6 py-2 text-sm mx-auto"
              >
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="flex items-center justify-center bg-[#0061fe] text-white rounded-xl p-2"
              >
                <BiSupport size={20} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-blue-100/10 opacity-100 transition-opacity duration-500"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          <div className="relative z-50 w-64 bg-white text-[#231f20] h-screen flex flex-col px-10 py-8 max-h-screen overflow-y-auto">
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

            <nav className="flex flex-col gap-[2px]">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition
          ${
            isActive
              ? "bg-[#0061fe] text-white font-semibold"
              : "text-[#231f20] hover:bg-[#0061fe] hover:text-white"
          }`}
                  >
                    {item.icon}
                    <span className="text-[16px]">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-2 flex flex-col gap-4">
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

export default SideBar;*/

/*
import {
  Users,
  MessageSquare,
  X,
  Calendar,
  ClipboardList,
  ChartNoAxesCombined,
  Landmark,
} from "lucide-react";
import adminPanel from "../../assets/adminPanel.png";
import support from "../../assets/support.png";
import { useNavigate, useLocation } from "react-router-dom";
import { BsFillGridFill } from "react-icons/bs";
import { IoIosLogOut } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { SiGoogleads } from "react-icons/si";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Sales", icon: <ChartNoAxesCombined size={20} />, path: "/sales" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Leads", icon: <SiGoogleads size={20} />, path: "/leads" },
  { label: "Employees", icon: <Users size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
];

const SideBar = ({ isMobileOpen, setIsMobileOpen, collapsed }) => {
  const navigate = useNavigate();

  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      <aside
        className={`hidden md:flex h-screen transition-all duration-300 bg-[#F2F2F2]
    ${
      collapsed
        ? "w-20 px-2 pt-[20px] pb-[10px]"
        : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
    }`}
      >
        <div className="w-full h-full bg-white rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden">
          <div>
            <div
              className={`flex justify-center ${
                collapsed ? "pt-6 pb-3" : "p-6"
              }`}
            >
              <img
                src={adminPanel}
                alt="Logo"
                className={`transition-all duration-300 ${
                  collapsed ? "w-10" : "w-[60px]"
                }`}
              />
            </div>

            <nav
              className={`flex flex-col gap-[3px] ${
                collapsed ? "items-center py-2" : "p-4"
              }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3 py-2 rounded-md transition text-left
          ${collapsed ? "justify-center px-2 w-[48px]" : "px-4 w-full"}
          ${
            isActive
              ? "bg-[#DBDBDB] font-semibold text-[#1F2937]"
              : "text-[#7D8592]"
          }
          hover:bg-[#DBDBDB]`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            className={`flex flex-col gap-4 ${
              collapsed ? "px-2 py-4" : "px-4 py-6"
            }`}
          >
            {!collapsed ? (
              <div className="bg-gray-100 rounded-2xl py-4 px-3 w-[180px] m-auto">
                <img
                  src={support}
                  alt="Support"
                  className="w-[100px] m-auto h-[90px]"
                />
                <button className="flex items-center justify-center gap-2 bg-[#1F2937] text-white mt-3 rounded-2xl text-[18px] px-6 py-2 text-sm m-auto">
                  <BiSupport size={18} />
                  <span>Support</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button className="flex items-center justify-center bg-[#1F2937] text-white rounded-md p-2">
                  <BiSupport size={20} />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#f3f4f6] transition text-[#7D8592] w-full ${
                collapsed ? "justify-center px-0" : "text-left"
              }`}
            >
              <IoIosLogOut size={20} />
              {!collapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-blue-100/10 opacity-100 transition-opacity duration-500"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <div className="relative z-50 w-64 bg-[#1F2937] text-white h-full flex flex-col justify-between p-4">
            <div className="flex justify-between items-center mb-6">
              <img src={adminPanel} alt="Logo" className="w-24 m-auto" />
              <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#374151] transition"
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-10 flex flex-col gap-4">
              <button className="flex items-center justify-center gap-2 bg-white text-[#1F2937] rounded-2xl text-[18px] px-6 py-3 text-sm w-full">
                <BiSupport size={18} />
                <span>Support</span>
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#374151] w-full transition"
              >
                <IoIosLogOut size={20} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
*/
