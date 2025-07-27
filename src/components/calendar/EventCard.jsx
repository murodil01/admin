import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp } from 'lucide-react';

const EventCard = ({ event }) => {
  const getBorderColor = () => {
    switch (event.type) {
      case 'birthday':
        return 'border-l-purple-500';
      case 'presentation':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getArrowColor = () => {
    return event.direction === 'down' ? 'text-green-500' : 'text-yellow-500';
  };

  const truncateTitle = (title, maxLength = 20) => {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  };

  return (
    <div className={`bg-gray-200 rounded-lg p-2 mb-1 border-l-4 ${getBorderColor()} transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">
            {truncateTitle(event.title)}
          </p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-600 mr-1">{event.duration}h</span>
            {event.direction === 'down' ? (
              <ChevronDown className={`w-3 h-3 ${getArrowColor()}`} />
            ) : (
              <ChevronUp className={`w-3 h-3 ${getArrowColor()}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['birthday', 'presentation', 'other']).isRequired,
    direction: PropTypes.oneOf(['up', 'down']).isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    id: PropTypes.string.isRequired
  }).isRequired
};

export default EventCard;
