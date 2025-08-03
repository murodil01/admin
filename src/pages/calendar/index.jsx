import React, { useState } from 'react';
import CalendarHeader from '../../components/calendar/CalendarHeader';
import Calendar from '../../components/calendar/Calendar';
import AddEventModal from '../../components/calendar/AddEventModal';
import EventDetailsModal from '../../components/calendar/EventDetailsModal';

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleNavigate = (action) => {
    const newDate = new Date(currentDate);
    if (action === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleAddEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleEditEvent = (updatedEvent) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setSelectedEvent(updatedEvent);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedDate(null);
  };

  return (
    <div className="flex bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onAddEvent={() => setShowAddModal(true)}
        />

        <div className="flex-1 overflow-auto p-6 max-sm:p-0">
          <Calendar
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        </div>
      </div>

      <AddEventModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
      />

      <EventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default CalendarPage;
