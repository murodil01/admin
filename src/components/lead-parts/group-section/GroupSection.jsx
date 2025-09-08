import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getLeads, updateLeads } from "../../../api/services/leadsService";
import { getMSalesUsers } from "../../../api/services/userService";
import StatusDropdown from "./status-board";
import api from "../../../api/base";
import { Select, Avatar } from "antd";

// Date ni format qilish uchun utility funksiya
const formatDateTime = (dateString) => {
  if (!dateString) return "Not updated";
  
  try {
    const date = new Date(dateString);
    
    // Lokal vaqt zonasiga o'tkazish
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24 soatlik format
    };
    
    return date.toLocaleString('en-GB', options).replace(',', '');
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid date";
  }
};

const formatDateTimeShort = (dateString) => {
  if (!dateString) return "Not updated";
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-GB');
    }
  } catch (error) {
    return "Invalid date";
  }
};

const getAbsoluteImageUrl = (picture) => {
  if (!picture) return null;
  const url = typeof picture === "string" ? picture : picture?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://prototype-production-2b67.up.railway.app${
    url.startsWith("/") ? "" : "/"
  }${url}`;
};

// PersonDropdown - to'liq custom versiya (Ant Design o'rniga)
const PersonDropdown = ({ value, onChange, onSave, onCancel, taskId }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [userMe, setUserMe] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef(null);

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
              name: meRes.data.first_name || `${meRes.data.first_name || ""} ${meRes.data.last_name || ""}`.trim() || "Me",
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
                name: firstUser.fullname || `${firstUser.first_name || ""} ${firstUser.last_name || ""}`.trim() || "Me",
                email: firstUser.email,
                profile_picture: getAbsoluteImageUrl(firstUser.profile_picture),
                isCurrentUser: true,
              };
              setUserMe(myData);
            }
          }

          const otherUsers = res.data
            .filter((user) => user.id !== myData?.id)
            .map((user) => ({
              id: user.id,
              name: user.fullname || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown User",
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
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = async (selectedUser) => {
    if (isLoading) return;
    
    setIsLoading(true);

    const personDetail = {
      id: selectedUser.id,
      fullname: selectedUser.name,
      name: selectedUser.name,
      profile_picture: selectedUser.profile_picture,
    };

    try {
      if (taskId) {
        await updateLeads(taskId, { person: selectedUser.id });
        console.log("Lead owner updated successfully:", selectedUser.id);
      }
      
      onChange(personDetail);
      setIsOpen(false);
      onSave();
      
    } catch (err) {
      console.error("Failed to update lead owner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = () => {
    if (!value) return null;
    
    const currentId = typeof value === 'object' ? value.id : value;
    return userOptions.find(user => user.id === currentId) || null;
  };

  const renderOwnerAvatar = (user) => {
    if (user?.profile_picture) {
      return (
        <img 
          src={user.profile_picture} 
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
      );
    } else {
      return (
        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  if (!isInitialized) {
    return (
      <div className="w-full h-full flex items-center justify-center px-3 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  const currentUser = getCurrentUser();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Select Button */}
      <div
        className="w-full h-full min-h-[36px] px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {currentUser ? (
            <>
              {renderOwnerAvatar(currentUser)}
              <span className="text-sm font-medium truncate">
                {currentUser.isCurrentUser ? `${currentUser.name} (Me)` : currentUser.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 truncate">Select Owner</span>
            </>
          )}
        </div>
        
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 flex-shrink-0"></div>
        ) : (
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {userOptions.map((user) => (
            <div
              key={user.id}
              className={`px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${
                currentUser?.id === user.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleChange(user)}
            >
              <div className="flex items-center gap-2">
                {renderOwnerAvatar(user)}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${
                    currentUser?.id === user.id ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {user.isCurrentUser ? `${user.name} (Me)` : user.name}
                  </div>
                  {user.email && (
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  )}
                </div>
                {currentUser?.id === user.id && (
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ FIXED EnhancedStatusCell - state sync tuzatildi
const EnhancedStatusCell = ({ 
  value, 
  onEdit, 
  boardId, 
  itemId, 
  onChange,
  isDropdownOpen, 
  onToggleDropdown 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggleDropdown(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, onToggleDropdown]);

  const handleClick = () => {
    onToggleDropdown(!isDropdownOpen);
    onEdit();
  };

  // ✅ STATUS CHANGE - faqat backend muvaffaqiyatli bo'lganda state yangilanadi
  const handleStatusChange = async (newStatus) => {
    console.log("🔄 Status changing to:", newStatus?.name || "No Status");
    
    try {
      // Backend ga saqlash
      if (itemId) {
        const statusValue = newStatus ? String(newStatus.id) : null;
        console.log("📤 Sending status update:", statusValue);
        
        await updateLeads(itemId, { status: statusValue });
        console.log("✅ Status successfully updated in backend");
        
        // ✅ BACKEND SUCCESS DAN KEYINGINA state yangilash
        onChange(newStatus);
      } else {
        // Agar itemId yo'q bo'lsa, to'g'ridan-to'g'ri yangilash
        onChange(newStatus);
      }
    } catch (err) {
      console.error("❌ Failed to update status:", err);
      // Xatolik bo'lsa, state ni yangilamaymiz - eski holatda qoladi
      alert("Status yangilashda xatolik. Qaytadan urinib ko'ring.");
      return;
    }
    
    // Dropdown ni yopish
    onToggleDropdown(false);
  };

  const backgroundColor = value?.color || "#f3f4f6";
  const textColor = value?.color ? getContrastColor(value.color) : "#374151";

  return (
    <div className="relative w-full h-full" ref={dropdownRef}>
      <div
        className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-all duration-200 px-3 py-2  font-medium"
        style={{ 
          backgroundColor: backgroundColor, 
          color: textColor,
          minHeight: "40px",
          border: `2px solid ${backgroundColor}`,
        }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full border border-white/20"
            style={{ backgroundColor: textColor }}
          />
          <span className="font-medium text-sm">
            {value?.name || "Select Status"}
          </span>
        </div>
      </div>

      {isDropdownOpen && (
        <StatusDropdown
          groupId={null}
          itemId={itemId}
          boardId={boardId}
          value={value}
          onChange={handleStatusChange}
          onSave={() => onToggleDropdown(false)}
          onCancel={() => onToggleDropdown(false)}
          isDirectMode={true}
        />
      )}
    </div>
  );
};

function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
}

// Date picker va Link components - o'zgarishsiz
const SingleDatePickerCell = ({ value = "", onChange, onSave, onCancel }) => {
  const [date, setDate] = useState(value ? new Date(value) : null);
  const handleChange = (date) => {
    setDate(date);
    onChange(date ? date.toISOString().split("T")[0] : null);
  };
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <ReactDatePicker
        selected={date}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        onBlur={() => onSave(date ? date.toISOString().split("T")[0] : null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        className="w-full px-2 py-1 text-center focus:outline-none bg-transparent"
        placeholderText="Select Date"
        isClearable
      />
    </div>
  );
};

const DateRangePickerCell = ({ value = { start: null, end: null }, onChange, onSave, onCancel }) => {
  const safeValue = value || { start: null, end: null };
  const [startDate, setStartDate] = useState(safeValue.start ? new Date(safeValue.start) : null);
  const [endDate, setEndDate] = useState(safeValue.end ? new Date(safeValue.end) : null);

  const handleChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    onChange({
      start: start ? start.toISOString().split("T")[0] : null,
      end: end ? end.toISOString().split("T")[0] : null,
    });
  };

  const handleSave = () => {
    onSave({
      start: startDate ? startDate.toISOString().split("T")[0] : null,
      end: endDate ? endDate.toISOString().split("T")[0] : null,
    });
  };

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <ReactDatePicker
        selected={startDate}
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        dateFormat="yyyy-MM-dd"
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        className="w-full px-2 py-1 text-center focus:outline-none bg-transparent"
        placeholderText="Timeline"
        isClearable
      />
    </div>
  );
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
    const selectedValue = e.target.value;
    let finalValue;
    if (selectedValue !== "" && selectedValue !== "Select Link Type") {
      finalValue = selectedValue;
    } else {
      finalValue = null;
    }
    onChange(finalValue);
    setTimeout(() => {
      onSave(finalValue);
    }, 150);
  };

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); onSave(); }
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      }}
      className="w-full h-full text-center focus:outline-none border-none appearance-none bg-transparent cursor-pointer"
      autoFocus
    >
      {linkOptions.map((option) => (
        <option key={option.value} value={option.value} className="bg-white text-black">
          {option.label}
        </option>
      ))}
    </select>
  );
};

