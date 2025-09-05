// StatusDropdown.jsx - Updated version
import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, X } from "lucide-react";
import api from "../../../../api/base";
import { updateLeads } from "../../../../api/services/leadsService";

const StatusDropdown = ({
  groupId,
  itemId,
  boardId,
  value, // current status object {id, name, color}
  onChange,
  onSave,
  onCancel,
}) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#008000");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Available colors for status
  const availableColors = [
    "#008000", // Green
    "#FF0000", // Red
    "#0000FF", // Blue
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFFF00", // Yellow
    "#FF69B4", // Hot Pink
    "#00FFFF", // Cyan
    "#A52A2A", // Brown
    "#808080", // Gray
  ];

  // Fetch statuses from API
  useEffect(() => {
    if (!boardId) {
      setStatusOptions([]);
      setLoading(false);
      return;
    }

    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/board/status/${boardId}/`);
        
        if (response.data && Array.isArray(response.data)) {
          setStatusOptions(response.data);
        } else {
          setStatusOptions([]);
        }
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        setStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [boardId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && showAddModal) {
        setShowAddModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal]);

  const handleStatusSelect = async (status) => {
    try {
      // Update local state
      onChange(status);
      
      // Update lead status in backend if itemId exists
      if (itemId) {
        await updateLeads(itemId, { status: status.id });
      }
      
      setIsDropdownOpen(false);
      onSave();
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const handleDeleteStatus = async (statusId, event) => {
    event.stopPropagation();
    
    const confirmDelete = window.confirm("Are you sure you want to delete this status?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/board/status/${statusId}/`);
      
      // Remove from local state
      setStatusOptions(prev => prev.filter(status => status.id !== statusId));
      
      // If current selected status is being deleted, reset to null
      if (value?.id === statusId) {
        onChange(null);
      }
    } catch (err) {
      console.error("Failed to delete status:", err);
      alert("Failed to delete status. It might be in use.");
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;

    try {
      const response = await api.post(`/board/status/${boardId}/`, {
        name: newStatusName.trim(),
        color: selectedColor
      });

      // Add to local state
      setStatusOptions(prev => [...prev, response.data]);
      
      // Reset form
      setNewStatusName("");
      setSelectedColor("#008000");
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to create status:", err);
      alert("Failed to create status");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-full" ref={dropdownRef}>
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 px-2 py-1"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-2">
            {value?.color && (
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: value.color }}
              />
            )}
            <span>{value?.name || "Select Status"}</span>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {/* Current selection - No Status */}
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => handleStatusSelect(null)}
            >
              <span>No Status</span>
            </div>

            {/* Status options */}
            {statusOptions.map((status) => (
              <div
                key={status.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group"
                onClick={() => handleStatusSelect(status)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span>{status.name}</span>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600"
                  onClick={(e) => handleDeleteStatus(status.id, e)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {/* Add Status Button */}
            <div className="border-t border-gray-200">
              <div
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-blue-600"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                <span>Add Status</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Status Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]" ref={modalRef}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Status</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Name
                </label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Enter status name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-md border-2 ${
                        selectedColor === color 
                          ? 'border-gray-800 shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Selected: {selectedColor}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStatus}
                disabled={!newStatusName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Status
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusDropdown;