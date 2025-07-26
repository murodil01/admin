import { Menu, Bell, User } from "lucide-react";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  return (
    <header className="bg-[#F2F2F2] px-4 sm:px-6 md:px-11 py-3 sm:py-4 flex flex-wrap items-center justify-between w-full gap-y-2">
      {/* Left: Menu */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button onClick={onToggleMobile} className="md:hidden">
          <Menu size={26} className="text-[#7D8592]" />
        </button>

        {/* Desktop menu */}
        <button onClick={onToggleDesktop} className="hidden md:block">
          <Menu size={26} className="text-[#7D8592]" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center order-3 sm:order-none w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search..."
          className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
        />
      </div>

      {/* Right: Notification + User */}
      <div className="flex items-center gap-4 sm:gap-5">
        <button className="relative">
          <Bell size={24} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button className="flex items-center gap-1 sm:gap-2">
          <User size={24} className="text-gray-600" />
          <span className="hidden sm:block font-medium text-sm sm:text-base text-gray-700">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
