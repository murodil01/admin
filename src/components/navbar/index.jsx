import { Menu, Bell, Search, User } from "lucide-react";
import { useState } from "react";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <header
      className="bg-white md:bg-[#F2F2F2] px-4 md:pl-4 md:pr-8 py-3 flex items-center justify-between w-full sticky top-0 z-40 
      shadow-sm sm:shadow-none rounded-b-xl"
    >
      {/* Left - Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-[14px] bg-white transition"
        >
          <Menu size={24} className="text-[#1F2937]" />
        </button>

        <button
          onClick={onToggleDesktop}
          className="hidden md:flex w-11 h-11 items-center justify-center rounded-[14px] bg-white shadow hover:shadow-md transition"
        >
          <Menu size={24} className="text-[#1F2937]" />
        </button>
      </div>

      {/* Center - Search input */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-[412px] hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-300 rounded-[14px] text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={18}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Search icon for mobile */}
        <button
          className="sm:hidden w-11 h-11 flex items-center justify-center bg-white rounded-[14px] transition"
          onClick={() => alert("Mobile Search clicked")}
        >
          <Search size={20} className="text-[#1F2937]" />
        </button>

        {/* Bell */}
        <button className="relative w-11 h-11 bg-white rounded-[14px] flex items-center justify-center transition sm:shadow hover:shadow-md">
          <Bell size={22} className="text-gray-600" />
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
            className="flex items-center gap-2 h-11 px-4 bg-white rounded-[14px] shadow hover:shadow-md transition"
          >
            <User size={22} className="text-gray-600" />
            <span className="font-medium text-base text-gray-700">
              Admin
            </span>
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
