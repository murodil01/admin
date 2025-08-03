import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import CalendarDay from './CalendarDay';

const Calendar = ({ currentDate, events, onEventClick, onDayClick }) => {
  const [dayEventIndices, setDayEventIndices] = useState({});

  const { calendarDays, firstDay } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() || 7) + 1); // start from Monday

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { calendarDays: days, firstDay };
  }, [currentDate]);

  const getEventsForDay = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleNavigateEvent = (date, direction) => {
    const dateKey = date.toDateString();
    const dayEvents = getEventsForDay(date);
    const currentIndex = dayEventIndices[dateKey] || 0;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : dayEvents.length - 1;
    } else {
      newIndex = currentIndex < dayEvents.length - 1 ? currentIndex + 1 : 0;
    }

    setDayEventIndices((prev) => ({
      ...prev,
      [dateKey]: newIndex,
    }));
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map((day) => (
          <div key={day} className="p-4 text-center">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 max-h-[calc(100vh-300px)]">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const dateKey = date.toDateString();
          const currentEventIndex = dayEventIndices[dateKey] || 0;

          const isToday =
          date.toDateString() === new Date().toDateString();
        const isCurrentMonth =
          date.getMonth() === currentDate.getMonth();

          return (
            <div
              key={index}
              onClick={() => onDayClick(date)}
              className="cursor-pointer"
            >
              <CalendarDay
                date={date}
                events={dayEvents}
                currentEventIndex={currentEventIndex}
                onEventClick={onEventClick}
                onNavigateEvent={(direction) => handleNavigateEvent(date, direction)}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

Calendar.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]).isRequired,
      description: PropTypes.string,
      image: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object, // for File
      ]),
      department: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        icon: PropTypes.string,
        color: PropTypes.string,
      }),
      link: PropTypes.string,
      notification: PropTypes.string,
      viewOption: PropTypes.string,
    })
  ).isRequired,
  onEventClick: PropTypes.func.isRequired,
  onDayClick: PropTypes.func.isRequired,
};

export default Calendar;

 