import { Menu, Bell, User } from "lucide-react";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {

  return (
    <header className="bg-[#F2F2F2] pl-6 pr-6 md:pr-11 py-4 flex items-center justify-between w-full gap-4">
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
        <button className="relative">
          <Bell size={26} className="text-gray-600" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
        </button>

        <button className="flex items-center gap-2">
          <User size={26} className="text-gray-600" />
          <span className="hidden sm:block font-medium text-base text-gray-700">
            Admin
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;