import { Menu, Bell, User } from "lucide-react";
import { useState } from "react"; // buni boshida qo‘shing

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <header
      className="bg-white md:bg-[#F2F2F2] px-4 md:pl-4 md:pr-8 pb-3 pt-5 flex items-center justify-between w-full sticky top-0 z-40 
      shadow-sm sm:shadow-none rounded-b-xl md:rounded-b-none"
    >
      {/* Left - Menu */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleMobile} className="md:hidden">
          <Menu size={28} className="text-[#7D8592]" />
        </button>

        <button onClick={onToggleDesktop} className="hidden md:block">
          <Menu size={28} className="text-[#7D8592]" />
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 flex max-md:ml-1 max-md:py-1"
        />
      </div>

      <div className="flex items-center gap-5">
       
        {/* Bell */}
        <button className="relative w-12 h-[45px] bg-white rounded-[14px] flex items-center justify-center transition sm:shadow hover:shadow-md">
          <Bell size={24} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* USER */}
        {/* ✅ Mobile: only avatar */}
        <div className="sm:hidden">
          <img
            src="https://i.pravatar.cc/300"
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover"
          />
        </div>

        {/* ✅ Desktop: button with dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsUserOpen((prev) => !prev)}
            className="flex items-center gap-2 h-11 px-9 bg-white rounded-[14px] shadow hover:shadow-md transition"
          >
            <User size={22} className="text-gray-600" />
            <span className="font-medium text-base text-gray-700">Admin</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isUserOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isUserOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                👤 My Profile
              </div>
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                ⚙️ Settings
              </div>
              <div className="px-4 py-2 text-sm text-red-600 border-t hover:bg-gray-100 cursor-pointer">
                🚪 Logout
              </div>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
};

export default Navbar;
