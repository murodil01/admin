import { useState, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  GripVertical,
  Plus,
  X,
} from "lucide-react";
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  getLeads,
  updateLeads,
  createLeads,
} from "../../../api/services/leadsService";
import { getMSalesUsers, getusersAll } from "../../../api/services/userService";
import { getBoardsAll } from "../../../api/services/boardService"; 
import { Select, Avatar } from "antd";
import { getMe } from "../../../api/services/authService";

// Helper function to get absolute image URL
const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://prototype-production-2b67.up.railway.app${url.startsWith("/") ? "" : "/"}${url}`;
};

// Normalize payload: nested objects -> ids, string numbers -> Number, empty strings -> undefined
const normalizePayload = (obj = {}) => {
  const out = {};
  for (const key in obj) {
    let val = obj[key];

    // Convert nested object with id to id
    if (val && typeof val === "object") {
      if ("id" in val && (val.id !== undefined && val.id !== null)) {
        out[key] = val.id;
        continue;
      }
      // sometimes status may be an object only with name; fallback to name if id missing
      if (key === "status" && val.name) {
        out[key] = val.id ?? val.name;
        continue;
      }
      // otherwise send object as-is (rare)
      out[key] = val;
      continue;
    }

    // Convert numeric-like strings for known numeric fields
    if (
      typeof val === "string" &&
      val.trim() !== "" &&
      (/^(?:\d+|\d+\.\d+)$/).test(val.trim()) &&
      /progress|potential|value|amount|price|count|id/i.test(key)
    ) {
      out[key] = Number(val);
      continue;
    }

    // Turn empty strings into undefined so server-side required validation triggers sensible messages
    if (val === "") {
      out[key] = undefined;
      continue;
    }

    out[key] = val;
  }
  return out;
};

