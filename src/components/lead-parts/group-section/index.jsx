import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  GripVertical,
  Plus,
  X,
  Copy,
  Trash2,
  ArrowRight
} from "lucide-react";
import { CiExport } from "react-icons/ci";
import { BiArchiveIn } from "react-icons/bi";
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Select, Avatar } from "antd";
import {updateLeads, createLeads } from "../../../api/services/leadsService";
import { getMSalesUsers } from "../../../api/services/userService";
import { getBoardsAll } from "../../../api/services/boardService"; 
import { deleteLeads } from "../../../api/services/leadsService";
import api from "../../../api/base";
import toast from "react-hot-toast";

// Helper function to get absolute image URL
const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://prototype-production-2b67.up.railway.app${url.startsWith("/") ? "" : "/"}${url}`;
};

// Normalize payload function
const normalizePayload = (obj = {}) => {
  const out = {};
  for (const key in obj) {
    let val = obj[key];
    if (val && typeof val === "object" && "id" in val) {
      out[key] = val.id;
    } else if (val === "") {
      out[key] = undefined;
    } else {
      out[key] = val;
    }
  }
  return out;
};

// Calculate remaining time helper
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

// Timeline Range Picker Component
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

  return ReactDOM.createPortal(
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] bg-white border border-gray-300 rounded-lg shadow-2xl p-4 min-w-[320px]">
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
    </div>,
    document.body
  );
};

// Timeline Cell Component
const TimelineCell = ({ task, onTimelineUpdate }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSave = async (taskId, timelineData) => {
    try {
      onTimelineUpdate(taskId, timelineData);
      const payload = normalizePayload(timelineData);
      await updateLeads(taskId, payload);
      console.log("Timeline updated on server");
      setIsPickerOpen(false);
    } catch (error) {
      console.error("Error updating timeline:", error.response?.data || error);
      toast.error("Failed to update timeline");
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

// OwnerDropdown Component
const OwnerDropdown = ({ currentOwner, onChange, onSave, taskId }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userMe, setUserMe] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let myData = null;
        try {
          const meRes = await api.get("/me/");
          if (meRes.data) {
            myData = {
              id: meRes.data.id,
              name: meRes.data.first_name || `${meRes.data.first_name || ''} ${meRes.data.last_name || ''}`.trim() || "Me",
              email: meRes.data.email,
              profile_picture: getAbsoluteImageUrl(meRes.data.profile_picture),
              isCurrentUser: true,
            };
            setUserMe(myData);
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
                name: firstUser.fullname || `${firstUser.first_name || ''} ${firstUser.last_name || ''}`.trim() || "Me",
                email: firstUser.email,
                profile_picture: getAbsoluteImageUrl(firstUser.profile_picture),
                isCurrentUser: true,
              };
              setUserMe(myData);
            }
          }

          const otherUsers = res.data
            .filter(user => user.id !== myData?.id)
            .map(user => ({
              id: user.id,
              name: user.fullname || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Unknown User",
              email: user.email,
              profile_picture: getAbsoluteImageUrl(user.profile_picture),
              isCurrentUser: false,
            }));

          const allUsers = myData ? [myData, ...otherUsers] : otherUsers;
          setUserOptions(allUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (userMe) {
          setUserOptions([userMe]);
        }
      }
    };
    fetchUsers();
  }, []);

  const handleChange = async (selectedUserId) => {
    const selectedUser = userOptions.find(u => u.id === selectedUserId);
    const personDetail = {
      id: selectedUser.id,
      fullname: selectedUser.name,
      profile_picture: selectedUser.profile_picture,
    };
    onChange(personDetail);
    try {
      await updateLeads(taskId, { person: selectedUserId });
    } catch (err) {
      console.error("Failed to update owner:", err);
    }
    setIsOpen(false);
    onSave();
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

// StatusDropdown Component
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
              const statusValue = lead.status && typeof lead.status === 'object' ? lead.status.name : lead.status;
              if (statusValue) {
                if (!allStatuses.find(s => s.name === statusValue)) {
                  allStatuses.push({
                    id: lead.status?.id || statusValue,
                    name: statusValue,
                    icon: getStatusIcon(statusValue),
                    lightBg: getStatusLightBg(statusValue),
                    textColor: getStatusTextColor(statusValue)
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
      const payload = normalizePayload({ status: selectedStatus?.id ?? selectedStatus?.name ?? selectedStatusId });
      await updateLeads(taskId, payload);
      console.log("Status updated on server");
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err);
    }

    setIsOpen(false);
  };

  const getStatusValue = () => {
    if (!value) return "No Status";
    if (typeof value === 'object') return value.name || "No Status";
    return value || "No Status";
  };

  const statusValue = getStatusValue();
  const currentStatus = statusOptions.find(s => s.name === statusValue) || {
    name: statusValue,
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

// PersonDropdown Component
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
        console.log("person_detail updated for lead", leadId);
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

// Main Table Component
const Table = ({ groupLeads = [], groupId, onLeadsUpdate }) => {
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
  const [groupOptions, setGroupOptions] = useState([]);
  const [personOptions, setPersonOptions] = useState([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    phone: '',
    person: null,
    status: null,
    potential_value: 0,
    notes: '',
    timeline_start: null,
    timeline_end: null,
    group: null,
    link: ''
  });
  // Selection functions
  const handleSelectAll = () => {
    const totalItems = filteredTasks.length;
    
    if (selectedItems.length === totalItems && totalItems > 0) {
      setSelectedItems([]);
    } else {
      const allItems = filteredTasks.map(task => task.id);
      setSelectedItems(allItems);
    }
  };

  const toggleSelectItem = (taskId, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => {
        const exists = prev.includes(taskId);
        if (exists) return prev;
        return [...prev, taskId];
      });
    } else {
      setSelectedItems((prev) =>
        prev.filter((id) => id !== taskId)
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(`${selectedItems.length} ta lead o'chirilsinmi?`);
    if (!confirmDelete) return;

    try {
      for (const taskId of selectedItems) {
        const lead = apiLeads.find(l => l.id === taskId);
        if (lead) {
          const groupId = lead.group;
          await deleteLeads(groupId, lead.id);
        }
      }
      
      setApiLeads(prev => prev.filter(lead => !selectedItems.includes(lead.id)));
      setSelectedItems([]);
      
      toast.success(`${selectedItems.length} ta lead o'chirildi`);
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Lead o\'chirishda xato');
    }
  };

  const handleDuplicateSelected = async () => {
    if (selectedItems.length === 0) return;

    try {
      for (const taskId of selectedItems) {
        const task = apiLeads.find(lead => lead.id === taskId);
        if (task) {
          const payload = normalizePayload({
            ...task,
            name: `${task.name} (copy)`,
            id: undefined
          });
          await createLeads(payload);
        }
      }
      
      if (onLeadsUpdate) {
        onLeadsUpdate(); // Let parent component handle the refresh
      }
      setSelectedItems([]);
      toast.success(`${selectedItems.length} ta lead nusxalandi`);
    } catch (error) {
      console.error('Error duplicating items:', error);
      toast.error('Lead nusxalanmadi');
    }
  };

  const handleExportSelected = () => {
    if (selectedItems.length === 0) return;

    const selectedData = apiLeads.filter(lead => selectedItems.includes(lead.id));
    
    const jsonData = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-leads-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSelectedItems([]);
    toast.success(`${selectedData.length} ta lead export qilindi`);
  };

  const handleArchiveSelected = () => {
    if (selectedItems.length === 0) return;
    
    console.log("Arxivlash uchun:", selectedItems);
    toast.success(`${selectedItems.length} ta lead arxivlandi`);
    setSelectedItems([]);
  };

  const handleMoveTo = () => {
    if (selectedItems.length === 0) return;
    
    console.log("Ko'chirish uchun:", selectedItems);
    toast.success(`${selectedItems.length} ta lead ko'chirildi`);
    setSelectedItems([]);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await getBoardsAll();
        console.log("=== GROUP OPTIONS FETCH ===");
        console.log("Raw boards response:", res.data);
        
        if (res.data && Array.isArray(res.data)) {
          const validGroups = res.data
            .filter(board => board.id && board.name)
            .map(board => ({
              id: board.id,
              name: board.name
            }));
          
          console.log("Processed group options:", validGroups);
          setGroupOptions(validGroups);
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
                  id: status.id ?? null,
                  name: status.name ?? ""
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

  // Convert API leads to tasks
  const convertApiLeadsToTasks = (leads) => {
    return leads.map((lead, index) => {
      let statusValue = "No Status";
      if (lead.status) {
        if (typeof lead.status === 'object') {
          statusValue = lead.status.name || "No Status";
        } else {
          statusValue = lead.status || "No Status";
        }
      }

      return {
        id: lead.id,
        task: lead.name || `Lead ${index + 1}`,
        person: lead.person_detail?.fullname || "Unknown Person",
        profile_picture: getAbsoluteImageUrl(lead.person_detail?.profile_picture),
        status: statusValue,
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
        group: lead.group || null,
        source: "api",
      };
    });
  };

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
      console.log("Loading leads from API...", groupId ? `for group ${groupId}` : "all leads");
      
      const response = await getLeads(groupId);
      console.log("API Response:", response);

      if (response.data && Array.isArray(response.data)) {
        let filteredLeads = response.data;
        if (groupId) {
          filteredLeads = response.data.filter(lead => lead.group === groupId);
        }
        
        setApiLeads(filteredLeads);
        console.log(`Loaded ${filteredLeads.length} leads from API`);

        const apiStatusOptions = filteredLeads
          .filter((lead) => {
            const statusValue = lead.status && typeof lead.status === 'object' ? lead.status.name : lead.status;
            return statusValue;
          })
          .map((lead) => {
            const statusValue = lead.status && typeof lead.status === 'object' ? lead.status.name : lead.status;
            return {
              id: lead.status?.id || statusValue,
              value: statusValue,
              icon: getStatusIcon(statusValue),
              lightBg: getStatusLightBg(statusValue),
              textColor: getStatusTextColor(statusValue),
            };
          })
          .filter(
            (status, index, self) =>
              self.findIndex((s) => s.value === status.value) === index
          );

        if (apiStatusOptions.length > 0) {
          console.log("Status options from API:", apiStatusOptions);
          setStatusOptions(prev => [...prev, ...apiStatusOptions]);
        }
      }
    } catch (error) {
      console.error("Error loading leads:", {
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

  // Debug function
  const debugNewLeadData = () => {
    console.log("=== DEBUG: New Lead Data ===");
    console.log("newLeadData:", newLeadData);
    console.log("Selected group ID:", newLeadData.group);
    console.log("Selected status ID:", newLeadData.status);
    console.log("Available groups:", groupOptions);
    console.log("Available statuses:", statusOptions);
    
    const selectedGroup = groupOptions.find(g => g.id === newLeadData.group);
    console.log("Selected group object:", selectedGroup);
    
    const selectedStatus = statusOptions.find(s => s.id === newLeadData.status);
    console.log("Selected status object:", selectedStatus);
    
    console.log("=== END DEBUG ===");
  };

  // Fixed handleAddNewLead function
  const handleAddNewLead = async () => {
    // Validate required fields
    if (!newLeadData.name.trim()) {
      toast.error("Lead nomi majburiy");
      return;
    }

    if (!newLeadData.group) {
      toast.error("Guruh tanlash majburiy");
      return;
    }

    if (!newLeadData.status) {
      toast.error("Status tanlash majburiy");
      return;
    }

    // Validate group exists
    const groupExists = groupOptions.some(group => group.id === newLeadData.group);
    if (!groupExists) {
      toast.error("Noto'g'ri guruh tanlandi");
      return;
    }

    // Validate status exists
    const statusExists = statusOptions.some(status => status.id === newLeadData.status);
    if (!statusExists) {
      toast.error("Noto'g'ri status tanlandi");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the payload according to API structure
      const payload = {
        name: newLeadData.name.trim(),
        phone: newLeadData.phone || '',
        link: newLeadData.link || '',
        person: newLeadData.person,
        notes: newLeadData.notes || '',
        status: newLeadData.status,
        group: newLeadData.group,
        potential_value: Number(newLeadData.potential_value) || 0,
        timeline_start: newLeadData.timeline_start ? 
          (newLeadData.timeline_start instanceof Date ? 
            newLeadData.timeline_start.toISOString().split('T')[0] : 
            newLeadData.timeline_start) : null,
        timeline_end: newLeadData.timeline_end ? 
          (newLeadData.timeline_end instanceof Date ? 
            newLeadData.timeline_end.toISOString().split('T')[0] : 
            newLeadData.timeline_end) : null,
        custom_fields: {},
        order: 1
      };

      console.log("Creating lead with payload:", payload);
      
      const normalizedPayload = normalizePayload(payload);
      await createLeads(normalizedPayload);
      
      console.log("New lead created successfully");
      
      if (onLeadsUpdate) {
        onLeadsUpdate(); // Let parent component handle the refresh
      }
      
      // Reset the form
      setNewLeadData({
        name: '',
        phone: '',
        person: null,
        status: null,
        potential_value: 0,
        notes: '',
        timeline_start: null,
        timeline_end: null,
        group: null,
        link: ''
      });
      
      setIsAddingLead(false);
      toast.success("Lead muvaffaqiyatli yaratildi");
      
    } catch (error) {
      console.error("Error creating new lead:", error.response?.data || error);
      // Display specific field errors if available
      if (error.response?.data) {
        Object.entries(error.response.data).forEach(([field, errors]) => {
          toast.error(`${field}: ${errors.join(', ')}`);
        });
      } else {
        toast.error("Lead yaratishda xato: " + (error.message || "Noma'lum xato"));
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewLeadFieldChange = (field, value) => {
    setNewLeadData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputs = document.querySelectorAll('.new-lead-input');
      const currentIndex = Array.from(inputs).findIndex(input => input === e.target);
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else {
        handleAddNewLead();
      }
    }
  };


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

  const displayTasks = convertApiLeadsToTasks(groupLeads); // Use passed leads instead of apiLeads

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
      setApiLeads(prevLeads =>
        prevLeads.map((lead) =>
          lead.id === taskId ? { ...lead, status: newStatus } : lead
        )
      );

      const payload = normalizePayload({ status: newStatus?.id ?? newStatus });
      const lead = apiLeads.find(l => l.id === taskId);
      
      if (lead) {
        await updateLeads(lead.group, taskId, payload);
        console.log("Status updated on server");
      }
      
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error);
      
      setApiLeads(prevLeads =>
        prevLeads.map((lead) =>
          lead.id === taskId ? { ...lead, status: lead.status } : lead
        )
      );
      
      toast.error("Status yangilashda xato");
    }
  };

  const handleOwnerChange = async (taskId, newOwner) => {
    try {
      setApiLeads(prevLeads =>
        prevLeads.map((lead) =>
          lead.id === taskId ? { ...lead, person_detail: newOwner } : lead
        )
      );

      const lead = apiLeads.find(l => l.id === taskId);
      if (lead && newOwner) {
        const payload = normalizePayload({ person: newOwner.id });
        await updateLeads(lead.group, taskId, payload);
        console.log("Owner updated on server");
      }
    } catch (error) {
      console.error("Error updating owner:", error.response?.data || error);
      toast.error("Owner yangilashda xato");
    }
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
      await updateLeads(lead.group, id, payload);
      console.log(`Updated ${apiField} on server`);
    } catch (err) {
      console.error(`Error updating ${apiField}:`, err.response?.data || err);
      toast.error(`${apiField} yangilashda xato`);
    }
  };

  return (
    <div className="h-auto md:min-w-[95%]">
      <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1400px]">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-12" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-45" />
                <col className="w-40" />
                <col className="w-40" />
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
                      checked={selectedItems.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
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
                      } ${selectedItems.includes(task.id) ? "bg-blue-50" : ""} ${
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
                          checked={selectedItems.includes(task.id)}
                          onChange={(e) => toggleSelectItem(task.id, e.target.checked)}
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
                      <td className="p-4 border-r border-gray-200 relative">
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
                      <td className="p-4 border-r border-gray-200 relative">
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
                        value={newLeadData.name}
                        onChange={(e) => handleNewLeadFieldChange('name', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'name')}
                        placeholder="Lead nomi"
                        className="new-lead-input font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setIsAddingLead(true)}
                        className="font-medium text-gray-700 transition-colors w-full text-center"
                      >
                        + Yangi lead qo'shish
                      </button>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <input
                        type="tel"
                        value={newLeadData.phone}
                        onChange={(e) => handleNewLeadFieldChange('phone', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'phone')}
                        placeholder="Telefon raqami"
                        className="new-lead-input text-gray-600 transition-colors border-none outline-none bg-transparent w-full text-center"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <Select
                        value={newLeadData.person}
                        onChange={(value) => handleNewLeadFieldChange('person', value)}
                        onKeyPress={(e) => handleKeyPress(e, 'person')}
                        placeholder="Owner tanlang"
                        className="new-lead-input"
                        options={personOptions.map(person => ({
                          value: person.id,
                          label: person.name
                        }))}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <Select
                        value={newLeadData.link}
                        onChange={(value) => handleNewLeadFieldChange('link', value)}
                        placeholder="Manba tanlang"
                        className="new-lead-input w-full"
                        options={[
                          { value: 'website', label: 'Vebsayt' },
                          { value: 'social_media', label: 'Ijtimoiy tarmoqlar' },
                          { value: 'referral', label: 'Taklif' },
                          { value: 'advertisement', label: 'Reklama' },
                          { value: 'other', label: 'Boshqa' }
                        ]}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <Select
                        value={newLeadData.status}
                        onChange={(value) => handleNewLeadFieldChange('status', value)}
                        placeholder="Status tanlang"
                        className="new-lead-input w-full"
                        options={statusOptions.map(status => ({
                          value: status.id,
                          label: status.name
                        }))}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <Select
                        value={newLeadData.group}
                        onChange={(value) => handleNewLeadFieldChange('group', value)}
                        placeholder="Guruh tanlang"
                        className="new-lead-input w-full"
                        options={groupOptions.map(group => ({
                          value: group.id,
                          label: group.name
                        }))}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <input
                        type="number"
                        value={newLeadData.potential_value}
                        onChange={(e) => handleNewLeadFieldChange('potential_value', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'potential_value')}
                        placeholder="Potential value"
                        className="new-lead-input text-gray-500 truncate text-center border-none outline-none bg-transparent w-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <input
                        type="text"
                        value={newLeadData.notes}
                        onChange={(e) => handleNewLeadFieldChange('notes', e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'notes')}
                        placeholder="Izohlar"
                        className="new-lead-input text-gray-500 truncate text-center border-none outline-none bg-transparent w-full"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead ? (
                      <div className="flex flex-col gap-2">
                        <ReactDatePicker
                          selected={newLeadData.timeline_start ? new Date(newLeadData.timeline_start) : null}
                          onChange={(date) => handleNewLeadFieldChange('timeline_start', date)}
                          placeholderText="Boshlanish sanasi"
                          className="new-lead-input text-sm p-1 border rounded"
                        />
                        <ReactDatePicker
                          selected={newLeadData.timeline_end ? new Date(newLeadData.timeline_end) : null}
                          onChange={(date) => handleNewLeadFieldChange('timeline_end', date)}
                          placeholderText="Tugash sanasi"
                          className="new-lead-input text-sm p-1 border rounded"
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center">-</div>
                    )}
                  </td>
                  
                  <td className="p-4 border-r border-gray-200">
                    {isAddingLead && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddNewLead}
                          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          Saqlash
                        </button>
                        <button
                          onClick={() => setIsAddingLead(false)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            {filteredTasks.length === 0 && !loading && (
              <div className="text-center py-10">
                <p className="text-gray-500">No leads found</p>
              </div>
            )}
            {loading && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading leads...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Items Actions Panel */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 max-w-[95vw]">
          <div className="bg-white border border-gray-200 shadow-2xl p-4 flex flex-wrap items-center justify-center rounded-lg">
            <div className="flex flex-wrap items-center gap-4 font-medium text-[#313131] text-[14px] sm:text-[16px] justify-center w-full md:w-auto">
              <div className="flex items-center gap-2 sm:gap-4 text-black rounded-full px-2 sm:px-3 py-1 font-semibold">
                <span className="bg-[#0061FE] px-2 sm:px-[10px] py-[2px] text-[14px] sm:text-[16px] text-white rounded-full">
                  {selectedItems.length}
                </span>
                Selected leads
              </div>

              <button
                onClick={handleDuplicateSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Copy selected items"
              >
                <Copy size={16} />
                <span className="text-xs sm:text-sm">Copy</span>
              </button>

              <button
                onClick={handleExportSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Export selected items"
              >
                <CiExport size={16} />
                <span className="text-xs sm:text-sm">Export</span>
              </button>

              <button
                onClick={handleArchiveSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Archive selected items"
              >
                <BiArchiveIn size={16} />
                <span className="text-xs sm:text-sm">Archive</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-red-50 text-red-600 p-2 rounded-md transition-colors"
                title="Delete selected items"
              >
                <Trash2 size={16} />
                <span className="text-xs sm:text-sm">Delete</span>
              </button>

              <button
                onClick={handleMoveTo}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Move selected items"
              >
                <ArrowRight size={16} />
                <span className="text-xs sm:text-sm">Move to</span>
              </button>

              <div className="hidden sm:block h-7 w-[1px] bg-gray-300 mx-2"></div>

              <button
                onClick={() => setSelectedItems([])}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Clear selection"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

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