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
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { IoFileTrayFull, IoLibrary } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { RiPieChart2Fill } from "react-icons/ri";
import { HiTrophy } from "react-icons/hi2";
import side_blue3 from "../../assets/side_blue3.png";
import LeadSide from "../lead-parts/leads-side"; // LeadSide komponentini import qilish
import { useSidebar } from "../../context/index";
const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
  { label: "Tasks", icon: <ClipboardList size={20} />, path: "/tasks" },
  { label: "Leads", icon: <RiPieChart2Fill size={20} />, path: "/leads", isModal: true },
  { label: "Customers", icon: <HiTrophy size={20} />, path: "/customers" },
  { label: "Departments", icon: <Landmark size={20} />, path: "/departments" },
  { label: "Inner Circle", icon: <FaUsers size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "M Library", icon: <IoLibrary size={20} />, path: "/library" },
  { label: "Reports", icon: <TbReport size={20} />, path: "/reports" },
  { label: "Archive", icon: <IoFileTrayFull size={20} />, path: "/archive" },
];

const SideBar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const { collapsed } = useSidebar();
  const location = useLocation();
  const [showLeadsModal, setShowLeadsModal] = useState(false);

  const handleNavigate = (path, isModal = false) => {
    if (isModal) {
      setShowLeadsModal(true);
    } else {
      navigate(path);
    }
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const handleLogoClick = () => {
    if (isMobileOpen) {
      localStorage.setItem("sidebarMobileOpen", "true");
    } else {
      localStorage.removeItem("sidebarMobileOpen");
    }
    window.location.reload();
  };

  const handleMobileLogoClick = (e) => {
    e.stopPropagation();
    localStorage.setItem("sidebarMobileOpen", "true");
    window.location.reload();
  };

  useEffect(() => {
    const savedMobileState = localStorage.getItem("sidebarMobileOpen");
    if (savedMobileState === "true") {
      setIsMobileOpen(true);
      localStorage.removeItem("sidebarMobileOpen");
    }
  }, [setIsMobileOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen transition-all duration-300 bg-[#F2F2F2]
      ${
        collapsed
          ? "w-20 px-2 pt-[20px] pb-[10px]"
          : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
      }`}
      >
        <div className="w-full h-full bg-white rounded-[24px] shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 mb-[5px]">
            <div
              onClick={handleLogoClick}
              className={`flex justify-center gap-[5px] items-center transition-all duration-300 cursor-pointer ${
                collapsed ? "pt-6 pb-3" : "p-6"
              }`}
            >
              <img src={side_blue3} alt="Logo" className="w-[30px]" />
              <h1
                className={`font-bold text-[#231f20] text-[25px] ${
                  collapsed ? "hidden" : ""
                }`}
              >
                Company
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-hidden">
            <nav
              className={`flex gap-1 flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 transition-colors duration-200 ${
                collapsed ? "px-2 py-2" : "px-4 py-2"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
              }}
            >
              {menuItems.map((item) => {
                const isActive =
                  (location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/") ||
                  (item.path === "/employees" &&
                    location.pathname.startsWith("/profile"))) && !item.isModal;

                const isLeadsActive = item.label === "Leads" && showLeadsModal;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path, item.isModal)}
                    className={`flex items-center gap-3 py-2 rounded-xl transition-all duration-200 text-left group h-[40px]
                      ${
                        collapsed
                          ? "justify-center px-2 w-[48px]"
                          : "px-4 w-full"
                      }
                      ${
                        isActive || isLeadsActive
                          ? "bg-[#0061fe] font-semibold text-white shadow-md"
                          : "text-[#7D8592] hover:text-white hover:shadow-sm"
                      }
                      hover:bg-[#0061fe] hover:text-white relative group`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="text-[16px] font-semibold">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div
            className={`flex-shrink-0 ${
              collapsed ? "px-2 py-4" : "px-4 py-6"
            } flex justify-center`}
          >
            <button
              onClick={() =>
                window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
              }
              className={`${
                collapsed
                  ? "bg-[#0061fe] text-white rounded-[14px] px-3 py-[10px] flex items-center justify-center"
                  : "w-full flex items-center justify-center gap-2 bg-[#0061fe] text-white rounded-xl px-6 py-[8px]"
              } transition-all duration-200 hover:bg-[#0056e0] hover:shadow-lg`}
            >
              <BiSupport size={collapsed ? 22 : 18} />
              {!collapsed && <span>Support</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
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

            <nav className="flex flex-col gap-1 sm:gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path && !item.isModal;
                const isLeadsActive = item.label === "Leads" && showLeadsModal;
                
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path, item.isModal)}
                    className={`flex items-center w-full rounded-xl transition px-3 py-2 sm:px-4 sm:py-2.5
                      ${
                        isActive || isLeadsActive
                          ? "bg-[#0061fe] text-white font-semibold"
                          : "text-[#7D8592] hover:bg-[#0061fe] hover:text-white"
                      }`}
                  >
                    <div className="w-5 h-5 mr-2 sm:mr-3 flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm sm:text-base font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 flex flex-col gap-4">
              <button
                onClick={() =>
                  window.open("https://t.me/+11Tug631E_40YTQy", "_blank")
                }
                className="flex items-center justify-center gap-2 border-[1px] border-[#0061fe] text-white bg-[#0061fe] rounded-xl font-bold text-[18px] px-6 py-[5px] text-sm w-full hover:shadow-lg hover:scale-[1.05] active:scale-[0.95]"
              >
                <BiSupport size={18} />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Modal */}
      {showLeadsModal && (
        <div className="w-full fixed inset-0 z-[60] flex items-center">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 backdrop-blur-[3px] transition-all duration-300 ${
              showLeadsModal ? "bg-opacity-50" : "bg-opacity-0"
            }`}
            onClick={() => setShowLeadsModal(false)}
          />

          {/* Modal Content: md ekranlarda sidebar kengligiga mos ml beradi */}
          <div
            className={`relative z-10 transform transition-all duration-300 
              ${showLeadsModal ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}
              ${collapsed ? "md:ml-16" : "md:ml-64"}`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLeadsModal(false)}
              className="absolute -top-4 -right-0 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            {/* LeadSide Component */}
            <div className="max-h-[90vh] overflow-auto">
              <LeadSide />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;