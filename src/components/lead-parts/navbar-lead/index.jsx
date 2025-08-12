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

/* 
import { useState, useEffect } from "react";
import { User, Filter, Users } from "lucide-react";
import { getBoards, } from "../../../api/services/boardService";

const LeadNavbar = () => {
  const [boards, setBoards] = useState([]);
  const [openPerson, setOpenPerson] = useState(false);

  useEffect(() => {
    getBoards()
      .then((res) => {
        setBoards(res.data || []);
      })
      .catch((err) => {
        console.error("Boards yuklashda xatolik:", err);
      });
  }, []);

  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white rounded-t-[8px] relative">
      <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-semibold transition-colors text-center">
        New Item
      </button>

      <div className="relative">
        <button
          onClick={() => setOpenPerson((prev) => !prev)}
          className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center"
        >
          <User className="w-5 h-5" />
          Person
          <svg
            className={`w-4 h-4 transition-transform ${
              openPerson ? "rotate-180" : ""
            }`}
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

        {openPerson && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-md z-10">
            {boards.length > 0 ? (
              boards.map((board) => (
                <div
                  key={board.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {board.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">Ma'lumot yo'q</div>
            )}
          </div>
        )}
      </div>

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

*/
