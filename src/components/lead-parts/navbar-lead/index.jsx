import { User, Filter, Users } from "lucide-react";

const LeadNavbar = () => {
  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white rounded-t-[8px]">
      <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-semibold transition-colors text-center">
        New Item
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center">
        <User className="w-5 h-5" />
        Person
      </button>

      <button className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center">
        <Filter className="w-5 h-5" />
        Filter
      </button>

      <button className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center">
        <Users className="w-5 h-5" />
        Group by
      </button>
    </div>
  );
};

export default LeadNavbar;
