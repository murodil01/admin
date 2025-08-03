import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarHeader = ({ currentDate, onNavigate, onAddEvent }) => {
  const monthYear = `${currentDate.toLocaleString('en-US', { month: 'long' })}, ${currentDate.getFullYear()}`;


  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
      
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
              {monthYear}
            </h2>

            <button
              onClick={() => onNavigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onAddEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
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
