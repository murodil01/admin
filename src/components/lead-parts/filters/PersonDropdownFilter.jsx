import { useState, useEffect, useRef } from 'react';
import { User, X, ChevronDown } from 'lucide-react';
import api from '../../../api/base';
import { getMSalesUsers } from '../../../api/services/userService';

const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://prototype-production-2b67.up.railway.app${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

const PersonDropdownFilter = ({ onPersonSelect, selectedPersonId, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Users ni yuklash
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        let myData = null;

        try {
          const meRes = await api.get("/me/");
          if (meRes.data) {
            myData = {
              id: meRes.data.id,
              name:
                meRes.data.fullname ||
                `${meRes.data.first_name || ""} ${
                  meRes.data.last_name || ""
                }`.trim() ||
                "Me",
              email: meRes.data.email,
              profile_picture: getAbsoluteImageUrl(meRes.data.profile_picture),
              isCurrentUser: true,
            };
            setCurrentUser(myData);
          }
        } catch (meErr) {
          console.warn("Failed to fetch current user:", meErr);
        }

        const res = await getMSalesUsers();
        if (res.data && Array.isArray(res.data)) {
          if (!myData) {
            const firstUser = res.data[0];
            if (firstUser) {
              myData = {
                id: firstUser.id,
                name:
                  firstUser.fullname ||
                  `${firstUser.first_name || ""} ${
                    firstUser.last_name || ""
                  }`.trim() ||
                  "Me",
                email: firstUser.email,
                profile_picture: getAbsoluteImageUrl(firstUser.profile_picture),
                isCurrentUser: true,
              };
              setCurrentUser(myData);
            }
          }

          const otherUsers = res.data
            .filter((user) => user.id !== myData?.id)
            .map((user) => ({
              id: user.id,
              name:
                user.fullname ||
                `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "Unknown User",
              email: user.email,
              profile_picture: getAbsoluteImageUrl(user.profile_picture),
              isCurrentUser: false,
            }));

          const allUsers = myData ? [myData, ...otherUsers] : otherUsers;
          setUsers(allUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (currentUser) {
          setUsers([currentUser]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderUserAvatar = (user) => {
    if (user?.profile_picture) {
      return (
        <img
          src={user.profile_picture}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      );
    }
  };

  const handleUserSelect = (user) => {
    onPersonSelect(user);
    setIsOpen(false);
  };

  const selectedUser = users.find(user => user.id === selectedPersonId);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full md:w-auto px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center relative ${
          selectedPersonId
            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
            : 'bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700'
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            <span className="hidden md:inline">Loading...</span>
          </>
        ) : selectedUser ? (
          <>
            {renderUserAvatar(selectedUser)}
            <span className="hidden md:inline ml-1">
              {selectedUser.isCurrentUser ? `${selectedUser.name} (Me)` : selectedUser.name}
            </span>
            <span className="md:hidden">
              {selectedUser.isCurrentUser ? 'Me' : selectedUser.name.split(' ')[0]}
            </span>
          </>
        ) : (
          <>
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Person</span>
          </>
        )}
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />

        {/* Active filter indicator */}
        {selectedPersonId && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            1
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto min-w-[280px]">
          {/* All People option */}
          <div
            className={`px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors border-b ${
              !selectedPersonId ? 'bg-blue-50 text-blue-600' : ''
            }`}
            onClick={() => handleUserSelect(null)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${!selectedPersonId ? 'text-blue-600' : 'text-gray-900'}`}>
                All People
              </div>
              <div className="text-sm text-gray-500">
                Show leads from all owners
              </div>
            </div>
            {!selectedPersonId && (
              <div className="w-4 h-4 text-blue-600">
                ✓
              </div>
            )}
          </div>

          {/* Current User (agar mavjud bo'lsa) */}
          {currentUser && (
            <div
              className={`px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors ${
                selectedPersonId === currentUser.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleUserSelect(currentUser)}
            >
              {renderUserAvatar(currentUser)}
              <div className="flex-1">
                <div className={`font-medium flex items-center gap-2 ${
                  selectedPersonId === currentUser.id ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {currentUser.name}
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    You
                  </span>
                </div>
                {currentUser.email && (
                  <div className="text-sm text-gray-500">
                    {currentUser.email}
                  </div>
                )}
              </div>
              {selectedPersonId === currentUser.id && (
                <div className="w-4 h-4 text-blue-600">
                  ✓
                </div>
              )}
            </div>
          )}

          {/* Other Users */}
          {users.filter(user => !user.isCurrentUser).map((user) => (
            <div
              key={user.id}
              className={`px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors ${
                selectedPersonId === user.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleUserSelect(user)}
            >
              {renderUserAvatar(user)}
              <div className="flex-1">
                <div className={`font-medium ${
                  selectedPersonId === user.id ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {user.name}
                </div>
                {user.email && (
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                )}
              </div>
              {selectedPersonId === user.id && (
                <div className="w-4 h-4 text-blue-600">
                  ✓
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <div className="px-4 py-6 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No users found</div>
            </div>
          )}

          {/* Clear Filter */}
          {selectedPersonId && (
            <div className="border-t bg-gray-50">
              <button
                onClick={() => handleUserSelect(null)}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Person Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonDropdownFilter;