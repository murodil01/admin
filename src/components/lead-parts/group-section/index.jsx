import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerCell = ({ value, onChange, onSave, onCancel }) => {
  const [date, setDate] = useState(value ? new Date(value) : null);

  const handleChange = (date) => {
    setDate(date);
    onChange(date ? date.toISOString().split("T")[0] : "");
  };

  return (
    <ReactDatePicker
      selected={date}
      onChange={handleChange}
      dateFormat="yyyy-MM-dd"
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="w-full px-2 py-1 text-center focus:outline-none"
      placeholderText="Select date"
      isClearable
      tabIndex={-1}
    />
  );
};

const StatusDropdown = ({ value, onChange, onSave, onCancel }) => {
  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "Not Started", label: "Not Started" },
    { value: "Working on it", label: "Working on it" },
    { value: "Stuck", label: "Stuck" },
    { value: "Done", label: "Done" },
  ];

  const handleChange = (e) => {
    onChange(e.target.value);
    onSave();
  };

  return (
    <select
      autoFocus
      value={value || ""}
      onChange={handleChange}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="w-full px-2 py-1 text-center focus:outline-none bg-white border rounded"
    >
      {statusOptions.map((option) => (
        <option key={option.value} value={option.value}>
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
  const dropdownRef = useRef();

  useEffect(() => setLocalItems((items || []).filter(Boolean)), [items]);

  // Dropdown click outside
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
    if (val === "") val = field === "name" ? "Unnamed" : "";
    const newItems = [...localItems];
    newItems[row] = { ...newItems[row], [field]: val };
    setLocalItems(newItems);
    updateItem(id, row, newItems[row]);
    cancelEditCell();
  };

  const saveNewItem = () => {
    if (newItemName.trim()) {
      const newItem = {
        name: newItemName.trim(),
        phoneNumber: "",
        owner: "",
        lastInteraction: "",
        status: "",
        timeline: "",
        notes: "",
        activeSequences: "",
      };
      setLocalItems((prev) => [...prev.filter(Boolean), newItem]);
      addItem(id, newItem);
      setNewItemName("");
      setAddingItem(false);
    }
  };

  const handlePhoneInput = (e, row) => {
    const val = e.target.value.replace(/\D/g, "");
    setLocalItems((prev) => {
      const copy = [...prev];
      copy[row] = { ...copy[row], phoneNumber: val };
      return copy;
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Working on it":
        return "bg-[#928EFF] text-white border border-white";
      case "Done":
        return "bg-[#71DC98] text-white border border-white";
      case "Stuck":
        return "bg-red-500 text-white border border-white";
      case "Not Started":
        return "bg-gray-400 text-white border border-white";
      default:
        return "text-gray-800";
    }
  };

  const onEditClick = () => {
    setEditingTitle(true);
    setDropdownOpen(false);
  };

  const onDeleteClick = () => {
    if (confirm("Are you sure you want to delete this group?")) {
      deleteGroup && deleteGroup(id);
    }
    setDropdownOpen(false);
  };

  return (
    <div className="mb-3 bg-[#CBCBCB] rounded-[8px] relative">
      {/* Group header */}
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
                onBlur={() => {
                  updateTitle(id, titleValue.trim() || "Untitled Group");
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
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

        {/* Dropdown */}
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
            <div className="absolute right-0 mt-2 w-32 bg-[#F5F7FF] rounded-[8px] shadow-md z-50">
              <button
                onClick={onEditClick}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#E2E2E2] text-[12px] text-[#5A5A5A] rounded-t-[8px] justify-start"
              >
                <Edit2 size={15} /> Edit group
              </button>
              <button
                onClick={onDeleteClick}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#E2E2E2] text-[12px] text-[#5A5A5A] rounded-b-[8px] justify-start"
              >
                <Trash2 size={15} /> Delete group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {expanded && (
        <div className="overflow-x-auto min-w-0 px-4 pb-4 pt-2 bg-white">
            <table className="table-auto text-black border-collapse font-normal border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 p-2 w-8"></th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Leads
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Phone Number
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Owner
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Last interaction
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Status
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Notes
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Timeline
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-40">
                    Active sequences
                  </th>
                  <th className="border border-gray-300 p-2 text-center w-12">
                    +
                  </th>
                </tr>
              </thead>
              <tbody>
                {localItems.map(
                  (item, i) =>
                    item && (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="border border-gray-300 text-center p-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(i)}
                            onChange={(e) =>
                              onToggleSelect(i, e.target.checked)
                            }
                          />
                        </td>
                        <td
                          className="border border-gray-300 p-2 text-center cursor-pointer"
                          onDoubleClick={() => startEditCell(i, "name")}
                        >
                          {editingCell?.row === i &&
                          editingCell?.field === "name" ? (
                            <input
                              autoFocus
                              value={item.name || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[i] = { ...copy[i], name: newVal };
                                  return copy;
                                });
                              }}
                              onBlur={saveEditCell}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditCell();
                                if (e.key === "Escape") cancelEditCell();
                              }}
                              className="w-full text-center focus:outline-none"
                            />
                          ) : (
                            item.name || "Unnamed"
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            value={item.phoneNumber || ""}
                            onChange={(e) => handlePhoneInput(e, i)}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, "phoneNumber")}
                            className="w-full text-center focus:outline-none"
                            placeholder="Phone number"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            value={item.owner || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], owner: newVal };
                                return copy;
                              });
                            }}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, "owner")}
                            className="w-full text-center focus:outline-none"
                            placeholder="Owner"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            value={item.lastInteraction || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = {
                                  ...copy[i],
                                  lastInteraction: newVal,
                                };
                                return copy;
                              });
                            }}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, "lastInteraction")}
                            className="w-full text-center focus:outline-none"
                            placeholder="Last interaction"
                          />
                        </td>
                        <td
                          className={`border border-gray-300 p-2 text-center cursor-pointer ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {editingCell?.row === i &&
                          editingCell?.field === "status" ? (
                            <StatusDropdown
                              value={item.status || ""}
                              onChange={(val) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  copy[i] = { ...copy[i], status: val };
                                  return copy;
                                });
                              }}
                              onSave={saveEditCell}
                              onCancel={cancelEditCell}
                            />
                          ) : (
                            item.status || "Not Started"
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            value={item.notes || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], notes: newVal };
                                return copy;
                              });
                            }}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, "notes")}
                            className="w-full text-center focus:outline-none"
                            placeholder="Notes"
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <DatePickerCell
                            value={item.timeline}
                            onChange={(val) => {
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = { ...copy[i], timeline: val };
                                return copy;
                              });
                            }}
                            onSave={saveEditCell}
                            onCancel={cancelEditCell}
                          />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input
                            value={item.activeSequences || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                copy[i] = {
                                  ...copy[i],
                                  activeSequences: newVal,
                                };
                                return copy;
                              });
                            }}
                            onBlur={saveEditCell}
                            onFocus={() => startEditCell(i, "activeSequences")}
                            className="w-full text-center focus:outline-none"
                            placeholder="Active sequences"
                          />
                        </td>
                      </tr>
                    )
                )}

                {/* Add item row */}
                {addingItem ? (
                  <tr>
                    <td className="border border-gray-300 text-center p-2">
                      <input type="checkbox" disabled />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
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
                        className="w-full px-2 py-1 rounded-[8px] focus:outline-none text-center"
                      />
                    </td>
                    {Array(7)
                      .fill(null)
                      .map((_, idx) => (
                        <td
                          key={idx}
                          className="border border-gray-300 p-2 text-center text-gray-400"
                        >
                          -
                        </td>
                      ))}
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="border border-gray-300 p-2 text-center cursor-pointer text-black"
                      onClick={() => setAddingItem(true)}
                    >
                      + Add item
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default GroupSection;



// import React from 'react'

// const GroupSection = () => {
//   return (
//     <div>
//       GroupSection
//     </div>
//   )
// }

// export default GroupSection
