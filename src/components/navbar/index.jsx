import { Menu, Bell, User, Search, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaUserCircle, FaUserCog } from "react-icons/fa";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  const { user, loading, logout, refreshAuth } = useContext(AuthContext);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Agar user ma'lumotlari 5 sekunddan keyin ham kelmasa, retry qilish
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user && !loading && retryCount < 3) {
      console.log('🔄 User data not loaded, retrying...', retryCount + 1);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refreshAuth();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, retryCount, refreshAuth]);

  const navigateAndClose = (path) => {
    setIsUserOpen(false);
    localStorage.removeItem("userDropdownOpen");
    navigate(path);
  };

  useEffect(() => {
    const savedUserOpen = localStorage.getItem("userDropdownOpen");
    if (savedUserOpen === "true") {
      setIsUserOpen(true);
    }
  }, []);

  // Holatni localStorage ga yozish
  useEffect(() => {
    localStorage.setItem("userDropdownOpen", isUserOpen);
  }, [isUserOpen]);

  // Dropdown tashqarisiga bosilsa yopish
  useEffect(() => {
    const handleClickOutside = (e) => {
      setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsUserOpen(false);
        }
      }, 0);
    };

    if (isUserOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserOpen]);

  // Agar user ma'lumotlari hali yuklanmagan bo'lsa, loading ko'rsatish
  const renderUserAvatar = () => {
    const token = localStorage.getItem('token');
    
    if (loading || (!user && token)) {
      return (
        <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </div>
      );
    }

    if (!user && !token) {
      return (
        <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center">
          <User size={20} className="text-red-400" />
        </div>
      );
    }
    
    return (
      <img
        src={user.profile_picture || '/default-avatar.png'}
        alt="avatar"
        className="w-11 h-11 sm:w-8 sm:h-8 rounded-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  };

  return (
    <header
      className="bg-white md:bg-[#F2F2F2] mt-[10px] max-sm:mt-3 max-sm:mx-2.5 px-4 md:pl-4 md:pr-8 pb-3 pt-3 flex items-center justify-between max-w-full sticky top-0 z-40 
      shadow-sm sm:shadow-none rounded-[24px] md:rounded-none gap-5"
    >
      {/* Left - Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow "
        >
          <Menu size={24} className="text-[#1F2937]" />
        </button>

        <button
          onClick={onToggleDesktop}
          className="hidden md:flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow "
        >
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

      {/* RIGHT */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        {/* Bell */}
        <button
          onClick={() => navigateAndClose("/notification")}
          className="relative w-12 h-[45px] bg-white rounded-[14px] flex items-center justify-center transition sm:shadow "
        >
          <Bell size={24} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* ✅ Mobile: only avatar */}
        <div
          className="sm:hidden cursor-pointer"
          onClick={() => setIsUserOpen((prev) => !prev)}
        >
          {renderUserAvatar()}
          {/* Fallback icon agar rasm yuklanmasa */}
          <div className="w-11 h-11 rounded-full bg-gray-200 hidden items-center justify-center">
            <User size={20} className="text-gray-400" />
          </div>
        </div>

        {/* ✅ Desktop: button with dropdown */}
        <div className="hidden sm:block">
          <button
            onClick={() => setIsUserOpen((prev) => !prev)}
            className="flex justify-between w-44 items-center gap-2 h-11 px-3 bg-white rounded-[14px] shadow  transition"
          >
            {renderUserAvatar()}
            {/* Fallback icon agar rasm yuklanmasa */}
            <div className="w-8 h-8 rounded-full bg-gray-200 hidden items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
            
            <span className="font-medium text-base text-gray-700 truncate w-20">
              {loading || (!user && localStorage.getItem('token')) ? (
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              ) : user?.first_name ? (
                user.first_name
              ) : localStorage.getItem('token') ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshAuth();
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Retry
                </button>
              ) : (
                'Guest'
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""}`}
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
        </div>

        {/* 🔽 Dropdown (common for mobile and desktop) */}
        {isUserOpen && !loading && user && (
          <div className="absolute top-[60px] md:top-12 right-0 w-56 sm:w-48 md:w-44 bg-white rounded-[14px] shadow-lg py-2 z-50 space-y-1 text-sm text-gray-700">
            {/* Profile */}
            <div
              onClick={() => navigateAndClose(`/main-profile`)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <FaUserCircle size={18} /> <span>My Profile</span>
            </div>

            {/* Settings */}
            <div
              onClick={() => navigateAndClose("/settings")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Settings size={18} /> <span>Settings</span>
            </div>

            {/* Logout */}
            <div
              onClick={async () => {
                await logout(); // AuthContext'dagi logout funksiyasini ishlatish
                navigateAndClose("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer border-t border-gray-400 pt-2"
            >
              <IoIosLogOut size={18} />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;