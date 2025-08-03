import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSidebar } from "../../context/index";

const CalendarHeader = ({ currentDate, onNavigate, onAddEvent }) => {
  const { collapsed } = useSidebar(); // 👈 sidebar holati
  const monthYear = `${currentDate.toLocaleString("en-US", {
    month: "long",
  })}, ${currentDate.getFullYear()}`;

  const navigationWrapperClass = !collapsed
    ? "max-lg:order-3 max-lg:flex items-center justify-center max-lg:w-full"
    : ""; // 👈 sidebar expanded bo‘lsa va ekran kichik bo‘lsa

  const containerClass = !collapsed ? "max-lg:flex-wrap" : ""; // 👈 flex-wrap shart bilan

  return (
    <div className="bg-white max-sm:bg-transparent border-b border-gray-200 px-6 py-4 max-sm:px-0">
      <div
        className={`flex items-center justify-between max-sm:flex-wrap ${containerClass}`}
      >
        <h1 className="text-4xl font-bold max-sm:text-3xl text-gray-900">
          Calendar
        </h1>
        {/* Month and Year Navigation */}
        <div
          className={`max-sm:order-3 max-sm:w-full max-sm:flex items-center justify-center ${navigationWrapperClass}`}
        >
          <div className="flex items-center font-bold  max-sm:pt-4">
            <button
              onClick={() => onNavigate("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-2xl max-sm:text-xl font-bold text-gray-900 min-w-[200px] text-center">
              {monthYear}
            </h2>

            <button
              onClick={() => onNavigate("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onAddEvent}
            className="max-sm:text-xs sm:text-base font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 max-sm:size-3" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onNavigate: PropTypes.func.isRequired,
  onAddEvent: PropTypes.func.isRequired,
};

export default CalendarHeader;
