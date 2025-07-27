import { Menu, Bell, User, Search } from "lucide-react";
import { useState, useRef } from "react"; // buni boshida qo‘shing
import useDropdownBehavior from "../../hooks/useOutsideClick";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const dropdownRef = useRef(null);
   // Hookni ishlatish, dropdownlar uchun tashqi bosishlarni aniqlash
   const dropUp = useDropdownBehavior(dropdownRef, isUserOpen, () => setIsUserOpen(false));

  return (
    <header
      className="bg-white md:bg-[#F2F2F2] px-4 md:pl-4 md:pr-8 pb-3 pt-5 flex items-center justify-between w-full sticky top-0 z-40 
      shadow-sm sm:shadow-none rounded-b-xl md:rounded-b-none gap-5"
    >
      {/* Left - Menu */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleMobile} className="md:hidden flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow hover:shadow-md">
          <Menu size={24} className="text-[#1F2937]" />
        </button>

        <button onClick={onToggleDesktop} className="hidden md:flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow hover:shadow-md">
          <Menu size={24} className="text-[#1F2937]" />
        </button>
      </div>

      <div className="flex-1 flex justify-center max-sm:-mr-4">
        <div className="relative w-full max-w-md bg-white rounded-xl max-md:border max-md:border-gray-300 max-sm:border-0 flex max-sm:flex-row-reverse items-center">
          {/* Search icon */}
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none max-sm:hidden">
            <Search className="w-5 h-5 text-[#0A1629]" />
          </span>
          <span className="hidden max-sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#0A1629]" />
          </span>

          {/* Input */}
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-[10px] pr-4 pl-10 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:py-1
                 max-sm:pl-3 max-sm:placeholder-transparent"
          />
        </div>
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
        <div className="relative hidden sm:block" ref={dropdownRef}>
          <button 
            onClick={() => setIsUserOpen((prev) => !prev)}
            className="flex items-center gap-2 h-11 px-9 bg-white rounded-[14px] shadow hover:shadow-md transition"
          >
            <User size={22} className="text-gray-600" />
            <span className="font-medium text-base text-gray-700">Admin</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""
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
