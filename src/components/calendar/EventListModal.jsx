import React from 'react';
import EventCard from './EventCard';

const EventListModal = ({ isOpen, date, events, onClose, onAdd }) => {
  if (!isOpen || !date) return null;

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-bold mb-4">{formattedDate}</h2>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-gray-500">No events for this day.</p>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
        <button
          onClick={() => {
            onClose();       // Close this modal
            onAdd(date);     // Open AddEventModal
          }}
          className="mt-4 w-full bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          + Add Event
        </button>
      </div>
    </div>
  );
};

export default EventListModal;
