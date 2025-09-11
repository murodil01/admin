// Fixed StatusDropdown.jsx - Backend sync muammolari tuzatildi
import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, X } from "lucide-react";
import api from "../../../../api/base";
import { updateLeads } from "../../../../api/services/leadsService";
import { message } from "antd";

const StatusDropdown = ({
  groupId,
  itemId,
  boardId,
  value, // current status object {id, name, color}
  onChange,
  onSave,
  onCancel,
  isDirectMode = false,
}) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#008000");
  const [isUpdating, setIsUpdating] = useState(false); // Backend update holatini kuzatish
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
        if (onCancel) onCancel();
      }
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        showAddModal
      ) {
        setShowAddModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddModal, onCancel]);

  // ✅ TUZATILGAN status select handler - duplicate backend call oldini olindi
  const handleStatusSelect = async (status) => {
    if (isUpdating) {
      console.log("⏳ Status update already in progress, ignoring...");
      return;
    }

    try {
      setIsUpdating(true);
      console.log("🔄 Status select started:", status?.name || "No Status");

      // ✅ FAQAT UI UPDATE - backend EnhancedStatusCell da amalga oshiriladi
      onChange(status);
      console.log("✅ UI updated via onChange callback");

      // ✅ CALLBACK ni chaqirish
      if (onSave) {
        onSave();
      }

      console.log("🎉 Status dropdown completed successfully");
    } catch (err) {
      console.error("❌ Status dropdown error:", err);
      message("Status o'zgartirishda xatolik yuz berdi.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStatus = async (statusId, event) => {
    event.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this status? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/board/status/${statusId}/delete/`);

      // Remove from local state
      setStatusOptions((prev) =>
        prev.filter((status) => status.id !== statusId)
      );

      // If current selected status is being deleted, reset to null
      if (value?.id === statusId) {
        // Backend ga ham null yuborish
        if (itemId) {
          await updateLeads(itemId, { status: null });
        }
        onChange(null);
      }
    } catch (err) {
      console.error("Failed to delete status:", err);
      message.error("Failed to delete status. It might be in use or you don't have permission.");
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusName.trim()) {
      message("Please enter a status name");
      return;
    }

    try {
      const response = await api.post(`/board/status/${boardId}/`, {
        name: newStatusName.trim(),
        color: selectedColor,
      });

      // Add to local state
      setStatusOptions((prev) => [...prev, response.data]);

      // Reset form
      setNewStatusName("");
      setSelectedColor("#008000");
      setShowAddModal(false);
      
      console.log("✅ New status created successfully");
    } catch (err) {
      console.error("Failed to create status:", err);
      message.error("Failed to create status. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50">
        <div className="px-3 py-4 text-center text-gray-500">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading statuses...
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        ref={dropdownRef}
      >
        {/* No Status option */}
        <div
          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 transition-colors ${
            !value ? 'bg-blue-50 text-blue-600' : ''
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !isUpdating && handleStatusSelect(null)}
        >
          <div className="w-3 h-3 rounded-full border border-gray-300"></div>
          <span>No Status</span>
          {isUpdating && !value && (
            <div className="ml-auto">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Divider */}
        {statusOptions.length > 0 && <div className="border-t border-gray-100"></div>}

        {/* Status options */}
        {statusOptions.map((status) => (
          <div
            key={status.id}
            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group transition-colors ${
              value?.id === status.id ? 'bg-blue-50' : ''
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isUpdating && handleStatusSelect(status)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className={value?.id === status.id ? 'text-blue-600 font-medium' : ''}>
                {status.name}
              </span>
              {/* Loading indicator uchun joyni saqlash */}
              {isUpdating && value?.id === status.id && (
                <div className="ml-2">
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
              onClick={(e) => handleDeleteStatus(status.id, e)}
              title="Delete status"
              disabled={isUpdating}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add Status Button */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div
            className={`px-3 py-2 hover:bg-gray-200 cursor-pointer flex items-center gap-2 text-blue-600 font-medium transition-colors ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !isUpdating && setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Add New Status</span>
          </div>
        </div>
      </div>

      {/* Enhanced Add Status Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div
            className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl"
            ref={modalRef}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Status</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Name *
                </label>
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="Enter status name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                        selectedColor === color
                          ? "border-gray-800 shadow-md scale-110"
                          : "border-gray-300 hover:border-gray-400 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Selected: <span className="font-mono">{selectedColor}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStatus}
                disabled={!newStatusName.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add Status
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
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