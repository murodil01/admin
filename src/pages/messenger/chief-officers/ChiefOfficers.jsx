import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Trash2, Phone } from 'lucide-react';

const ChiefOfficers = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const officers = [
    {
      id: 1,
      name: 'Allayorov Boburjon',
      position: 'Backend developer',
      level: 'Junior',
      phone: '+998 99 1234567',
      department: 'M Technology',
      tasks: 0,
      status: 'Working',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    },
    {
      id: 2,
      name: 'Allayorov Boburjon',
      position: 'Backend developer',
      level: 'Middle',
      phone: '+998 99 1234567',
      department: 'M Technology',
      tasks: 0,
      status: 'B3k',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    },
    {
      id: 3,
      name: 'Allayorov Boburjon',
      position: 'Backend developer',
      level: 'Senior',
      phone: '+998 99 1234567',
      department: 'M Technology',
      tasks: 0,
      status: 'On leave',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
    }
    // Qolgan officerlar xohlasang qo‘shib ketaverasan
  ];

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'Junior':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Middle':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Senior':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Working':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B3k':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'On leave':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (officer) => {
    console.log('Edit officer:', officer);
    setActiveDropdown(null);
  };

  const handleDelete = (officer) => {
    console.log('Delete officer:', officer);
    setActiveDropdown(null);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officers.map((officer, index) => (
                <tr
                  key={officer.id}
                  className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <img
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        src={officer.avatar}
                        alt={officer.name}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{officer.name}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">{officer.position}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelBadgeColor(officer.level)}`}>
                            {officer.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{officer.phone}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{officer.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{officer.tasks}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(officer.status)}`}>
                      {officer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(officer.id);
                        }}
                        className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {activeDropdown === officer.id && (
                        <div className="absolute right-0 top-10 mt-1 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                          <button
                            onClick={() => handleEdit(officer)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(officer)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChiefOfficers;
