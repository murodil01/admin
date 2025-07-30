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
import { useNavigate, useLocation } from "react-router-dom";
import { BsFillGridFill } from "react-icons/bs";
import { BiSupport } from "react-icons/bi";
import { SiGoogleads } from "react-icons/si";
import { useState } from "react";
import { FaFolderOpen, FaUsers } from "react-icons/fa";
import { IoFileTrayFull } from "react-icons/io5";
import { TbReport } from "react-icons/tb";

import TaskProjectDropdown from "./TaskProjectDropdown";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Leads", icon: <SiGoogleads size={20} />, path: "/leads" },
  { label: "Sales", icon: <ChartNoAxesCombined size={20} />, path: "/sales" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
  { label: "Inner Circle", icon: <FaUsers size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "Files", icon: <FaFolderOpen size={20} />, path: "/files" },
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

  // const [selectedProject, setSelectedProject] = useState(
  //     "Medical App (iOS native)"
  //   );
  // const [currentProjectsOpen, setCurrentProjectsOpen] = useState(false);

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
                      <div className="w-full flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>

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
              <button className="w-full flex items-center justify-center gap-2 bg-[#1F2937] text-white mt-3 rounded-2xl text-[18px] px-6 py-2 text-sm m-auto">
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            ) : (
              <button className="flex items-center justify-center bg-[#1F2937] text-white rounded-md p-2">
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
          <div className="relative z-50 w-64 bg-[#1F2937] text-white h-screen flex flex-col p-4 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <img src={adminPanel} alt="Logo" className="w-24 m-auto" />
              <button onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
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

            {/* Footer */}
            <div className="mt-10 flex flex-col gap-4">
              <button className="flex items-center justify-center gap-2 bg-white text-[#1F2937] rounded-2xl text-[18px] px-6 py-3 text-sm w-full">
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
