import { useState, useEffect } from "react";
import {
  getStatuses,
  updateStatus,
} from "../../../../api/services/statusService";

const StatusDropdown = ({
  boardId,
  itemId,
  value,
  onChange,
  onSave,
  onCancel,
}) => {
  const [statusOptions, setStatusOptions] = useState([
    { value: "", label: "Loading..." },
  ]);

  useEffect(() => {
    if (!boardId) return;

    const fetchStatuses = async () => {
      try {
        const res = await getStatuses(boardId); // API dan array qaytadi
        console.log("API statuses:", res); // array ekanligini tekshirish
        const options = res.map((status) => ({
          value: status.id, // id ishlatiladi
          label: status.name,
        }));
        setStatusOptions([{ value: "", label: "Select Status" }, ...options]);
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        setStatusOptions([{ value: "", label: "Error loading statuses" }]);
      }
    };

    fetchStatuses();
  }, [boardId]);

  const handleChange = async (e) => {
    const val = e.target.value;
    onChange(val); // localItems update
    try {
      await updateStatus(boardId, itemId, { statusId: val });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
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
      {statusOptions.map((option) => (
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

export default StatusDropdown;
