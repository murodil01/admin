// pages/calendar/index.jsx
import React, { useState, useEffect } from "react";
import CalendarHeader from "../../components/calendar/CalendarHeader";
import Calendar from "../../components/calendar/Calendar";
import AddEventModal from "../../components/calendar/AddEventModal";
import EventDetailsModal from "../../components/calendar/EventDetailsModal";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../api/services/calendarService";
import {
  transformApiEventToFrontend,
  transformFrontendEventToApi,
} from "../../utils/calendarDataTransformer";
import { Permission } from "../../components/Permissions";
import { ROLES } from "../../components/constants/roles";

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // API dan eventlarni olish
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const apiEvents = await getEvents();

        // Transform each event asynchronously
        const transformedEvents = await Promise.all(
          apiEvents?.results.map((event) => transformApiEventToFrontend(event))
        );

        setEvents(transformedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        // Error notification ko'rsatishingiz mumkin
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleNavigate = (action) => {
    const newDate = new Date(currentDate);
    if (action === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleAddEvent = async (eventData) => {
    try {
      // Frontend data ni API format ga o'tkazish
      const apiData = transformFrontendEventToApi(eventData);

      // FormData yaratish files uchun
      const formData = new FormData();

      // Text fieldlarni qo'shish
      Object.keys(apiData).forEach((key) => {
        if (key !== "department_ids") {
          formData.append(key, apiData[key]);
        }
      });

      // Department IDs ni array sifatida qo'shish
      if (apiData.department_ids && apiData.department_ids.length > 0) {
        apiData.department_ids.forEach((id) => {
          formData.append("department_ids", id);
        });
      }

      // Files qo'shish
      if (eventData.image instanceof File) {
        formData.append("image", eventData.image);
      }
      if (eventData.file instanceof File) {
        formData.append("file", eventData.file);
      }

      const newApiEvent = await createEvent(formData);
      const transformedEvent = await transformApiEventToFrontend(newApiEvent);
      setEvents((prev) => [...prev, transformedEvent]);

      console.log("Event yaratildi:", transformedEvent);
    } catch (error) {
      console.error("Event yaratishda xatolik:", error);

      // Detailed error logging
      if (error.response?.data) {
        console.error("API Error Response:", error.response.data);
      }
    }
  };

  const handleEditEvent = async (updatedEvent) => {
    try {
      const apiData = transformFrontendEventToApi(updatedEvent);

      const formData = new FormData();
      Object.keys(apiData).forEach((key) => {
        if (key !== "department_ids") {
          formData.append(key, apiData[key]);
        }
      });

      // Department IDs ni array sifatida qo'shish
      if (apiData.department_ids && apiData.department_ids.length > 0) {
        apiData.department_ids.forEach((id) => {
          formData.append("department_ids", id);
        });
      }

      if (updatedEvent.image instanceof File) {
        formData.append("image", updatedEvent.image);
      }
      if (updatedEvent.file instanceof File) {
        formData.append("file", updatedEvent.file);
      }

      const updatedApiEvent = await updateEvent(updatedEvent.id, formData);
      const transformedEvent = await transformApiEventToFrontend(
        updatedApiEvent
      );

      setEvents((prev) =>
        prev.map((event) =>
          event.id === transformedEvent.id ? transformedEvent : event
        )
      );
      setSelectedEvent(transformedEvent);

      console.log("Event yangilandi:", transformedEvent);
    } catch (error) {
      console.error("Event yangilashda xatolik:", error);

      // Detailed error logging
      if (error.response?.data) {
        console.error("API Error Response:", error.response.data);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setShowDetailsModal(false);
      setSelectedEvent(null);

      console.log("Event o'chirildi");
    } catch (error) {
      console.error("Event o'chirishda xatolik:", error);
    }
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

  // Loading holati
  if (loading) {
    return (
      <div className="flex bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <CalendarHeader
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onAddEvent={() => setShowAddModal(true)}
          />
          <div className="flex-1 overflow-auto p-6 max-sm:p-0 flex items-center justify-center">
            <div className="text-gray-500">
              Calendar eventlari yuklanmoqda...
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
        <AddEventModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          onSave={handleAddEvent}
          selectedDate={selectedDate}
        />
      </Permission>
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
