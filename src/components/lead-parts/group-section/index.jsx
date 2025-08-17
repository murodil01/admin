import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updateGroup } from "../../../api/services/groupService";
import { updateLeads } from "../../../api/services/leadsService";

const SingleDatePickerCell = ({
  value = "",
  onChange,
  onSave,
  onCancel,
}) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  const handleChange = (date) => {
    setDate(date);
    // Send null instead of empty string when no date is selected
    onChange(date ? date.toISOString().split("T")[0] : null);
  };

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      <ReactDatePicker
        selected={date}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        onBlur={onSave}
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

const DateRangePickerCell = ({
  value = { start: null, end: null },
  onChange,
  onSave,
  onCancel,
}) => {
  // Safely handle null value
  const safeValue = value || { start: null, end: null };
  
  const [startDate, setStartDate] = useState(
    safeValue.start ? new Date(safeValue.start) : null
  );
  const [endDate, setEndDate] = useState(
    safeValue.end ? new Date(safeValue.end) : null
  );

  const handleChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    onChange({
      start: start ? start.toISOString().split("T")[0] : null,
      end: end ? end.toISOString().split("T")[0] : null,
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
        onBlur={onSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        className="w-full px-2 py-1 text-center focus:outline-none bg-transparent"
        placeholderText="Timeline"
        isClearable
      />
    </div>
  );
};

const StatusDropdown = ({ value, onChange, onSave, onCancel }) => {
  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "Done", label: "Done" },
    { value: "Stuck", label: "Stuck" },
    { value: "Working on it", label: "Working on it" },
    { value: "Not Started", label: "Not Started" },
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

const LinkDropdown = ({ value, onChange, onSave, onCancel }) => {
  const linkOptions = [
    { value: "", label: "Select Link Type" },
    { value: "Ad", label: "Ad" },
    { value: "Outreach", label: "Outreach" },
    { value: "Referral", label: "Referral" },
    { value: "Event", label: "Event" },
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

const GroupSection = ({
  id,
  title,
  items,
  expanded,
  onToggleExpanded,
  updateTitle,
  addItem,
  updateItem,
  deleteGroup,
  selected,
  onToggleSelect,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [localItems, setLocalItems] = useState((items || []).filter(Boolean));
  const [editingCell, setEditingCell] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  const [columnTitleValue, setColumnTitleValue] = useState("");
  const dropdownRef = useRef();

  const [columns, setColumns] = useState([
    { key: "name", label: "Leads", isCustom: false },
    { key: "phone", label: "Phone Number", isCustom: false },
    { key: "link", label: "Link", isCustom: false },
    { key: "person", label: "Owner", isCustom: false },
    { key: "person_detail", label: "Person details", isCustom: false },
    { key: "last_interaction", label: "Last interaction", isCustom: false },
    { key: "status", label: "Status", isCustom: false },
    { key: "notes", label: "Notes", isCustom: false },
    { key: "potential_value", label: "Potential value", isCustom: false },
    { key: "timeline", label: "Timeline", isCustom: false },
  ]);

  useEffect(() => {
    if (items) {
      setLocalItems(
        items.map((item) => ({
          ...item,
          potential_value: item.potential_value || null, // Changed from 0 to null
          timeline: item.timeline || {
            start: item.timelineStart || null, // Changed from "" to null
            end: item.timelineEnd || null, // Changed from "" to null
          },
        }))
      );
    }
  }, [items]);

  useEffect(() => setLocalItems((items || []).filter(Boolean)), [items]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEditCell = (row, field) => setEditingCell({ row, field });
  const cancelEditCell = () => setEditingCell(null);

  const saveEditCell = () => {
    if (!editingCell) return;
    const { row, field } = editingCell;
    let val = localItems[row]?.[field] ?? "";

    if (typeof val === "string") val = val.trim();
    if (val === "") val = field === "name" ? "Unnamed" : null; // Changed to null instead of ""

    if (field === "potential_value") {
      // Allow clearing the field by setting to null
      val = val === "" || val === null ? null : parseInt(val, 10) || null;
    }

    const newItems = [...localItems];
    newItems[row] = { ...newItems[row], [field]: val };

    if (field === "timeline") {
      // Ensure val has the correct structure
      const timelineValue = val || { start: null, end: null };
      newItems[row].timelineStart = timelineValue.start;
      newItems[row].timelineEnd = timelineValue.end;
    }

    setLocalItems(newItems);
    updateItem(id, row, newItems[row]);
    cancelEditCell();
  };

  const saveNewItem = () => {
    if (newItemName.trim()) {
      const newItem = { name: newItemName.trim() };
      columns.forEach((col) => {
        if (!newItem[col.key]) {
          // Set appropriate default values
          if (col.key === "potential_value") {
            newItem[col.key] = null; // Changed from 0 to null
          } else {
            newItem[col.key] = null; // Changed from "" to null
          }
        }
      });
      setLocalItems((prev) => [...prev.filter(Boolean), newItem]);
      addItem(id, newItem);
      setNewItemName("");
      setAddingItem(false);
    }
  };

  const addColumn = () => {
    const newKey = `custom_${Date.now()}`;
    const newLabel = `Custom ${
      columns.filter((col) => col.isCustom).length + 1
    }`;
    setColumns((prev) => [
      ...prev,
      { key: newKey, label: newLabel, isCustom: true },
    ]);
    setLocalItems((prev) =>
      prev.map((item) => ({
        ...item,
        [newKey]: null, // Changed from "" to null
      }))
    );
  };

  const startEditColumnTitle = (index, currentLabel) => {
    setEditingColumnIndex(index);
    setColumnTitleValue(currentLabel);
  };

  const saveColumnTitle = () => {
    if (editingColumnIndex !== null) {
      const newLabel = columnTitleValue.trim() || "Untitled Column";
      setColumns((prev) =>
        prev.map((col, idx) =>
          idx === editingColumnIndex ? { ...col, label: newLabel } : col
        )
      );
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
      setLocalItems((prev) =>
        prev.map((item) => {
          const newItem = { ...item };
          delete newItem[columnToDelete.key];
          return newItem;
        })
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Working on it":
        return "bg-[#FDAB3D] text-white font-medium";
      case "Done":
        return "bg-[#71DC98] text-white font-medium";
      case "Stuck":
        return "bg-[#DF2F4A] text-white font-medium";
      case "Not Started":
        return "bg-[#E7E7E7] text-[#A29F9F] font-medium";
      default:
        return "bg-white text-gray-800 font-medium";
    }
  };

  return (
    <div className="mb-3 rounded-[8px] relative">
      {/* Header */}
      <div className="flex items-center justify-between w-full p-4 cursor-pointer rounded-t-[8px] select-none bg-gray-200">
        <div className="flex items-center flex-1" onClick={onToggleExpanded}>
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-black" />
          ) : (
            <ChevronRight className="w-5 h-5 text-black" />
          )}
          <div className="flex flex-col">
            {editingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={async () => {
                  const newTitle = titleValue.trim() || "Untitled Group";
                  setEditingTitle(false);
                  setTitleValue(newTitle);

                  try {
                    await updateGroup(id, { name: newTitle });
                  } catch (error) {
                    console.error("Failed to update group title:", error);
                    setTitleValue(title);
                  }

                  if (updateTitle) updateTitle(id, newTitle);
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") e.target.blur();
                  if (e.key === "Escape") {
                    setEditingTitle(false);
                    setTitleValue(title);
                  }
                }}
                className="ml-2 text-[18px] font-medium focus:outline-none bg-transparent border-b border-gray-400 w-full"
              />
            ) : (
              <span
                onDoubleClick={() => setEditingTitle(true)}
                className="ml-2 text-[18px] font-medium cursor-pointer"
              >
                {titleValue}
              </span>
            )}
            <small className="ml-2 text-[14px] mt-1">
              {localItems.length} item{localItems.length > 1 ? "s" : ""}
            </small>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
            className="p-2 rounded-[8px] bg-[#E2E2E2] hover:bg-gray-300"
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-[-50px] w-32 bg-[#F5F7FF] rounded-[8px] shadow-md z-50">
              <button
                onClick={() => setEditingTitle(true)}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#E2E2E2] text-[12px] text-[#5A5A5A]"
              >
                <Edit2 size={15} /> Edit group
              </button>
              <button
                onClick={() => deleteGroup && deleteGroup(id)}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#E2E2E2] text-[12px] text-[#5A5A5A]"
              >
                <Trash2 size={15} /> Delete group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {expanded && (
        <div className="bg-white">
          <div className="px-4 pb-4 pt-2 overflow-x-auto relative h-50">
            <table className="table-fixed shrink-0 absolute min-w-[1100px] border-collapse font-normal border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "48px", minWidth: "48px" }}
                  ></th>
                  {columns.map((col, index) => (
                    <th
                      key={col.key}
                      className="border border-gray-300 p-2 text-center relative group"
                      style={{ width: "160px", minWidth: "160px" }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {editingColumnIndex === index ? (
                          <input
                            autoFocus
                            value={columnTitleValue}
                            onChange={(e) =>
                              setColumnTitleValue(e.target.value)
                            }
                            onBlur={saveColumnTitle}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveColumnTitle();
                              if (e.key === "Escape") cancelEditColumnTitle();
                            }}
                            className="w-full text-center focus:outline-none bg-transparent border-b border-gray-400"
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              startEditColumnTitle(index, col.label)
                            }
                            className="cursor-pointer"
                          >
                            {col.label}
                          </span>
                        )}
                        {col.isCustom && (
                          <button
                            onClick={() => deleteColumn(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            title="Delete column"
                          >
                            <X size={12} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th
                    className="border border-gray-300 p-2 text-center cursor-pointer hover:bg-gray-200"
                    style={{ width: "48px", minWidth: "48px" }}
                    onClick={addColumn}
                    title="Add column"
                  >
                    +
                  </th>
                </tr>
              </thead>

              <tbody>
                {localItems.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                    <td
                      className="border border-gray-300 text-center p-2"
                      style={{ width: "48px", minWidth: "48px" }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(i)}
                        onChange={(e) => onToggleSelect(i, e.target.checked)}
                      />
                    </td>

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="border border-gray-300 p-0 text-center"
                        style={{ width: "160px", minWidth: "160px" }}
                      >
                        {col.key === "status" ? (
                          <div
                            className={`w-full h-full flex items-center justify-center ${getStatusClass(
                              item[col.key]
                            )}`}
                            style={{ minHeight: "36px" }}
                          >
                            <StatusDropdown
                              value={item[col.key] || ""}
                              onChange={async (val) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[i] = { ...copy[i], [col.key]: val || null };
                                  return copy;
                                });

                                try {
                                  await updateLeads(item.id, { status: val || null });
                                } catch (err) {
                                  console.error(
                                    "Failed to update status:",
                                    err
                                  );
                                }
                              }}
                              onSave={saveEditCell}
                              onCancel={cancelEditCell}
                            />
                          </div>
                        ) : col.key === "timeline" ? (
                          <DateRangePickerCell
                            value={item[col.key] || { start: null, end: null }}
                            onChange={(val) => {
                              // Ensure val has the correct structure
                              const timelineValue = val || { start: null, end: null };
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = {
                                  ...copy[i],
                                  [col.key]: timelineValue,
                                  timelineStart: timelineValue.start,
                                  timelineEnd: timelineValue.end,
                                };
                                return copy;
                              });
                            }}
                            onSave={async () => {
                              try {
                                const currentItem = localItems[i];
                                const timeline = currentItem.timeline || { start: null, end: null };
                                await updateLeads(item.id, {
                                  timelineStart: timeline.start,
                                  timelineEnd: timeline.end,
                                });
                              } catch (err) {
                                console.error("Failed to update timeline:", err);
                              }
                              saveEditCell();
                            }}
                            onCancel={cancelEditCell}
                          />
                        ) : col.key === "last_interaction" ? (
                          <SingleDatePickerCell
                            value={item[col.key] || ""}
                            onChange={(val) => {
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], [col.key]: val };
                                return copy;
                              });
                            }}
                            onSave={async () => {
                              try {
                                await updateLeads(item.id, { last_interaction: localItems[i][col.key] });
                              } catch (err) {
                                console.error("Failed to update last_interaction:", err);
                              }
                              saveEditCell();
                            }}
                            onCancel={cancelEditCell}
                          />
                        ) : col.key === "potential_value" ? (
                          <input
                            type="number"
                            value={item[col.key] || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string for clearing, otherwise parse as integer
                              const newVal = value === "" ? null : parseInt(value, 10) || null;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], [col.key]: newVal };
                                return copy;
                              });
                            }}
                            onBlur={async () => {
                              try {
                                await updateLeads(item.id, { potential_value: localItems[i][col.key] });
                              } catch (err) {
                                console.error("Failed to update potential_value:", err);
                              }
                              saveEditCell();
                            }}
                            onFocus={() => startEditCell(i, col.key)}
                            className="w-full text-center focus:outline-none bg-transparent"
                            placeholder="Enter value"
                          />
                        ) : col.key === "link" ? (
                          <LinkDropdown
                            value={item[col.key] || ""}
                            onChange={async (val) => {
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], [col.key]: val || null };
                                return copy;
                              });

                              try {
                                await updateLeads(item.id, { link: val || null });
                              } catch (err) {
                                console.error("Failed to update link:", err);
                              }
                            }}
                            onSave={saveEditCell}
                            onCancel={cancelEditCell}
                          />
                        ) : (
                          <input
                            value={item[col.key] || ""}
                            onChange={(e) => {
                              const newVal = e.target.value || null;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], [col.key]: newVal };
                                return copy;
                              });
                            }}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, col.key)}
                            className="w-full text-center focus:outline-none bg-transparent"
                            placeholder={col.label}
                          />
                        )}
                      </td>
                    ))}

                    <td
                      className="border border-gray-300 p-2"
                      style={{ width: "48px", minWidth: "48px" }}
                    ></td>
                  </tr>
                ))}

                {addingItem ? (
                  <tr>
                    <td
                      className="border border-gray-300 text-center p-2"
                      style={{ width: "48px", minWidth: "48px" }}
                    >
                      <input type="checkbox" disabled />
                    </td>
                    <td
                      className="border border-gray-300 p-2 text-center"
                      style={{ width: "160px", minWidth: "160px" }}
                    >
                      <input
                        autoFocus
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onBlur={() =>
                          newItemName.trim()
                            ? saveNewItem()
                            : setAddingItem(false)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveNewItem();
                          if (e.key === "Escape") setAddingItem(false);
                        }}
                        placeholder="Enter item name..."
                        className="w-full px-2 py-1 rounded-[8px] focus:outline-none text-center bg-transparent"
                      />
                    </td>
                    {Array(columns.length - 1)
                      .fill(null)
                      .map((_, idx) => (
                        <td
                          key={idx}
                          className="border border-gray-300 p-2 text-center text-gray-400"
                          style={{ width: "160px", minWidth: "160px" }}
                        >
                          -
                        </td>
                      ))}
                    <td
                      className="border border-gray-300 p-2"
                      style={{ width: "48px", minWidth: "48px" }}
                    ></td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="border border-gray-300 p-2 text-center cursor-pointer text-black hover:bg-gray-100"
                      onClick={() => setAddingItem(true)}
                    >
                      + Add item
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