// calculateRemainingTime unchanged
const calculateRemainingTime = (startDateStr, endDateStr) => {
  if (!endDateStr || !startDateStr) return "No timeline";
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid date";
  if (end < start) return "Invalid timeline";
  const effectiveStart = now > start ? now : start;
  const diffMs = end - effectiveStart;
  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const days = Math.floor(absDiffMs / 86400000);
    const hours = Math.floor((absDiffMs % 86400000) / 3600000);
    return `${days} days, ${hours} h overdue`;
  }
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days} days ${hours} h remaining`;
};

// TimelineRangePicker unchanged (kept for brevity)
const TimelineRangePicker = ({ task, onSave, isOpen, onToggle }) => {
  const [startDate, setStartDate] = useState(
    task.timeline_start ? new Date(task.timeline_start) : null
  );
  const [endDate, setEndDate] = useState(
    task.timeline_end ? new Date(task.timeline_end) : null
  );

  const handleSave = () => {
    const startDateStr = startDate ? startDate.toISOString().split("T")[0] : null;
    const endDateStr = endDate ? endDate.toISOString().split("T")[0] : null;
    onSave(task.id, {
      timeline_start: startDateStr,
      timeline_end: endDateStr
    });
    onToggle();
  };

  const handleCancel = () => {
    setStartDate(task.timeline_start ? new Date(task.timeline_start) : null);
    setEndDate(task.timeline_end ? new Date(task.timeline_end) : null);
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 z-[10000] bg-white border border-gray-300 rounded-lg shadow-2xl p-4 min-w-[320px]">
      <div className="space-y-4">
        <div className="text-sm font-semibold text-gray-700 text-center">
          Select Timeline Range
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <ReactDatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start date"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End Date
            </label>
            <ReactDatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End date"
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>

        {startDate && endDate && (
          <div className="text-center py-2 px-3 bg-blue-50 rounded-md">
            <div className="text-xs text-gray-600">Timeline:</div>
            <div className="text-sm font-medium text-blue-700">
              {calculateRemainingTime(
                startDate.toISOString().split("T")[0],
                endDate.toISOString().split("T")[0]
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            disabled={!startDate || !endDate}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// New Add Lead Modal Component
const AddLeadModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    link: "ad",
    person: "",
    notes: "",
    status: "",
    group: "",
    potential_value: 0,
    timeline_start: "",
    timeline_end: ""
  });

  const [groupOptions, setGroupOptions] = useState([]);
  const [personOptions, setPersonOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const fetchDropdownData = async () => {
    try {
      // Fetch groups
      const boardsRes = await getBoardsAll();
      if (boardsRes.data && Array.isArray(boardsRes.data)) {
        setGroupOptions(boardsRes.data.map(board => ({
          id: board.id,
          name: board.name
        })));

        // Extract statuses from boards
        const allStatuses = [];
        boardsRes.data.forEach(board => {
          if (board.statuses && Array.isArray(board.statuses)) {
            board.statuses.forEach(status => {
              if (!allStatuses.find(s => s.id === status.id)) {
                allStatuses.push({
                  id: status.id,
                  name: status.name
                });
              }
            });
          }
        });
        setStatusOptions(allStatuses);
      }

      // Fetch persons
      const usersRes = await getMSalesUsers();
      if (usersRes.data && Array.isArray(usersRes.data)) {
        setPersonOptions(usersRes.data.map(user => ({
          id: user.id,
          name: user.fullname || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
        })));
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert("Lead name is required");
      return;
    }
    if (!formData.group) {
      alert("Group is required");
      return;
    }
    if (!formData.status) {
      alert("Status is required");
      return;
    }

    await onSubmit(formData);
    
    // Reset form
    setFormData({
      name: "",
      phone: "",
      link: "ad",
      person: "",
      notes: "",
      status: "",
      group: "",
      potential_value: 0,
      timeline_start: "",
      timeline_end: ""
    });
  };

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      link: "ad",
      person: "",
      notes: "",
      status: "",
      group: "",
      potential_value: 0,
      timeline_start: "",
      timeline_end: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000]">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Lead</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter lead name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group *
              </label>
              <select
                value={formData.group}
                onChange={(e) => handleInputChange('group', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Group</option>
                {groupOptions.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                
              >
                <option value="">Select Status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Person
              </label>
              <select
                value={formData.person}
                onChange={(e) => handleInputChange('person', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Person</option>
                {personOptions.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potential Value
              </label>
              <input
                type="number"
                value={formData.potential_value}
                onChange={(e) => handleInputChange('potential_value', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source/Link
            </label>
            <select
              value={formData.link}
              onChange={(e) => handleInputChange('link', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ad">Ad</option>
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline Start
              </label>
              <input
                type="date"
                value={formData.timeline_start}
                onChange={(e) => handleInputChange('timeline_start', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline End
              </label>
              <input
                type="date"
                value={formData.timeline_end}
                onChange={(e) => handleInputChange('timeline_end', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={formData.timeline_start}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
              placeholder="Enter notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// TimelineCell: send normalized payload to updateLeads
const TimelineCell = ({ task, onTimelineUpdate }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSave = async (taskId, timelineData) => {
    try {
      onTimelineUpdate(taskId, timelineData);
      const payload = normalizePayload(timelineData);
      await updateLeads(taskId, payload);
      console.log("✅ Timeline updated on server");
      setIsPickerOpen(false);
    } catch (error) {
      console.error("❌ Error updating timeline:", error.response?.data || error);
    }
  };

  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };

  return (
    <td className="p-4 border-r border-gray-200 relative">
      <div className="flex justify-center items-center gap-2">
        <span 
          onClick={togglePicker}
          className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 hover:underline transition-colors px-2 py-1 rounded hover:bg-blue-50"
          title="Click to edit timeline"
        >
          {calculateRemainingTime(task.timeline_start, task.timeline_end)}
        </span>

        <TimelineRangePicker
          task={task}
          onSave={handleSave}
          isOpen={isPickerOpen}
          onToggle={togglePicker}
        />
      </div>

      {isPickerOpen && (
        <div 
          className="fixed inset-0 z-[1000]" 
          onClick={togglePicker}
        />
      )}
    </td>
  );
};

// OwnerDropdown: normalize update payload (use person_detail id)
const OwnerDropdown = ({ currentOwner, onChange, onSave, taskId }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let myData = null;
        try {
          const meRes = await getMe();
          if (meRes.data) {
            myData = {
              id: meRes.data.id,
              name: meRes.data.first_name || `${meRes.data.first_name || ''} ${meRes.data.last_name || ''}`.trim() || "Me",
              email: meRes.data.email,
              profile_picture: getAbsoluteImageUrl(meRes.data.profile_picture),
              isCurrentUser: true
            };
            setCurrentUser(myData);
          }
        } catch (meErr) {
          console.warn("Failed to fetch current user, using fallback:", meErr);
        }

        const res = await getMSalesUsers();
        if (res.data && Array.isArray(res.data)) {
          if (!myData) {
            const firstUser = res.data[0];
            if (firstUser) {
              myData = {
                id: firstUser.id,
                name: firstUser.fullname || `${firstUser.first_name || ''} ${firstUser.last_name || ''}`.trim() || "Me",
                email: firstUser.email,
                profile_picture: getAbsoluteImageUrl(firstUser.profile_picture),
                isCurrentUser: true
              };
              setCurrentUser(myData);
            }
          }

          const otherUsers = res.data
            .filter(user => user.id !== myData?.id)
            .map(user => ({
              id: user.id,
              name: user.fullname || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Unknown User",
              email: user.email,
              profile_picture: getAbsoluteImageUrl(user.profile_picture),
              isCurrentUser: false
            }));

          const allUsers = myData ? [myData, ...otherUsers] : otherUsers;
          setUserOptions(allUsers);
        } else {
          console.warn("No users data received or invalid format");
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (currentUser) setUserOptions([currentUser]);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = async (selectedUserId) => {
    const selectedUser = userOptions.find(u => u.id === selectedUserId);
    const personDetail = {
      id: selectedUser.id,
      fullname: selectedUser.name, 
      profile_picture: selectedUser.profile_picture
    };
    onChange(personDetail);

    try {
      // API usually expects person_detail: id
      await updateLeads(taskId, normalizePayload({ person_detail: selectedUser.id }));
      console.log("✅ Owner updated on server");
    } catch (err) {
      console.error("Failed to update owner:", err.response?.data || err);
    }

    setIsOpen(false);
  };

  const renderOwnerAvatar = (owner) => {
    if (owner?.profile_picture) {
      return (
        <img 
          src={getAbsoluteImageUrl(owner.profile_picture)} 
          alt={owner.fullname} 
          className="w-full h-full object-cover"
        />
      );
    } else {
      return (
        <svg 
          className="w-5 h-5 text-white" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className="relative">
       <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
          {renderOwnerAvatar(currentOwner)}
        </div>
        <span className="text-gray-700 truncate flex-1 text-left">
          {currentOwner?.fullname || "No Owner"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
       {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[100000] min-w-[200px] max-h-60 overflow-y-auto">
          {userOptions.map((user) => (
            <button
              key={user.id}
              onClick={() => handleChange(user.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                {user.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium">
                  {user.isCurrentUser ? `${user.name} (Me)` : user.name}
                </div>
                {user.email && (
                  <div className="text-xs text-gray-500">{user.email}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
       {isOpen && (
        <div 
          className="fixed inset-0 z-[99999]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// StatusDropdown: ensure update sends id (or name fallback)
const StatusDropdown = ({ value, onChange, taskId }) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const allStatuses = [];
        try {
          const leadsRes = await getLeads();
          if (leadsRes.data && Array.isArray(leadsRes.data)) {
            leadsRes.data.forEach(lead => {
              if (lead.status && (lead.status.name || lead.status.id)) {
                if (!allStatuses.find(s => s.id === lead.status.id)) {
                  allStatuses.push({
                    id: lead.status.id ?? lead.status,
                    name: lead.status.name ?? lead.status,
                    icon: getStatusIcon(lead.status.name ?? lead.status),
                    lightBg: getStatusLightBg(lead.status.name ?? lead.status),
                    textColor: getStatusTextColor(lead.status.name ?? lead.status)
                  });
                }
              }
            });
          }
        } catch (leadsErr) {
          console.error("Error fetching statuses from leads:", leadsErr);
        }

        try {
          const boardsRes = await getBoardsAll();
          if (boardsRes.data && Array.isArray(boardsRes.data)) {
            boardsRes.data.forEach(board => {
              if (board.statuses && Array.isArray(board.statuses)) {
                board.statuses.forEach(status => {
                  if (!allStatuses.find(s => s.id === status.id)) {
                    allStatuses.push({
                      id: status.id,
                      name: status.name,
                      color: status.color || "#6b7280",
                      icon: getStatusIcon(status.name),
                      lightBg: getStatusLightBg(status.name),
                      textColor: getStatusTextColor(status.name)
                    });
                  }
                });
              } else if (board.id && board.name) {
                if (!allStatuses.find(s => s.id === board.id)) {
                  allStatuses.push({
                    id: board.id,
                    name: board.name,
                    color: board.color || "#6b7280",
                    icon: getStatusIcon(board.name),
                    lightBg: getStatusLightBg(board.name),
                    textColor: getStatusTextColor(board.name)
                  });
                }
              }
            });
          }
        } catch (boardsErr) {
          console.error("Error fetching statuses from boards:", boardsErr);
        }

        setStatusOptions(allStatuses);
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        const fallbackStatuses = [
          { id: 'default-1', name: 'Not Started', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' },
          { id: 'default-2', name: 'Working on it', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
          { id: 'default-3', name: 'Stuck', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
          { id: 'default-4', name: 'Done', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' }
        ];
        setStatusOptions(fallbackStatuses);
      }
    };

    fetchStatuses();
  }, []);

  const getStatusIcon = (statusName) => {
    if (!statusName) return Circle;
    const name = String(statusName).toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return CheckCircle2;
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return Circle;
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return AlertCircle;
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return XCircle;
    return Circle;
  };

  const getStatusLightBg = (statusName) => {
    if (!statusName) return "bg-gray-50";
    const name = String(statusName).toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return "bg-green-50";
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return "bg-yellow-50";
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return "bg-red-50";
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return "bg-gray-50";
    return "bg-blue-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = String(statusName).toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return "text-green-700";
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return "text-yellow-700";
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return "text-red-700";
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return "text-gray-700";
    return "text-blue-700";
  };

  const handleChange = async (selectedStatusId) => {
    const selectedStatus = statusOptions.find(s => s.id === selectedStatusId);
    onChange(selectedStatus?.name ?? selectedStatusId);

    try {
      // Send id if available, otherwise send name
      const payload = normalizePayload({ status: selectedStatus?.id ?? selectedStatus?.name ?? selectedStatusId });
      await updateLeads(taskId, payload);
      console.log("✅ Status updated on server");
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err);
    }

    setIsOpen(false);
  };

  const currentStatus = statusOptions.find(s => s.name === value) || {
    name: value || "No Status",
    icon: Circle,
    lightBg: "bg-gray-50",
    textColor: "text-gray-500"
  };

  const StatusIcon = currentStatus.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-3 px-2 py-1 rounded-full ${currentStatus.lightBg} ${currentStatus.textColor} text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
      >
        <StatusIcon className="w-4 h-4" />
        {currentStatus.name}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[10000] min-w-[200px] max-h-60 overflow-y-auto">
          {statusOptions.map((status) => {
            const OptionIcon = status.icon;
            return (
              <button
                key={status.id}
                onClick={() => handleChange(status.id)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${status.textColor} text-sm transition-colors`}
              >
                <OptionIcon className="w-4 h-4" />
                {status.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// PersonDropdown: assume updateLeads(leadId, data)
const PersonDropdown = ({ value, onChange, onSave, groupId, leadId }) => {
  const [personOptions, setPersonOptions] = useState([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await getLeads();
        const options = res.data
          .filter((lead) => lead.person_detail)
          .map((lead) => ({
            id: lead.person_detail.id,
            name: lead.person_detail.fullname || "Unnamed Person",
            img: getAbsoluteImageUrl(lead.person_detail.profile_picture),
          }));
        setPersonOptions(options);
      } catch (err) {
        console.error("Failed to fetch persons:", err);
      }
    };
    fetchPersons();
  }, []);

  const handleChange = async (selectedId) => {
    const selectedPerson =
      personOptions.find((p) => p.id === selectedId) || null;

    onChange(selectedPerson);

    if (leadId) {
      try {
        await updateLeads(leadId, normalizePayload({ person_detail: selectedId }));
        console.log("✅ person_detail updated for lead", leadId);
      } catch (err) {
        console.error("Failed to update person_detail:", err.response?.data || err);
      }
    }

    onSave();
  };

  return (
    <Select
      value={value?.id || undefined}
      onChange={handleChange}
      onBlur={onSave}
      placeholder="Select Person"
      style={{ width: "100%", border: "none" }}
      className="ant-select-borderless custom-selectt"
      optionLabelProp="label"
    >
      {personOptions.map((person) => (
        <Select.Option
          key={person.id}
          value={person.id}
          label={person.name}
          style={{ border: "none" }}
        >
          <div className="flex items-center gap-2">
            {person.img && <Avatar size={24} src={person.img} />}
            <span>{person.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

// Add Lead Modal Component
const AddLeadModal = ({ isOpen, onClose, onCreate, groups, statusOptions, users }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    link: "",
    person: "",
    notes: "",
    status: "",
    group: "",
    order: 9223372036854776000,
    potential_value: 9223372036854776000,
    timeline_start: "2025-08-29",
    timeline_end: "2025-08-29",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date ? date.toISOString().split("T")[0] : null }));
  };

  const handleSubmit = async () => {
    try {
      await onCreate(formData);
      onClose();
    } catch (err) {
      console.error("Error creating lead:", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 min-w-[400px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add New Lead</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="link"
            placeholder="Link"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <Select
            placeholder="Person"
            value={formData.person || undefined}
            onChange={(value) => handleSelectChange("person", value)}
            style={{ width: "100%" }}
          >
            {users.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.fullname || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User"}
              </Select.Option>
            ))}
          </Select>
          <input
            type="text"
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <Select
            placeholder="Status"
            value={formData.status || undefined}
            onChange={(value) => handleSelectChange("status", value)}
            style={{ width: "100%" }}
          >
            {statusOptions.map((status) => (
              <Select.Option key={status.id} value={status.id}>
                {status.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Group"
            value={formData.group || undefined}
            onChange={(value) => handleSelectChange("group", value)}
            style={{ width: "100%" }}
          >
            {groups.map((group) => (
              <Select.Option key={group.id} value={group.id}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
          <input
            type="number"
            name="order"
            placeholder="Order"
            value={formData.order}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            name="potential_value"
            placeholder="Potential Value"
            value={formData.potential_value}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <ReactDatePicker
            selected={formData.timeline_start ? new Date(formData.timeline_start) : null}
            onChange={(date) => handleDateChange("timeline_start", date)}
            placeholderText="Timeline Start"
            className="w-full p-2 border border-gray-300 rounded-md"
            dateFormat="yyyy-MM-dd"
          />
          <ReactDatePicker
            selected={formData.timeline_end ? new Date(formData.timeline_end) : null}
            onChange={(date) => handleDateChange("timeline_end", date)}
            placeholderText="Timeline End"
            className="w-full p-2 border border-gray-300 rounded-md"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Table Component
const Table = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [apiLeads, setApiLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const [personOptions, setPersonOptions] = useState([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadTitle, setNewLeadTitle] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getBoardsAll();
        if (res.data && Array.isArray(res.data)) {
          setGroupOptions(res.data.map(board => ({
            id: board.id,
            name: board.name
          })));
        }
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await getMSalesUsers();
        if (res.data && Array.isArray(res.data)) {
          setPersonOptions(res.data.map(user => ({
            id: user.id,
            name: user.fullname || `${user.first_name} ${user.last_name}`.trim()
          })));
        }
      } catch (err) {
        console.error("Failed to fetch persons:", err);
      }
    };
    fetchPersons();
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await getBoardsAll();
        if (res.data && Array.isArray(res.data)) {
          const allStatuses = [];
          res.data.forEach(board => {
            if (board.statuses && Array.isArray(board.statuses)) {
              board.statuses.forEach(status => {
                allStatuses.push({
                  id: status.id,
                  name: status.name
                });
              });
            }
          });
          setStatusOptions(allStatuses);
        }
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
      }
    };
    fetchStatuses();
  }, []);

  const statusConfig = {
    Done: {
      color: "bg-green-500",
      icon: CheckCircle2,
      lightBg: "bg-green-50",
      textColor: "text-green-700",
    },
    "Working on it": {
      color: "bg-yellow-500",
      icon: Circle,
      lightBg: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    Stuck: {
      color: "bg-red-500",
      icon: AlertCircle,
      lightBg: "bg-red-50",
      textColor: "text-red-700",
    },
    "Not Started": {
      color: "bg-gray-400",
      icon: XCircle,
      lightBg: "bg-gray-50",
      textColor: "text-gray-700",
    },
    "No Status": {
      color: "bg-gray-300",
      icon: Circle,
      lightBg: "bg-gray-50",
      textColor: "text-gray-500",
    },
  };

  const fieldMap = {
    task: "name",
    progress: "potential_value",
  };

  const convertApiLeadsToTasks = (leads) => {
    return leads.map((lead, index) => ({
      id: lead.id,
      task: lead.name || `Lead ${index + 1}`,
      person: lead.person_detail?.fullname || "Unknown Person",
      profile_picture: getAbsoluteImageUrl(lead.person_detail?.profile_picture),
      status: lead.status?.name || lead.status || "No Status",
      priority:
        lead.potential_value > 50
          ? "High"
          : lead.potential_value > 20
          ? "Medium"
          : "Low",
      timeline_start: lead.timeline_start,
      timeline_end: lead.timeline_end,
      progress: lead.potential_value || 0,
      team: lead.link || "General",
      phone: lead.phone || "",
      notes: lead.notes || "",
      owner: lead.person_detail || null,
      source: "api",
    }));
  };

  // Timeline update handler
  const handleTimelineUpdate = (taskId, timelineData) => {
    setApiLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === taskId 
          ? { ...lead, ...timelineData }
          : lead
      )
    );
  };

  const loadLeadsFromAPI = async (groupId = null) => {
    try {
      setLoading(true);
      console.log("🔍 Loading leads from API...");
      const response = await getLeads(groupId);
      console.log("✅ API Response:", response);

      if (response.data && Array.isArray(response.data)) {
        setApiLeads(response.data);
        console.log(`📊 Loaded ${response.data.length} leads from API`);

        const apiStatusOptions = response.data
          .filter((lead) => lead.status && lead.status.name)
          .map((lead) => ({
            id: lead.status.id,
            value: lead.status.name,
            icon: getStatusIcon(lead.status.name),
            lightBg: getStatusLightBg(lead.status.name),
            textColor: getStatusTextColor(lead.status.name),
          }))
          .filter(
            (status, index, self) =>
              self.findIndex((s) => s.value === status.value) === index
          );

        if (apiStatusOptions.length > 0) {
          console.log("📊 Status options from API:", apiStatusOptions);
          setStatusOptions(prev => [...prev, ...apiStatusOptions]);
        }
      }
    } catch (error) {
      console.error("❌ Error loading leads:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusName) => {
    if (!statusName) return Circle;
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete")) return CheckCircle2;
    if (name.includes("working") || name.includes("progress")) return Circle;
    if (name.includes("stuck") || name.includes("blocked")) return AlertCircle;
    return XCircle;
  };

  const getStatusLightBg = (statusName) => {
    if (!statusName) return "bg-gray-50";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete"))
      return "bg-green-50";
    if (name.includes("working") || name.includes("progress"))
      return "bg-yellow-50";
    if (name.includes("stuck") || name.includes("blocked")) return "bg-red-50";
    return "bg-gray-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete"))
      return "text-green-700";
    if (name.includes("working") || name.includes("progress"))
      return "text-yellow-700";
    if (name.includes("stuck") || name.includes("blocked"))
      return "text-red-700";
    return "text-gray-700";
  };

  // Handle Add Lead submission
  const handleAddLead = async (leadData) => {
    try {
      setLoading(true);
      console.log("Creating lead with data:", leadData);
      
      // Normalize the payload before sending
      const payload = normalizePayload(leadData);
      console.log("Normalized payload:", payload);
      
      await createLeads(payload);
      console.log("✅ Lead created successfully");
      
      // Reload leads from API to get the latest data
      await loadLeadsFromAPI();
      setIsAddLeadModalOpen(false);
      
    } catch (error) {
      console.error("❌ Error creating lead:", error.response?.data || error);
      alert("Failed to create lead. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewLead = async () => {
    if (!newLeadTitle.trim()) {
      setIsAddingLead(false);
      return;
    }

    try {
      setLoading(true);
      const payload = normalizePayload({
        name: newLeadTitle,
        link: "ad",
        group: groupOptions[0]?.id || "",
        status: statusOptions[0]?.id || ""
      });
      
      await createLeads(payload);
      console.log("✅ New lead created successfully");
      
      // Reload leads from API
      await loadLeadsFromAPI();
      setNewLeadTitle("");
      setIsAddingLead(false);
      
    } catch (error) {
      console.error("❌ Error creating new lead:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddNewLead();
    }
  };

  useEffect(() => {
    loadLeadsFromAPI();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".status-dropdown-container")) {
        setOpenStatusDropdown(null);
      }
    };

    if (openStatusDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openStatusDropdown]);

  const displayTasks = convertApiLeadsToTasks(apiLeads);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const draggedTask = filteredTasks[draggedItem];
    const newTasks = [...displayTasks];
    const originalDraggedIndex = displayTasks.findIndex(
      (t) => t.id === draggedTask.id
    );
    const dropTask = filteredTasks[dropIndex];
    const originalDropIndex = displayTasks.findIndex(
      (t) => t.id === dropTask.id
    );

    const [removed] = newTasks.splice(originalDraggedIndex, 1);
    newTasks.splice(originalDropIndex, 0, removed);

    setApiLeads(newTasks);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setApiLeads(
        apiLeads.map((lead) =>
          lead.id === taskId ? { ...lead, status: newStatus } : lead
        )
      );

      // newStatus might be object or string/id — normalize
      const payload = normalizePayload({ status: newStatus?.id ?? newStatus });
      await updateLeads(taskId, payload);
      console.log("✅ Status updated on server");
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("❌ Error updating status:", error.response?.data || error);
    }
  };

  const handleOwnerChange = (taskId, newOwner) => {
    setApiLeads(
      apiLeads.map((lead) =>
        lead.id === taskId ? { ...lead, person_detail: newOwner } : lead
      )
    );
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = [...displayTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter(
    (task) =>
      (task.task &&
        task.task.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.person &&
        task.person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.status &&
        task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.phone && task.phone.includes(searchTerm))
  );

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRows.length === filteredTasks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTasks.map((task) => task.id));
    }
  };

  const handleChange = (id, uiField, value) => {
    const apiField = fieldMap[uiField] || uiField;
    setApiLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, [apiField]: value } : lead
      )
    );
  };

  const handleSave = async (id, uiField) => {
    const lead = apiLeads.find((l) => l.id === id);
    if (!lead) return;

    const apiField = fieldMap[uiField] || uiField;
    const data = { [apiField]: lead[apiField] };
    try {
      const payload = normalizePayload(data);
      await updateLeads(id, payload);
      console.log(`✅ Updated ${apiField} on server`);
    } catch (err) {
      console.error(`❌ Error updating ${apiField}:`, err.response?.data || err);
    }
  };

  return (
    <div className="h-auto md:min-w-[95%]">
      {/* Add Lead Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSubmit={handleAddLead}
        loading={loading}
      />

      <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-12" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-45" />
                <col className="w-40" />
                <col className="w-44" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-15" />
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="p-2 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20"></th>
                  <th className="p-4 sticky left-10 bg-gradient-to-r from-gray-50 to-gray-100 z-20">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        selectedRows.length === filteredTasks.length &&
                        filteredTasks.length > 0
                      }
                      onChange={selectAll}
                    />
                  </th>
                  <th
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors sticky left-[88px] bg-gradient-to-r from-gray-50 to-gray-100 z-20 border-r border-gray-200"
                    onClick={() => handleSort("task")}
                  >
                    <div className="flex justify-center items-center gap-2">
                      Leads
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortConfig.key === "task" &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="text-left p-4 border-r border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("phone")}
                  >
                    <div className="flex justify-center items-center gap-2">
                      Phone Number
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Owner
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Source
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Status
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Potential Value
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Notes
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Timeline
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => {
                  const StatusIcon = statusConfig[task.status]?.icon || Circle;
                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-gray-100 transition-all duration-200 ${
                        hoveredRow === task.id ? "bg-blue-50 shadow-sm" : ""
                      } ${selectedRows.includes(task.id) ? "bg-blue-50" : ""} ${
                        dragOverItem === index ? "bg-blue-100" : ""
                      } ${draggedItem === index ? "opacity-50" : ""} ${
                        openStatusDropdown === task.id ? "relative z-50" : ""
                      }`}
                      onMouseEnter={() => setHoveredRow(task.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <td
                        className="p-2 cursor-move sticky left-0 bg-white z-10"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </td>
                      <td className="p-4 sticky left-10 bg-white z-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRows.includes(task.id)}
                          onChange={() => toggleRowSelection(task.id)}
                        />
                      </td>
                      <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) =>
                            handleChange(task.id, "task", e.target.value)
                          }
                          onBlur={() => handleSave(task.id, "task")}
                          className="font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
                        />
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex justify-center items-center gap-2 text-gray-600">
                          <input
                            type="tel"
                            value={task.phone || ""}
                            placeholder="No phone"
                            onChange={(e) =>
                              handleChange(task.id, "phone", e.target.value)
                            }
                            onBlur={() => handleSave(task.id, "phone")}
                            className="hover:text-blue-600 transition-colors border-none outline-none bg-transparent text-center"
                          />
                        </div>
                      </td>
                      <td className=" p-4 border-r border-gray-200 relative">
                      <OwnerDropdown
                          currentOwner={task.owner}
                          onChange={(newOwner) => handleOwnerChange(task.id, newOwner)}
                          onSave={() => {}}
                          taskId={task.id}
                        />
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <span className="flex justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {task.team}
                        </span>
                      </td>
                      <td className="  p-4 border-r border-gray-200 relative">
                        <StatusDropdown
                          className="status-dropdown-container relative"
                          value={task.status}
                          onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                          taskId={task.id}
                        />
                      </td>
                      <td className="p-4 border-r flex justify-center border-gray-200">
                        <input
                          type="number"
                          value={task.progress || 0}
                          onChange={(e) =>
                            handleChange(task.id, "progress", e.target.value)
                          }
                          onBlur={() => handleSave(task.id, "progress")}
                          className="px-3 py-1 rounded-full text-sm font-medium text-center border-none outline-none bg-transparent w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div>
                          <input
                            type="text"
                            value={task.notes || ""}
                            placeholder="No notes"
                            onChange={(e) =>
                              handleChange(task.id, "notes", e.target.value)
                            }
                            onBlur={() => handleSave(task.id, "notes")}
                            className="text-[16px] text-gray-500 mt-1 truncate text-center border-none outline-none bg-transparent w-full"
                          />
                        </div>
                      </td>
                      <TimelineCell
                        task={task}
                        onTimelineUpdate={handleTimelineUpdate}
                      />
                      <td className="p-4 border-r border-gray-200"></td>
                    </tr>
                  );
                })}
                <tr className="border-b border-gray-100">
                  <td className="p-2 sticky left-0 bg-white z-10"></td>
                  <td className="p-4 sticky left-10 bg-white z-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled
                    />
                  </td>
                  <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
                    {isAddingLead ? (
                      <input
                        type="text"
                        value={newLeadTitle}
                        onChange={(e) => setNewLeadTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter lead title"
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
                        autoFocus
                        onBlur={() => {
                          if (!newLeadTitle.trim()) setIsAddingLead(false);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setIsAddingLead(true)}
                        className="font-medium text-gray-700 transition-colors w-full text-center"
                      >
                        + Add new lead
                      </button>
                    )}
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2 text-gray-600">
                      <input
                        type="tel"
                        value=""
                        placeholder="No phone"
                        disabled
                        className="text-gray-400 transition-colors border-none outline-none bg-transparent text-center"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        ?
                      </div>
                      <span className="text-gray-400 truncate">
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <span className="flex justify-center px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-sm">
                      General
                    </span>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="inline-flex items-center gap-3 px-2 py-1 rounded-full bg-gray-50 text-gray-400 text-sm font-medium">
                      <Circle className="w-4 h-4" />
                      No Status
                    </div>
                  </td>
                  <td className="p-4 border-r flex justify-center border-gray-200">
                    <input
                      type="number"
                      value="0"
                      disabled
                      className="px-3 py-1 rounded-full text-sm font-medium text-center border-none outline-none bg-transparent w-20 text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div>
                      <input
                        type="text"
                        value=""
                        placeholder="No notes"
                        disabled
                        className="text-[16px] text-gray-400 mt-1 truncate text-center border-none outline-none bg-transparent w-full"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-sm font-medium text-gray-400">
                        No timeline
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .status-dropdown-container {
          position: relative;
        }
        .overflow-x-auto {
          position: relative;
          z-index: 1;
        }
        .status-dropdown-container > div {
          position: absolute !important;
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
};

export default Table;