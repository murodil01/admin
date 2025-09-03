import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarDay = ({
  date,
  events,
  currentEventIndex,
  onEventClick,
  onNavigateEvent,
  isToday,
  isCurrentMonth,
}) => {
  const dayNumber = date.getDate();
  const currentEvent = events[currentEventIndex];
  const hasMultipleEvents = events.length > 1;
  const additionalEventsCount = Math.max(0, events.length - 1);

  return (
    <div
      className={`max-sm:h-32 h-36 border p-2 relative transition-colors  truncate
    ${isToday ? "bg-blue-100 border-blue-400" : "bg-white border-gray-200"} 
    hover:bg-gray-50`}
    >
      {/* Date */}
      <div className="absolute top-2 left-2">
        <span
          className={`text-sm font-medium ${
            isCurrentMonth ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {dayNumber}
        </span>
      </div>

      {/* Department Icon */}
      {/* {currentEvent?.departments?.length > 0 && (
  <div className="absolute top-2 right-2 flex -space-x-2">
    {currentEvent.departments.map((dept) => (
      <div
        key={dept.id}
        className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-xs font-semibold overflow-hidden"
        title={dept.name}
      >
        {dept.avatar === "M" || !dept.avatar ? (
          dept.name?.[0] || "M"
        ) : (
          <img
            src={dept.avatar}
            alt={dept.name}
            className="w-full h-full object-cover rounded-full"
          />
        )}
      </div>
    ))}
  </div>
)} */}
      {Array.isArray(currentEvent?.departments) &&
        currentEvent.departments.length > 0 && (
          <div className="absolute top-2 right-2 flex -space-x-2">
            {currentEvent.department.slice(0, 2).map((dept, index) => (
              <div
                key={dept.id || index}
                className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden"
                title={dept.name}
              >
                {dept.photo ? (
                  <img
                    src={dept.photo}
                    alt={dept.name}
                    className="w-full h-full object-cover rounded-full border border-blue-300"
                  />
                ) : (
                  dept.name?.[0] || "D"
                )}
              </div>
            ))}

            {/* Agar 2tadan ko'p department bo'lsa, badge ko'rsatish */}
            {currentEvent.departments.length > 2 && (
              <div
                className="w-6 h-6 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold"
                title={`+${
                  currentEvent.departments.length - 2
                } more departments`}
              >
                +{currentEvent.departments.length - 2}
              </div>
            )}
          </div>
        )}

      {/* Event Content */}
      {currentEvent && (
        <div className="mt-6 flex flex-col items-center justify-center h-16">
          {/* Navigation arrows for multiple events */}
          {hasMultipleEvents && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateEvent("prev");
                }}
                className="absolute left-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateEvent("next");
                }}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </>
          )}

          {/* Event Image or Title */}
          <div
            className="cursor-pointer flex flex-col items-center max-w-full"
            onClick={(e) => {
              e.stopPropagation(); // 👉 bu onDayClick ishga tushmasligi uchun
              onEventClick(currentEvent);
            }}
          >
            {currentEvent.image ? (
              <>
                <img
                  src={
                    typeof currentEvent.image === "string"
                      ? currentEvent.image
                      : URL.createObjectURL(currentEvent.image)
                  }
                  alt={currentEvent.title}
                  className="max-w-[88px] max-h-16 object-cover rounded"
                />
                <span className="text-xs text-gray-600 mt-1 text-center truncate max-w-full">
                  {currentEvent.title}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-900 text-center px-1 max-w-full truncate">
                {currentEvent.title}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional events count badge */}
      {additionalEventsCount > 0 && (
        <div className="absolute bottom-2 right-2">
          <div className="py-[3px] px-1 bg-blue-600 text-white text-xs rounded-full  flex items-center justify-center">
            <span>{`+${additionalEventsCount}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

CalendarDay.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
        .isRequired,
      description: PropTypes.string,
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      department: PropTypes.arrayOf(
        // Changed to array
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
          avatar: PropTypes.string, // Note: API has no avatar field, you might need to map this
        })
      ),
      link: PropTypes.string,
      notification: PropTypes.string,
      viewOption: PropTypes.string,
      canEdit: PropTypes.bool,
      canDelete: PropTypes.bool,
    })
  ).isRequired,
  currentEventIndex: PropTypes.number.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onNavigateEvent: PropTypes.func.isRequired,
  isToday: PropTypes.bool,
  isCurrentMonth: PropTypes.bool,
};

export default CalendarDay;