// ✅ Ustunlar kengligi uchun helper function
const getColumnWidth = (columnKey) => {
  switch (columnKey) {
    case 'person_detail': // Owner field kengligi oshirildi
      return { width: "200px", minWidth: "200px" };
    case 'name': // Lead name ham biroz kengaytirildi
      return { width: "180px", minWidth: "180px" };
    case 'notes': // Notes uchun ham kengaytirildi
      return { width: "200px", minWidth: "200px" };
    case 'updated_at': 
      return { width: "180px", minWidth: "180px" };
    default:
      return { width: "160px", minWidth: "160px" };

  }
};

const GroupSection = ({
  id, title, items, expanded, onToggleExpanded, updateTitle, addItem, updateItem, deleteGroup, selected, onToggleSelect, boardId,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [localItems, setLocalItems] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [columnTitleValue, setColumnTitleValue] = useState("");
  const [statusDropdownStates, setStatusDropdownStates] = useState({});
  const dropdownRef = useRef();

  const [columns, setColumns] = useState([
    { key: "name", label: "Leads", isCustom: false },
    { key: "phone", label: "Phone Number", isCustom: false },
    { key: "link", label: "Source", isCustom: false },
    { key: "person_detail", label: "Owner", isCustom: false },
    { key: "status", label: "Status", isCustom: false },
    { key: "notes", label: "Notes", isCustom: false },
    { key: "potential_value", label: "Potential value", isCustom: false },
    { key: "timeline", label: "Timeline", isCustom: false },
    { key: "updated_at", label: "Last Updated", isCustom: false },
  ]);

  const toggleStatusDropdown = (itemIndex, isOpen) => {
    setStatusDropdownStates(prev => ({ ...prev, [itemIndex]: isOpen }));
  };

  // ✅ FIXED useEffect - dependencies to'g'ri sozlandi va format uchun key qo'shildi  
  useEffect(() => {
    if (items && Array.isArray(items)) {
      const formattedItems = items.map((item, index) => ({
        id: item.id,
        name: item.name || "Unnamed Lead",
        phone: item.phone || null,
        link: item.link || null,
        person_detail: item.person_detail || null,
        status: item.status ? {
          id: item.status.id || item.status,
          name: item.status.name || "Unknown Status",
          color: item.status.color || "#808080",
        } : null,
        notes: item.notes || "",
        potential_value: item.potential_value || 0,
        group: item.group || id,
        timeline: { start: item.timeline_start || null, end: item.timeline_end || null },
        timeline_start: item.timeline_start || null,
        timeline_end: item.timeline_end || null,
        custom_fields: item.custom_fields || {},
        order: item.order || 1,
        updated_at: item.updated_at,
        // ✅ Har bir item uchun unique key qo'shamiz re-render tracking uchun
        _formattedKey: `${item.id}_${item.updated_at || Date.now()}_${index}`,
      }));

      console.log("🔄 Formatting items for group", id, ":", formattedItems);
      setLocalItems(formattedItems);
    } else {
      setLocalItems([]);
    }
  }, [items, id]); // ✅ items va id dependency sifatida qoldirildi

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEditCell = (row, field) => {
    if (field !== 'person_detail' && field !== 'status') {
      setEditingCell({ row, field });
    }
  };

  const cancelEditCell = () => setEditingCell(null);

  // ✅ FIXED saveEditCell - parent state update qo'shildi
  const saveEditCell = async (overrideValue = null) => {
    if (!editingCell) return;
    const { row, field } = editingCell;
    const item = localItems[row];
    if (!item) return;

    if (field === "status") {
      cancelEditCell();
      return;
    }

    let val = overrideValue !== null ? overrideValue : item[field];
    
    if (field === "potential_value") {
      val = val === "" || val === null ? 0 : parseInt(val, 10) || 0;
    } else if (field === "link") {
      if (typeof val === "string") val = val.trim();
      if (val === "" || val === "Select Link Type") val = null;
    } else {
      if (typeof val === "string") val = val.trim();
      if (val === "" && field !== "notes") val = null;
    }

    const updateData = {};
    if (field === "timeline") {
      updateData.timeline_start = val?.start || null;
      updateData.timeline_end = val?.end || null;
    } else {
      updateData[field] = val;
    }

    try {
      await updateLeads(item.id, updateData);
      
      // ✅ Local state yangilash
      setLocalItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, ...updateData, [field]: val }
            : prevItem
        )
      );
      
      // ✅ Parent component ga ham xabar berish
      const changeSet = {};
      if (field === "timeline") {
        changeSet.timeline_start = val?.start || null;
        changeSet.timeline_end = val?.end || null;
      } else {
        changeSet[field] = val;
      }
      updateItem(id, row, changeSet);

    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }

    cancelEditCell();
  };

  // ✅ YAXSHILANGAN handleStatusChange
  const handleStatusChange = (itemIndex, newStatus) => {
    console.log(`🔄 Status change for item ${itemIndex}:`, newStatus?.name || "No Status");
    
    // ✅ Local state ni yangilash
    setLocalItems((prev) =>
      prev.map((item, idx) => {
        if (idx === itemIndex) {
          const updatedItem = { ...item, status: newStatus };
          console.log(`✅ Updated item ${idx}:`, updatedItem);
          return updatedItem;
        }
        return item;
      })
    );

    // ✅ Parent component ga ham xabar berish (Main component ga)
    if (updateItem) {
      updateItem(id, itemIndex, { status: newStatus });
    }

    // Dropdown ni yopish
    setStatusDropdownStates(prev => ({ ...prev, [itemIndex]: false }));
  };

  // ✅ YAXSHILANGAN handlePersonChange
  const handlePersonChange = (itemIndex, newPerson) => {
    console.log(`👤 Person change for item ${itemIndex}:`, newPerson?.name || "No Person");
    
    // ✅ Local state ni yangilash
    setLocalItems((prev) =>
      prev.map((item, idx) => {
        if (idx === itemIndex) {
          const updatedItem = { ...item, person_detail: newPerson };
          console.log(`✅ Updated item ${idx}:`, updatedItem);
          return updatedItem;
        }
        return item;
      })
    );

    // ✅ Parent component ga ham xabar berish
    if (updateItem) {
      updateItem(id, itemIndex, { person_detail: newPerson });
    }
  };

  // Boshqa funksiyalar o'zgarishsiz...
  const saveNewItem = async () => {
    if (!newItemName.trim()) return;

    const newItem = {
      name: newItemName.trim(), phone: null, link: null, person_detail: null, status: undefined,
      notes: "", potential_value: 0, timeline_start: null, timeline_end: null, group: id,
    };

    try {
      const response = await addItem(id, newItem);
      if (response && response.data) {
        const createdItem = { ...response.data, timeline: { start: response.data.timeline_start, end: response.data.timeline_end } };
        setLocalItems((prev) => [...prev, createdItem]);
      }
      setNewItemName("");
      setAddingItem(false);
    } catch (err) {
      console.error("Failed to create new lead:", err);
    }
  };

  const addColumn = () => {
    const newKey = `custom_${Date.now()}`;
    const newLabel = `Custom ${columns.filter((col) => col.isCustom).length + 1}`;
    setColumns((prev) => [...prev, { key: newKey, label: newLabel, isCustom: true }]);
    setLocalItems((prev) => prev.map((item) => ({ ...item, [newKey]: null })));
  };

  const startEditColumnTitle = (index, currentLabel) => {
    setEditingColumnIndex(index);
    setColumnTitleValue(currentLabel);
  };

  const saveColumnTitle = () => {
    if (editingColumnIndex !== null) {
      const newLabel = columnTitleValue.trim() || "Untitled Column";
      setColumns((prev) => prev.map((col, idx) => idx === editingColumnIndex ? { ...col, label: newLabel } : col));
      setEditingColumnIndex(null);
      setColumnTitleValue("");
    }
  };

  const cancelEditColumnTitle = () => {
    setEditingColumnIndex(null);
    setColumnTitleValue("");
  };

  const deleteColumn = (index) => {
    const columnToDelete = columns[index];
    if (columnToDelete.isCustom) {
      setColumns((prev) => prev.filter((_, idx) => idx !== index));
      setLocalItems((prev) => prev.map((item) => {
        const newItem = { ...item };
        delete newItem[columnToDelete.key];
        return newItem;
      }));
    }
  };


  return (
    <div className="mb-3 rounded-[8px]">
      {expanded && (
        <div className="bg-white">
          <div className="px-4 pb-4 mt-2 overflow-x-auto relative" style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '400px' }}>
            <table className="table-auto absolute border-collapse font-normal border border-gray-300 text-sm">
              <thead className="bg-blue-200 sticky top-0 z-10"> {/* sticky qo'shildi */}
                <tr>
                  <th className="border border-gray-400 p-6" style={{ width: "48px", minWidth: "48px" }}></th>
                  {columns.map((col) => (
                  <th key={col.key} className="border border-gray-400 p-2 text-center relative group" style={getColumnWidth(col.key)}>
                      <div className="flex items-center justify-center gap-2">
                        {editingColumnIndex === columns.indexOf(col) ? (
                          <input
                            autoFocus value={columnTitleValue} onChange={(e) => setColumnTitleValue(e.target.value)}
                            onBlur={saveColumnTitle}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveColumnTitle();
                              if (e.key === "Escape") cancelEditColumnTitle();
                            }}
                            className="w-full text-center focus:outline-none bg-transparent border-b border-gray-400"
                          />
                        ) : (
                          <span onDoubleClick={() => startEditColumnTitle(columns.indexOf(col), col.label)} className="cursor-pointer">
                            {col.label}
                          </span>
                        )}
                        {col.isCustom && (
                          <button onClick={() => deleteColumn(columns.indexOf(col))} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded" title="Delete column">
                            <X size={12} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="border border-gray-300 p-2 text-center cursor-pointer hover:bg-gray-200" style={{ width: "48px", minWidth: "48px" }} onClick={addColumn} title="Add column">+</th>
                </tr>
              </thead>
              <tbody>
                {localItems.map((item, itemIndex) => (
                  <tr key={item._formattedKey || `${item.id}-${itemIndex}`} className={itemIndex % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="border border-gray-300 text-center p-2" style={{ width: "48px", minWidth: "48px" }}>
                      <input type="checkbox" checked={selected.includes(itemIndex)} onChange={(e) => onToggleSelect(itemIndex, e.target.checked)} />
                    </td>

                    {columns.map((col) => (
                     <td key={`${item.id}-${col.key}`} className="border border-gray-300 p-0 text-center" style={getColumnWidth(col.key)}>
                        {col.key === "status" ? (
                          <EnhancedStatusCell
                            value={item.status}
                            onEdit={() => {}}
                            boardId={boardId}
                            itemId={item.id}
                            onChange={(newStatus) => handleStatusChange(itemIndex, newStatus)}
                            isDropdownOpen={statusDropdownStates[itemIndex] || false}
                            onToggleDropdown={(isOpen) => toggleStatusDropdown(itemIndex, isOpen)}
                          />
                        ) : col.key === "person_detail" ? (
                          <div className="w-full h-full" style={{ minHeight: "36px" }}>
                            <PersonDropdown
                              value={item[col.key] || null}
                              taskId={item.id}
                              onChange={(val) => handlePersonChange(itemIndex, val)}
                              onSave={() => {}}
                              onCancel={() => {}}
                            />
                          </div>
                        ) : col.key === "timeline" ? (
                          editingCell?.row === itemIndex && editingCell?.field === col.key ? (
                            <DateRangePickerCell
                              value={item.timeline || { start: null, end: null }}
                              onChange={(val) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[itemIndex] = { ...copy[itemIndex], timeline: val };
                                  return copy;
                                });
                              }}
                              onSave={saveEditCell}
                              onCancel={cancelEditCell}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
                              style={{ minHeight: "36px" }}
                              onClick={() => startEditCell(itemIndex, col.key)}
                            >
                              {item.timeline?.start || item.timeline?.end
                                ? `${item.timeline.start || ""} - ${item.timeline.end || ""}`
                                : "Set Timeline"}
                            </div>
                          )
                        ) : col.key === "potential_value" ? (
                          editingCell?.row === itemIndex && editingCell?.field === col.key ? (
                            <input
                              autoFocus
                              type="number"
                              value={item[col.key] || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const newVal = value === "" ? 0 : parseInt(value, 10) || 0;
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[itemIndex] = { ...copy[itemIndex], [col.key]: newVal };
                                  return copy;
                                });
                              }}
                              onBlur={saveEditCell}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditCell();
                                if (e.key === "Escape") cancelEditCell();
                              }}
                              className="w-full text-center focus:outline-none bg-transparent px-2 py-1"
                              placeholder="0"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
                              style={{ minHeight: "36px" }}
                              onClick={() => startEditCell(itemIndex, col.key)}
                            >
                              ${item[col.key] || 0}
                            </div>
                          )
                        ): col.key === "updated_at" ? (
                          // YANGI: Updated at ustuni - faqat ko'rsatish uchun, edit qilinmaydi
                          <div
                            className="w-full h-full flex items-center justify-center text-gray-600 text-xs"
                            style={{ minHeight: "36px" }}
                            title={item.updated_at ? new Date(item.updated_at).toLocaleString() : "Not updated"}
                          >
                            {formatDateTime(item.updated_at)}
                          </div>
                        )
                         : col.key === "link" ? (
                          editingCell?.row === itemIndex && editingCell?.field === col.key ? (
                            <LinkDropdown
                              value={item[col.key] || ""}
                              onChange={(val) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[itemIndex] = { ...copy[itemIndex], [col.key]: val };
                                  return copy;
                                });
                              }}
                              onSave={(overrideValue) => saveEditCell(overrideValue)}
                              onCancel={cancelEditCell}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
                              style={{ minHeight: "36px" }}
                              onClick={() => startEditCell(itemIndex, col.key)}
                            >
                              <span className="capitalize">
                                {item[col.key] ? (
                                  item[col.key].charAt(0).toUpperCase() + item[col.key].slice(1)
                                ) : (
                                  <span className="text-gray-400">Select Source</span>
                                )}
                              </span>
                            </div>
                          )
                        ) : (
                          editingCell?.row === itemIndex && editingCell?.field === col.key ? (
                            <input
                              autoFocus
                              value={item[col.key] || ""}
                              onChange={(e) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[itemIndex] = { ...copy[itemIndex], [col.key]: e.target.value };
                                  return copy;
                                });
                              }}
                              onBlur={saveEditCell}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditCell();
                                if (e.key === "Escape") cancelEditCell();
                              }}
                              className="w-full text-center focus:outline-none bg-transparent px-2 py-1"
                              placeholder={col.label}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100"
                              style={{ minHeight: "36px" }}
                              onClick={() => startEditCell(itemIndex, col.key)}
                            >
                              {item[col.key] || `Add ${col.label}`}
                            </div>
                          )
                        )}
                      </td>
                    ))}

                    <td className="border border-gray-300 p-2" style={{ width: "48px", minWidth: "48px" }}></td>
                  </tr>
                ))}

                {addingItem ? (
                  <tr key="new-item">
                    <td className="border border-gray-300 text-center p-2" style={{ width: "48px", minWidth: "48px" }}>
                      <input type="checkbox" disabled />
                    </td>
                    <td className="border border-gray-300 p-2 text-center" style={getColumnWidth("name")}>
                      <input
                        autoFocus
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onBlur={() => newItemName.trim() ? saveNewItem() : setAddingItem(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveNewItem();
                          if (e.key === "Escape") setAddingItem(false);
                        }}
                        placeholder="Enter lead name..."
                        className="w-full px-2 py-1 rounded-[8px] focus:outline-none text-center bg-transparent"
                      />
                    </td>
                    {Array(columns.length - 1).fill(null).map((_, idx) => (
                     <td key={`new-item-placeholder-${idx}`} className="border border-gray-300 p-2 text-center text-gray-400" style={getColumnWidth(columns[idx + 1]?.key || "default")}>
                        -
                      </td>
                    ))}
                    <td className="border border-gray-300 p-2" style={{ width: "48px", minWidth: "48px" }}></td>
                  </tr>
                ) : (
                  <tr key="add-item">
                    <td
                      colSpan={columns.length + 2}
                      className="border border-gray-300 p-2 text-center cursor-pointer text-black hover:bg-gray-100"
                      onClick={() => setAddingItem(true)}
                    >
                      + Add lead
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSection;