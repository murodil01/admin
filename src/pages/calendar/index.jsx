import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  getMonthData,
  formatMonth,
  isSameDay,
  isSameMonth,
  isToday,
} from "../../utils/calendar";
import AddEventModal from "../../components/calendar/AddEventModal";
import EventCard from "../../components/calendar/EventCard";
import EventListModal from "../../components/calendar/EventListModal";


const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [viewingEventsDate, setViewingEventsDate] = useState(null);
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Anna's Birthday",
      date: new Date(2020, 8, 8),
      duration: 3,
      type: "birthday",
      direction: "down",
    },
    {
      id: "2",
      title: "Presentation of the new product",
      date: new Date(2020, 8, 16),
      duration: 2,
      type: "presentation",
      direction: "up",
    },
    {
      id: "3",
      title: "Ray's Birthday",
      date: new Date(2020, 8, 28),
      duration: 3,
      type: "birthday",
      direction: "down",
    },
  ]);

  // const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthData = useMemo(() => {
    return getMonthData(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const getEventsForDate = (date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Math.random().toString(36).slice(2, 11),
      // date: new Date(eventData.date) // date string → Date object
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const handleCellClick = (date) => {
    if (getEventsForDate(date).length > 0) {
      setViewingEventsDate(date);
    } else {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };
  

  return (
    <div className="pt-5">
      <div className="max-2xl:w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-gray-900 text-xl sm:text-3xl  xl:text-4xl">Calendar</h1>
          <button
            onClick={() => {
              // setSelectedDate(undefined);
              // setIsModalOpen(true);
              setSelectedDate(new Date()); // ✅ Default bugungi sana
              setIsModalOpen(true);
            }}
            className="w-full max-w-44 flex items-center justify-center text-sm sm:text-base gap-2 bg-slate-800 text-white px-4 py-2 rounded-2xl hover:bg-slate-700 transition-colors sm:py-3"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

        {/* Calendar wrapper ⬇️ */}
        <div className="bg-white rounded-3xl max-sm:rounded-xl">
          <div className="flex items-center justify-center py-6">
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

          <div className="bg-white shadow-sm overflow-hidden rounded-b-3xl max-sm:rounded-b-xl flex-1 overflow-y-auto scroll-p-1 max-h-[calc(100vh-305px)]">
            {/* <div className="grid grid-cols-7 bg-gray-100">
            {weekDays.map((day) => (
              <div key={day} className="p-4 text-center">
                <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                  {day}
                </span>
              </div>
            ))}
          </div> */}

            <div className="grid grid-cols-7">
              {monthData.map((week, weekIndex) =>
                week.map((date, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`relative border-b border-r  h-32 p-2 cursor-pointer hover:bg-gray-50 transition-colors
                    ${
                      !isSameMonth(date, currentDate)
                        ? "bg-gray-50 text-gray-400"
                        : ""
                    } 
                    ${
                      isToday(date)
                        ? "border border-blue-500"
                        : "border-gray-200" // 🔥 BUGUNGI KUN UCHUN
                    }
                    `}
                    // onClick={() => handleCellClick(date)}
                    // Agar avvalgi oyning sana kataklari bosilganida modal ochilmaslini istasangiz⬇️
                    onClick={() =>
                      isSameMonth(date, currentDate) && handleCellClick(date)
                    }
                  >
                    {date && (
                      <>
                        {/* Weekday name only on first row */}
                        {weekIndex === 0 && (
                          <div className="absolute top-1 left-1 pt-0.5 pb-1 px-2 rounded-md text-sm bg-[#DBDBDB]  text-gray-500">
                            {
                              ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                                dayIndex
                              ]
                            }
                          </div>
                        )}
                        <div
                          className={`absolute top-1 right-1 text-sm ${
                            !isSameMonth(date, currentDate)
                              ? "text-gray-400"
                              : "text-gray-900"
                          } `}
                        >
                          {date.getDate()}
                        </div>
                        <div className="mt-6 space-y-1">
                          {/* {getEventsForDate(date).map((event) => (
                            <EventCard key={event.id} event={event} />
                          ))} */}
                          {(() => {
                            const eventsForDate = getEventsForDate(date);
                            const maxVisible = 2;
                            const visibleEvents = eventsForDate.slice(
                              0,
                              maxVisible
                            );
                            const hiddenCount =
                              eventsForDate.length - maxVisible;

                            return (
                              <div className="relative h-16">
                                {visibleEvents.map((event, idx) => (
                                  <div
                                    key={event.id}
                                    className={`absolute left-0 right-0 z-[${
                                      10 - idx
                                    }]`}
                                    style={{
                                      top: `${idx * 22}px`,
                                      left: `${idx * 4}px`,
                                    }}
                                  >
                                    <EventCard event={event} />
                                  </div>
                                ))}

                                {hiddenCount > 0 && (
                                  <div
                                    className="absolute right-0 bottom-0 text-xs font-medium text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                                    style={{
                                      transform: "translate(30%, 30%)", // badge slightly outside bottom right of last card
                                    }}
                                  >
                                    +{hiddenCount}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
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
        selectedDate={selectedDate} // string 'yyyy-MM-dd'
      />
      <EventListModal
  isOpen={!!viewingEventsDate}
  date={viewingEventsDate}
  events={viewingEventsDate ? getEventsForDate(viewingEventsDate) : []}
  onClose={() => setViewingEventsDate(null)}
  onAdd={(date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  }}
/>
    </div>
  );
};

export default Calendar;

// import React, { useState, useMemo } from "react";
// import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
// import {
//   getMonthData,
//   formatMonth,
//   isSameDay,
//   isSameMonth,
// } from "../../utils/calendar";
// import AddEventModal from "../../components/calendar/AddEventModal";
// import EventCard from "../../components/calendar/EventCard";

// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(undefined);
//   const [events, setEvents] = useState([
//     {
//       id: "1",
//       title: "Anna's Birthday",
//       date: new Date(2020, 8, 8),
//       duration: 3,
//       type: "birthday",
//       direction: "down",
//     },
//     {
//       id: "2",
//       title: "Presentation of the new product",
//       date: new Date(2020, 8, 16),
//       duration: 2,
//       type: "presentation",
//       direction: "up",
//     },
//     {
//       id: "3",
//       title: "Ray's Birthday",
//       date: new Date(2020, 8, 28),
//       duration: 3,
//       type: "birthday",
//       direction: "down",
//     },
//   ]);

//   const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//   const monthData = useMemo(() => {
//     return getMonthData(currentDate.getFullYear(), currentDate.getMonth());
//   }, [currentDate]);

//   const getEventsForDate = (date) => {
//     return events.filter((event) => isSameDay(event.date, date));
//   };

//   const handlePreviousMonth = () => {
//     setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
//   };

//   const handleAddEvent = (eventData) => {
//     const newEvent = {
//       ...eventData,
//       id: Math.random().toString(36).slice(2, 11),
//       // date: new Date(eventData.date) // date string → Date object
//     };
//     setEvents((prev) => [...prev, newEvent]);
//   };

//   const handleCellClick = (date) => {
//     if (date) {
//       setSelectedDate(date); // ✅ Date object bo‘lib qoladi
//       setIsModalOpen(true);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
//           <button
//             onClick={() => {
//               // setSelectedDate(undefined);
//               // setIsModalOpen(true);
//               setSelectedDate(new Date()); // ✅ Default bugungi sana
//               setIsModalOpen(true);
//             }}
//             className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Event
//           </button>
//         </div>

//         <div className="flex items-center justify-center mb-8">
//           <button
//             onClick={handlePreviousMonth}
//             className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//           >
//             <ChevronLeft className="w-6 h-6 text-gray-600" />
//           </button>

//           <h2 className="text-2xl font-semibold text-gray-800 mx-8 min-w-[200px] text-center">
//             {formatMonth(currentDate)}
//           </h2>

//           <button
//             onClick={handleNextMonth}
//             className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//           >
//             <ChevronRight className="w-6 h-6 text-gray-600" />
//           </button>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="grid grid-cols-7 bg-gray-100">
//             {weekDays.map((day) => (
//               <div key={day} className="p-4 text-center">
//                 <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
//                   {day}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <div className="grid grid-cols-7">
//             {monthData.map((week, weekIndex) =>
//               week.map((date, dayIndex) => (
//                 <div
//                   key={`${weekIndex}-${dayIndex}`}
//                   className={`border-b border-r border-gray-200 h-32 p-2 cursor-pointer hover:bg-gray-50 transition-colors
//                    ${
//                      !isSameMonth(date, currentDate)
//                        ? "bg-gray-50 text-gray-400"
//                        : ""
//                    }
//                     `}
//                   onClick={() => handleCellClick(date)}
//                 >
//                   {date && (
//                     <>
//                       <div className="text-sm font-medium text-gray-900 mb-2">
//                         {date.getDate()}
//                       </div>
//                       <div className="space-y-1">
//                         {getEventsForDate(date).map((event) => (
//                           <EventCard key={event.id} event={event} />
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       <AddEventModal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setSelectedDate(undefined);
//         }}
//         onAddEvent={handleAddEvent}
//         selectedDate={selectedDate} // string 'yyyy-MM-dd'
//       />
//     </div>
//   );
// };

// export default Calendar;
