import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  GripVertical,
} from "lucide-react";
import {
  getLeads,
  updateLeads,
  createLeads,
} from "../../../api/services/leadsService";
import { getMSalesUsers } from "../../../api/services/userService";
import { getBoardsAll } from "../../../api/services/boardService"; 
import { Select, Avatar } from "antd";
import api from "../../../api/base"; // Import the configured Axios instance

// Helper function to get absolute image URL
const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://prototype-production-2b67.up.railway.app${url.startsWith("/") ? "" : "/"}${url}`;
};

// Calculate remaining time for timeline
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
    return `${days} days, ${hours} h`;
  }
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days} days ${hours} h`;
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
      timeline_end: endDateStr,
    });
    onToggle();
  };

  const handleChange = (e) => {
    onChange(e.target.value);
    onSave();
  };

  return createPortal(
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
        {startDate && endDate && startDate instanceof Date && endDate instanceof Date && (
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
      await updateLeads(taskId, timelineData);
      console.log("✅ Timeline updated on server");
      setIsPickerOpen(false);
    } catch (error) {
      console.error("❌ Error updating timeline:", error);
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
          className="fixed inset-0 z-[9999]"
          onClick={togglePicker}
        />
      )}
    </td>
  );
};

// Owner Dropdown Component
const OwnerDropdown = ({ currentOwner, onChange, onSave, taskId }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userMe, setUserMe] = useState(null); // Changed to single object

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch current user
        let myData = null;
        try {
          const meRes = await api.get("/me/"); // Use configured api instance
          console.log("Current user response:", meRes);
          if (meRes.data) {
            myData = {
              id: meRes.data.id,
              name: meRes.data.first_name || `${meRes.data.first_name || ''} ${meRes.data.last_name || ''}`.trim() || "Me",
              email: meRes.data.email,
              profile_picture: getAbsoluteImageUrl(meRes.data.profile_picture),
              isCurrentUser: true,
            };
            setUserMe(myData);
            console.log("Current user data:", myData);
          }
        } catch (meErr) {
          console.warn("Failed to fetch current user:", meErr);
        }

        // Fetch all MSales users
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
              name:
                user.fullname ||
                `${user.first_name} ${user.last_name}` ||
                "Unknown User",
              email: user.email,
              profile_picture: getAbsoluteImageUrl(user.profile_picture),
              isCurrentUser: false,
            }));

          // Prioritize current user at the top
          const allUsers = myData ? [myData, ...otherUsers] : otherUsers;
          setUserOptions(allUsers);
          console.log("Final user options:", allUsers);
        } else {
          console.warn("No users data received or invalid format");
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
    }
    return (
      <svg
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="relative">
      {/* Removed userMe.map since userMe is a single object */}
      {userMe && (
        <div className="hidden">
          <div>{userMe.first_name}</div> {/* Hidden for now, adjust as needed */}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full hover:bg-gray-50 p-1 rounded transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
          {currentOwner?.profile_picture ? (
            <img
              src={getAbsoluteImageUrl(currentOwner.profile_picture)}
              alt={currentOwner.fullname}
              className="w-full h-full object-cover"
            />
          ) : (
            currentOwner?.fullname
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "?"
          )}
        </div>
        <span className="text-gray-700 truncate flex-1 text-left">
          {currentOwner?.fullname || "Unknown Person"}
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
                <div className="font-medium">{user.name}</div>
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

// Status Dropdown Component
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
            leadsRes.data.forEach((lead) => {
              if (lead.status && lead.status.name && lead.status.id) {
                // Check if status already exists to avoid duplicates
                if (!allStatuses.find((s) => s.id === lead.status.id)) {
                  allStatuses.push({
                    id: lead.status.id,
                    name: lead.status.name,
                    icon: getStatusIcon(lead.status.name),
                    lightBg: getStatusLightBg(lead.status.name),
                    textColor: getStatusTextColor(lead.status.name),
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
          console.log("📊 Boards API response:", boardsRes);
          if (boardsRes.data && Array.isArray(boardsRes.data)) {
            boardsRes.data.forEach((board) => {
              // Check if board has statuses array
              if (board.statuses && Array.isArray(board.statuses)) {
                board.statuses.forEach((status) => {
                  if (!allStatuses.find((s) => s.id === status.id)) {
                    allStatuses.push({
                      id: status.id,
                      name: status.name,
                      color: status.color || "#6b7280",
                      icon: getStatusIcon(status.name),
                      lightBg: getStatusLightBg(status.name),
                      textColor: getStatusTextColor(status.name),
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
                    textColor: getStatusTextColor(board.name),
                  });
                }
              }
            });
          }
        } catch (boardsErr) {
          console.error("Error fetching statuses from boards:", boardsErr);
        }
        setStatusOptions(allStatuses);
        console.log("📊 Final combined status options:", allStatuses);
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        const fallbackStatuses = [
          { id: 'default-1', name: 'Not Started', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' },
          { id: 'default-2', name: 'Working on it', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
          { id: 'default-3', name: 'Stuck', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
          { id: 'default-4', name: 'Done', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' },
        ];
        setStatusOptions(fallbackStatuses);
      }
    };
    fetchStatuses();
  }, []);

  const getStatusIcon = (statusName) => {
    if (!statusName) return Circle;
    const name = statusName.toLowerCase();
    if (
      name.includes("done") ||
      name.includes("complete") ||
      name.includes("finished")
    )
      return CheckCircle2;
    if (
      name.includes("working") ||
      name.includes("progress") ||
      name.includes("doing")
    )
      return Circle;
    if (
      name.includes("stuck") ||
      name.includes("blocked") ||
      name.includes("issue")
    )
      return AlertCircle;
    if (
      name.includes("not started") ||
      name.includes("todo") ||
      name.includes("pending")
    )
      return XCircle;
    return Circle;
  };

  const getStatusLightBg = (statusName) => {
    if (!statusName) return "bg-gray-50";
    const name = statusName.toLowerCase();
    if (
      name.includes("done") ||
      name.includes("complete") ||
      name.includes("finished")
    )
      return "bg-green-50";
    if (
      name.includes("working") ||
      name.includes("progress") ||
      name.includes("doing")
    )
      return "bg-yellow-50";
    if (
      name.includes("stuck") ||
      name.includes("blocked") ||
      name.includes("issue")
    )
      return "bg-red-50";
    if (
      name.includes("not started") ||
      name.includes("todo") ||
      name.includes("pending")
    )
      return "bg-gray-50";
    return "bg-blue-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = statusName.toLowerCase();
    if (
      name.includes("done") ||
      name.includes("complete") ||
      name.includes("finished")
    )
      return "text-green-700";
    if (
      name.includes("working") ||
      name.includes("progress") ||
      name.includes("doing")
    )
      return "text-yellow-700";
    if (
      name.includes("stuck") ||
      name.includes("blocked") ||
      name.includes("issue")
    )
      return "text-red-700";
    if (
      name.includes("not started") ||
      name.includes("todo") ||
      name.includes("pending")
    )
      return "text-gray-700";
    return "text-blue-700";
  };

  const handleChange = async (selectedStatusId) => {
    const selectedStatus = statusOptions.find((s) => s.id === selectedStatusId);
    onChange(selectedStatus);
    try {
      await updateLeads(taskId, { status: selectedStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
    setIsOpen(false);
  };

  const currentStatus = statusOptions.find((s) => s.name === value) || {
    name: value || "No Status",
    icon: Circle,
    lightBg: "bg-gray-50",
    textColor: "text-gray-500",
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
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[] min-w-[160px] max-h-60 overflow-y-auto">
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

// Person Dropdown Component
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
    const selectedPerson = personOptions.find((p) => p.id === selectedId) || null;
    onChange(selectedPerson);
    if (groupId && leadId) {
      try {
        await updateLeads(groupId, leadId, { person_detail: selectedId });
      } catch (err) {
        console.error("Failed to update person_detail:", err);
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

  const [errors, setErrors] = useState({}); // State for error messages

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value); // Validate on change
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value); // Validate on change
  };

  const handleDateChange = (field, date) => {
    const dateStr = date ? date.toISOString().split("T")[0] : null;
    setFormData((prev) => ({ ...prev, [field]: dateStr }));
    validateField(field, dateStr); // Validate if needed (dates are optional)
  };

  // Validation function for individual fields
  const validateField = (field, value) => {
    let error = "";
    if (["name", "person", "status", "group"].includes(field) && !value) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Check if form is valid (all required fields filled and no errors)
  const isFormValid = () => {
    return formData.name && formData.person && formData.status && formData.group && Object.values(errors).every((err) => !err);
  };

  const handleSubmit = async () => {
    // Validate all required fields before submit
    validateField("name", formData.name);
    validateField("person", formData.person);
    validateField("status", formData.status);
    validateField("group", formData.group);

    if (!isFormValid()) {
      console.warn("Form validation failed: Required fields missing"); // Log instead of alert
      return; // Prevent submission
    }

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
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          {/* <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          {/* <input
            type="text"
            name="link"
            placeholder="Link"
            value={formData.link}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          <div>
            {/* <Select
              placeholder="Person *"
              value={formData.person || undefined}
              onChange={(value) => handleSelectChange("person", value)}
              style={{ width: "100%" }}
              className={errors.person ? 'border-red-500' : ''}
            >
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullname || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User"}
                </Select.Option>
              ))}
            </Select> */}
            {errors.person && <p className="text-red-500 text-xs mt-1">{errors.person}</p>}
          </div>
          {/* <input
            type="text"
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          {/* <div>
            <Select
              placeholder="Status *"
              value={formData.status || undefined}
              onChange={(value) => handleSelectChange("status", value)}
              style={{ width: "100%" }}
              className={errors.status ? 'border-red-500' : ''}
            >
              {statusOptions.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div> */}
          <div>
            <Select
              placeholder="Group *"
              value={formData.group || undefined}
              onChange={(value) => handleSelectChange("group", value)}
              style={{ width: "100%" }}
              className={errors.group ? 'border-red-500' : ''}
            >
              {groups.map((group) => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
            {errors.group && <p className="text-red-500 text-xs mt-1">{errors.group}</p>}
          </div>
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
            disabled={!isFormValid()} // Disable if form is invalid
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
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    // Add more if needed
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
      // Owner sifatida person_detail ni ishlatamiz
      owner: lead.person_detail || null,
      source: "api",
    }));
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
      console.log("🔍 Loading leads from API...");
      const response = await getLeads(groupId);
      console.log("✅ API Response:", response);
      if (response.data && Array.isArray(response.data)) {
        setApiLeads(response.data);
        console.log(`📊 Loaded ${response.data.length} leads from API`);
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
    if (name.includes("done") || name.includes("complete")) return "bg-green-50";
    if (name.includes("working") || name.includes("progress")) return "bg-yellow-50";
    if (name.includes("stuck") || name.includes("blocked")) return "bg-red-50";
    return "bg-gray-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete")) return "text-green-700";
    if (name.includes("working") || name.includes("progress")) return "text-yellow-700";
    if (name.includes("stuck") || name.includes("blocked")) return "text-red-700";
    return "text-gray-700";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups (boards)
        const boardsRes = await getBoardsAll();
        setGroups(boardsRes.data || []);

        // Fetch users
        const usersRes = await getMSalesUsers();
        setUsers(usersRes.data || []);

        // Fetch full statuses
        const allStatuses = [];
        try {
          const leadsRes = await getLeads();
          leadsRes.data.forEach(lead => {
            if (lead.status && lead.status.name && lead.status.id) {
              if (!allStatuses.find(s => s.id === lead.status.id)) {
                allStatuses.push({
                  id: lead.status.id,
                  name: lead.status.name,
                  icon: getStatusIcon(lead.status.name),
                  lightBg: getStatusLightBg(lead.status.name),
                  textColor: getStatusTextColor(lead.status.name),
                });
              }
            }
          });
        } catch (leadsErr) {
          console.error("Error fetching statuses from leads:", leadsErr);
        }
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
                  textColor: getStatusTextColor(status.name),
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
                textColor: getStatusTextColor(board.name),
              });
            }
          }
        });
        setStatusOptions(allStatuses);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      loadLeadsFromAPI();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".status-dropdown-container")) {
        setOpenStatusDropdown(null);
      }
    };
    if (openStatusDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
      await updateLeads(taskId, { status: newStatus });
      console.log("✅ Status updated on server");
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("❌ Error updating status:", error);
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
      await updateLeads(id, data);
      console.log(`✅ Updated ${apiField} on server`);
    } catch (err) {
      console.error(`❌ Error updating ${apiField}:`, err);
    }
  };

 const handleCreateLead = async (data) => {
  try {
    await createLeads(data);
    console.log("✅ New lead created");
    await loadLeadsFromAPI();
  } catch (error) {
    console.error("❌ Error creating lead:", error);
    if (error.response) {
      console.error("Server response:", error.response.data); // Add this
    }
  }
};

  return (
    <div className="h-auto md:min-w-[95%]">
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
                    +
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
                      <td className="p-4 border-r border-gray-200 relative">
                        <OwnerDropdown
                          currentOwner={task.owner}
                          onChange={(newOwner) =>
                            handleOwnerChange(task.id, newOwner)
                          }
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
                          value={task.status}
                          onChange={(newStatus) =>
                            handleStatusChange(task.id, newStatus)
                          }
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
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          {editingTimelineId === task.id ? (
                            <ReactDatePicker
                              selected={
                                task.timeline_end
                                  ? new Date(task.timeline_end)
                                  : null
                              }
                              onChange={(date) => {
                                const dateStr = date
                                  ? date.toISOString().split("T")[0]
                                  : null;
                                handleChange(task.id, "timeline_end", dateStr);
                                handleSave(task.id, "timeline_end");
                                setEditingTimelineId(null);
                              }}
                              placeholderText="Select end date"
                              className="text-sm font-medium text-gray-700 border-none outline-none text-center"
                            />
                          ) : (
                            <span
                              // onClick={() => setEditingTimelineId(task.id)}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {calculateRemainingTime(
                                task.timeline_start,
                                task.timeline_end
                              )}
                            </span>
                          )}
                        </div>
                      </td>
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
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="font-medium text-gray-700 transition-colors w-full text-center"
                    >
                      + Add new lead
                    </button>
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
                      <span className="text-gray-400 truncate"></span>
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
                      <ReactDatePicker
                        selected={null}
                        placeholderText="Timeline"
                        disabled
                        className="text-sm font-medium text-gray-400 border-none outline-none text-center"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateLead}
        groups={groups}
        statusOptions={statusOptions}
        users={users}
      />

      <style>{`
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