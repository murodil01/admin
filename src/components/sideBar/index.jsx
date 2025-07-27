import {
  Plane,
  Users,
  MessageSquare,
  Info,
  LogOut,
  X,
  MessageCircle,
} from "lucide-react";
import adminPanel from "../../assets/adminPanel.png";
import support from "../../assets/support.png";
import { useNavigate, useLocation } from "react-router-dom";
import { BsFillGridFill, BsStack } from "react-icons/bs";

const menuItems = [
  { label: "Dashboard", icon: <BsFillGridFill size={20} />, path: "/" },
  { label: "Projects", icon: <BsStack size={20} />, path: "/projects" },
  { label: "Vacations", icon: <Plane size={20} />, path: "/vacations" },
  { label: "Employees", icon: <Users size={20} />, path: "/employees" },
  { label: "Messenger", icon: <MessageSquare size={20} />, path: "/messenger" },
  { label: "Info Portal", icon: <Info size={20} />, path: "/info-portal" },
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
        className={`hidden md:flex h-screen transition-all duration-300 
        ${
          collapsed
            ? "w-20 px-2"
            : "w-64 pt-[20px] pr-[15px] pb-[5px] pl-[15px]"
        } bg-[#F2F2F2]`}
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
              className={`flex flex-col gap-2 ${
                collapsed ? "items-center" : " p-4"
              }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#DBDBDB] transition w-full text-left
    ${collapsed ? "justify-center px-0" : ""}
    ${isActive ? "bg-[#DBDBDB] font-semibold text-[#1F2937]" : "text-[#7D8592]"}
  `}
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
                  className="w-[139px] m-auto h-[124px]"
                />
                <button className="flex items-center justify-center gap-2 bg-[#1F2937] text-white mt-3 rounded-2xl text-[18px] px-6 py-3 text-sm m-auto">
                  <MessageCircle size={18} />
                  <span>Support</span>
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button className="flex items-center justify-center bg-[#1F2937] text-white rounded-md p-2">
                  <MessageCircle size={20} />
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
              <LogOut size={20} />
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
              <div className="bg-gray-100 rounded-2xl py-4 px-3 w-full max-w-[168px] mx-auto">
                <img src={support} alt="Support" className="w-full" />
                <button className="flex items-center justify-center gap-2 bg-[#1F2937] text-white mt-3 rounded-2xl text-[18px] px-6 py-3 text-sm w-full">
                  <MessageCircle size={18} />
                  <span>Support</span>
                </button>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#374151] w-full transition"
              >
                <LogOut size={20} />
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
