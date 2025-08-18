// StatusDropdown.jsx
import { useState, useEffect } from "react";

import { updateBoard } from "../../../../api/services/boardService";

const StatusDropdown = ({
  groupId,
  itemId,
  boardId,
  value, // value is the status object {id, name}
  onChange,
  onSave,
  onCancel,
}) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) {
      setStatusOptions([{ value: "", label: "No board" }]);
      setLoading(false);
      return;
    }

    const fetchStatuses = async () => {
      try {
        setLoading(true);
        const boardData = await updateBoard(boardId);
        
        // Extract statuses from board data
        const statuses = boardData?.statuses || [];
        
        if (statuses.length > 0) {
          const options = statuses.map((status) => ({
            value: status.id,
            label: status.name,
          }));
          setStatusOptions(options);
        } else {
          setStatusOptions([{ value: "", label: "No statuses available" }]);
        }
      } catch (err) {
        console.error("Failed to fetch board statuses:", err);
        setStatusOptions([{ value: "", label: "Error loading statuses" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [boardId]);

  const handleChange = async (e) => {
    const selectedId = e.target.value;
    const selectedStatus = statusOptions.find(opt => opt.value === selectedId);
    
    // Pass the full status object to onChange
    onChange(selectedStatus ? { 
      id: selectedStatus.value, 
      name: selectedStatus.label 
    } : null);

    try {
      // Update lead status in backend
      await updateBoard(groupId, itemId, { 
        status: selectedStatus ? selectedStatus.value : null 
      });
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
    
    onSave();
  };

  // Get current status ID for display
  const currentStatusId = value?.id || "";

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <select
      value={currentStatusId}
      onChange={handleChange}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="w-full h-full text-center focus:outline-none border-none appearance-none bg-transparent"
    >
      <option value="">Select Status</option>
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
         {option.status?.name || "No Status"} a
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;