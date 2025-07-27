import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getMonthData, formatMonth, isSameDay } from '../../utils/calendar';
import AddEventModal from '../../components/calendar/AddEventModal';
import EventCard from '../../components/calendar/EventCard';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: "Anna's Birthday",
      date: new Date(2020, 8, 8),
      duration: 3,
      type: 'birthday',
      direction: 'down'
    },
    {
      id: '2',
      title: "Presentation of the new product",
      date: new Date(2020, 8, 16),
      duration: 2,
      type: 'presentation',
      direction: 'up'
    },
    {
      id: '3',
      title: "Ray's Birthday",
      date: new Date(2020, 8, 28),
      duration: 3,
      type: 'birthday',
      direction: 'down'
    }
  ]);

  useEffect(() => {
    setCurrentDate(new Date(2020, 8, 1));
  }, []);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const monthData = useMemo(() => {
    return getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleCellClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <button
            onClick={() => {
              setSelectedDate(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <h2 className="text-2xl font-semibold text-gray-800 mx-8 min-w-[200px] text-center">
            {formatMonth(currentDate)}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100">
            {weekDays.map(day => (
              <div key={day} className="p-4 text-center">
                <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                  {day}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {monthData.map((week, weekIndex) =>
              week.map((date, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className="border-b border-r border-gray-200 h-32 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCellClick(date)}
                >
                  {date && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(date).map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate(undefined);
        }}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;

