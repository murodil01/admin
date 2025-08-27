import { useState, useEffect } from "react";
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
import { getusersAll } from "../../../api/services/userService";
import { getBoardsAll } from "../../../api/services/boardService"; 
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, Avatar } from "antd";

// Helper function to get absolute image URL
const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  
  // Get the URL string
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  
  // If it's already a full URL, return as is
  if (url.startsWith("http")) {
    return url;
  }
  
  return `https://prototype-production-2b67.up.railway.app${url.startsWith("/") ? "" : "/"}${url}`;
};

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

const LinkDropdown = ({ value, onChange, onSave, onCancel }) => {
  const linkOptions = [
    { value: "", label: "Select Link Type" },
    { value: "ad", label: "Ad" },
    { value: "outreach", label: "Outreach" },
    { value: "referral", label: "Referral" },
    { value: "event", label: "Event" },
  ];

  const handleChange = (e) => {
    onChange(e.target.value);
    onSave();
  };

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="w-full h-full text-center focus:outline-none border-none appearance-none bg-transparent"
    >
      {linkOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-white text-black"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Owner Dropdown Component
const OwnerDropdown = ({ currentOwner, onChange, onSave, taskId }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getusersAll();

        if (res.data && Array.isArray(res.data)) {
          
          setUserOptions(res.data.map(user => ({
            id: user.id,
            name: user.fullname || `${user.first_name} ${user.last_name}` || "Unknown User",
            email: user.email,
            profile_picture: getAbsoluteImageUrl(user.profile_picture)
          })));
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
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
    
    // Update on server - person_detail field ni yangilaymiz
    try {
      await updateLeads(taskId, { person: selectedUserId });
    } catch (err) {
      console.error("Failed to update owner:", err);
    }
    
    setIsOpen(false);
    onSave();
  };

  return (
    <div className="relative">
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
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[1000] min-w-[200px] max-h-60 overflow-y-auto">
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
                  user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
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
        
        // First, get statuses from leads
        try {
          const leadsRes = await getLeads();
          if (leadsRes.data && Array.isArray(leadsRes.data)) {
            leadsRes.data.forEach(lead => {
              if (lead.status && lead.status.name && lead.status.id) {
                // Check if status already exists to avoid duplicates
                if (!allStatuses.find(s => s.id === lead.status.id)) {
                  allStatuses.push({
                    id: lead.status.id,
                    name: lead.status.name,
                    icon: getStatusIcon(lead.status.name),
                    lightBg: getStatusLightBg(lead.status.name),
                    textColor: getStatusTextColor(lead.status.name)
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
            boardsRes.data.forEach(board => {
              // Check if board has statuses array
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
              } 
              // If boards themselves are statuses (based on your API response)
              else if (board.id && board.name) {
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
        
        // Set the combined status options
        setStatusOptions(allStatuses);
        console.log("📊 Final combined status options:", allStatuses);
        
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        
        // Fallback to default statuses if API calls fail
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
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return CheckCircle2;
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return Circle;
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return AlertCircle;
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return XCircle;
    return Circle;
  };

  const getStatusLightBg = (statusName) => {
    if (!statusName) return "bg-gray-50";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return "bg-green-50";
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return "bg-yellow-50";
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return "bg-red-50";
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return "bg-gray-50";
    return "bg-blue-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete") || name.includes("finished")) return "text-green-700";
    if (name.includes("working") || name.includes("progress") || name.includes("doing")) return "text-yellow-700";
    if (name.includes("stuck") || name.includes("blocked") || name.includes("issue")) return "text-red-700";
    if (name.includes("not started") || name.includes("todo") || name.includes("pending")) return "text-gray-700";
    return "text-blue-700";
  };

  const handleChange = async (selectedStatusId) => {
    const selectedStatus = statusOptions.find(s => s.id === selectedStatusId);
    onChange(selectedStatus);
    
    // Update on server
    try {
      await updateLeads(taskId, { status: selectedStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
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
        <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[1000] min-w-[160px] max-h-60 overflow-y-auto">
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
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadTitle, setNewLeadTitle] = useState("");
  const [editingTimelineId, setEditingTimelineId] = useState(null);

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
          setStatusOptions([...statusOptions, ...apiStatusOptions]);
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

  const handleAddLead = async (e) => {
    if (e.key !== "Enter" || !newLeadTitle.trim()) return;

    try {
      setLoading(true);
      const newLead = {
        name: newLeadTitle,
        status: { name: "Not Started" },
        person_detail: { fullname: "Unknown Person" },
        potential_value: 0,
        last_interaction: new Date().toISOString().split("T")[0],
        link: "General",
        phone: "",
        notes: "",
      };

      await createLeads(newLead);
      console.log("✅ New lead created");
      await loadLeadsFromAPI();
      setNewLeadTitle("");
      setIsAddingLead(false);
    } catch (error) {
      console.error("❌ Error creating lead:", error);
    } finally {
      setLoading(false);
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
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          index * 0.05
                        }s both`,
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
                      <td className="p-4 border-r border-gray-200">
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
                      <td className="p-4 border-r border-gray-200">
                        <StatusDropdown
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
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          {editingTimelineId === task.id ? (
                            <ReactDatePicker
                              selected={task.timeline_end ? new Date(task.timeline_end) : null}
                              onChange={(date) => {
                                const dateStr = date ? date.toISOString().split("T")[0] : null;
                                handleChange(task.id, "timeline_end", dateStr);
                                handleSave(task.id, "timeline_end");
                                setEditingTimelineId(null);
                              }}
                              placeholderText="Select end date"
                              className="text-sm font-medium text-gray-700 border-none outline-none text-center"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingTimelineId(task.id)}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {calculateRemainingTime(task.timeline_start, task.timeline_end)}
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
                    {isAddingLead ? (
                      <input
                        type="text"
                        value={newLeadTitle}
                        onChange={(e) => setNewLeadTitle(e.target.value)}
                        onKeyPress={handleAddLead}
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
                        Unknown Person
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

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        tbody tr.relative.z-50 {
          position: relative !important;
          z-index: 50 !important;
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