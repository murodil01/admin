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
import { getLeads, updateLeads } from "../../../api/services/leadsService";
import StatusDropdown from "./status-board";
import { Select, Avatar } from "antd";

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

const DateRangePickerCell = ({
  value = { start: null, end: null },
  onChange,
  onSave,
  onCancel,
}) => {
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
            img: (() => {
              const picture = lead.person_detail.profile_picture;

              if (!picture) return null;

              // Get the URL string
              const url = typeof picture === "string" ? picture : picture?.url;

              if (!url) return null;

              // If it's already a full URL, return as is
              if (url.startsWith("http://") || url.startsWith("https://")) {
                return url;
              }

              // Prepend base URL for relative paths
              return `https://prototype-production-2b67.up.railway.app${url}`;
            })(),
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

    onChange(selectedPerson); // localItems ga to‘liq obyekt

    if (groupId && leadId) {
      try {
        await updateLeads(groupId, leadId, { person_detail: selectedPerson });
      } catch (err) {
        console.error("Failed to update person_detail:", err);
      }
    }

    onSave(); // editingni yakunlash
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
  boardId, // 👉 qo‘shildi

  // onMoveItem,
  // isDraggingOver,
  // onDragStart,
  // onDragOver,
  // onDrop,
  // onDragEnd,
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
    { key: "link", label: "Source", isCustom: false },
    { key: "person_detail", label: "Owner", isCustom: false },
    // { key: "last_interaction", label: "Last interaction", isCustom: false },
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
          potential_value: item.potential_value || null,
          person: item.person || null, // Ensure person is null if not set
          timeline: item.timeline || {
            start: item.timelineStart || null,
            end: item.timelineEnd || null,
          },
          id: item.id || `temp-${Date.now()}-${Math.random()}`, // Ensure unique ID
          group: item.group || id, // Ensure group ID is set
        }))
      );
    }
  }, [items, id]);

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

  const saveEditCell = async () => {
    if (!editingCell) return;
    const { row, field } = editingCell;
    let val = localItems[row]?.[field] ?? "";

    if (typeof val === "string") val = val.trim();
    if (val === "") val = field === "name" ? "Unnamed" : null;

    if (field === "potential_value") {
      val = val === "" || val === null ? null : parseInt(val, 10) || null;
    }

    const newItems = [...localItems];
    newItems[row] = { ...newItems[row], [field]: val };

    if (field === "timeline") {
      const timelineValue = val || { start: null, end: null };
      newItems[row].timelineStart = timelineValue.start;
      newItems[row].timelineEnd = timelineValue.end;
    }

    if (field === "person_detail") {
      val = val || null; // val to‘liq person_detail object yoki null
    }

    setLocalItems(newItems);
    updateItem(id, row, newItems[row]);

    // Save to backend
    try {
      if (field !== "timeline") {
        if (!newItems[row].group || !newItems[row].id) {
          console.error("Missing group or lead ID:", newItems[row]);
          return;
        }
        await updateLeads(newItems[row].group, newItems[row].id, {
          [field]: val,
        });
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }

    cancelEditCell();
  };

  const saveNewItem = () => {
    if (newItemName.trim()) {
      const newItem = {
        name: newItemName.trim(),
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        group: id, // Set group ID
        person: null, // Initialize person as null
      };
      columns.forEach((col) => {
        if (!newItem[col.key]) {
          newItem[col.key] = col.key === "potential_value" ? null : null;
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
        [newKey]: null,
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

  return (
    <div className="mb-3 rounded-[8px]">
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
            <table className="table-auto absolute border-collapse font-normal border border-gray-300 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "48px", minWidth: "48px" }}
                  ></th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-gray-300 p-2 text-center relative group"
                      style={{ width: "160px", minWidth: "160px" }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {editingColumnIndex === columns.indexOf(col) ? (
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
                              startEditColumnTitle(
                                columns.indexOf(col),
                                col.label
                              )
                            }
                            className="cursor-pointer"
                          >
                            {col.label}
                          </span>
                        )}
                        {col.isCustom && (
                          <button
                            onClick={() => deleteColumn(columns.indexOf(col))}
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
                {localItems.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      localItems.indexOf(item) % 2 === 0 ? "bg-gray-50" : ""
                    }
                  >
                    <td
                      className="border border-gray-300 text-center p-2"
                      style={{ width: "48px", minWidth: "48px" }}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(localItems.indexOf(item))}
                        onChange={(e) =>
                          onToggleSelect(
                            localItems.indexOf(item),
                            e.target.checked
                          )
                        }
                      />
                    </td>

                    {columns.map((col) => (
                      <td
                        key={`${item.id}-${col.key}`}
                        className="border border-gray-300 p-0 text-center"
                        style={{ width: "160px", minWidth: "160px" }}
                      >
                        {col.key === "status" ? (
                          editingCell?.row === localItems.indexOf(item) &&
                          editingCell?.field === col.key ? (
                            // Edit mode
                            <StatusDropdown
                              groupId={id}
                              itemId={item.id}
                              boardId={boardId} // Make sure this is passed
                              value={item.status}
                              onChange={(val) => {
                                setLocalItems((prev) => {
                                  const copy = [...prev];
                                  const index = prev.findIndex(
                                    (it) => it.id === item.id
                                  );
                                  copy[index] = {
                                    ...copy[index],
                                    [col.key]: val,
                                  };
                                  return copy;
                                });
                              }}
                              onSave={saveEditCell}
                              onCancel={cancelEditCell}
                            />
                          ) : (
                            // Display mode - show status name
                            <div
                              className="w-full h-full flex items-center justify-center cursor-pointer"
                              style={{ minHeight: "36px" }}
                              onClick={() =>
                                startEditCell(localItems.indexOf(item), col.key)
                              }
                            >
                              {item.status?.name || "No Status"}
                            </div>
                          )
                        ) : col.key === "timeline" ? (
                          <DateRangePickerCell
                            value={item.timeline || { start: null, end: null }}
                            onChange={(val) => {
                              const timelineValue = val || {
                                start: null,
                                end: null,
                              };
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  timeline: timelineValue,
                                  timelineStart: timelineValue.start,
                                  timelineEnd: timelineValue.end,
                                };
                                return copy;
                              });
                            }}
                            onSave={async (val) => {
                              if (!item.group || !item.id) {
                                console.error(
                                  "Missing group or lead ID:",
                                  item
                                );
                                return;
                              }
                              try {
                                await updateLeads(item.group, item.id, {
                                  timelineStart: val.start || null,
                                  timelineEnd: val.end || null,
                                });
                              } catch (err) {
                                console.error(
                                  "Failed to update timeline:",
                                  err
                                );
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
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  [col.key]: val,
                                };
                                return copy;
                              });
                            }}
                            onSave={async (val) => {
                              if (!item.group || !item.id) {
                                console.error(
                                  "Missing group or lead ID:",
                                  item
                                );
                                return;
                              }
                              try {
                                await updateLeads(item.group, item.id, {
                                  last_interaction: val,
                                });
                              } catch (err) {
                                console.error(
                                  "Failed to update last_interaction:",
                                  err
                                );
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
                              const newVal =
                                value === ""
                                  ? null
                                  : parseInt(value, 10) || null;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  [col.key]: newVal,
                                };
                                return copy;
                              });
                            }}
                            onBlur={async () => {
                              if (!item.group || !item.id) {
                                console.error(
                                  "Missing group or lead ID:",
                                  item
                                );
                                return;
                              }
                              try {
                                await updateLeads(item.group, item.id, {
                                  potential_value: localItems.find(
                                    (it) => it.id === item.id
                                  )[col.key],
                                });
                              } catch (err) {
                                console.error(
                                  "Failed to update potential_value:",
                                  err
                                );
                              }
                              saveEditCell();
                            }}
                            onFocus={() =>
                              startEditCell(
                                localItems.findIndex((it) => it.id === item.id),
                                col.key
                              )
                            }
                            className="w-full text-center focus:outline-none bg-transparent"
                            placeholder="Enter value"
                          />
                        ) : col.key === "link" ? (
                          <LinkDropdown
                            value={item[col.key] || ""}
                            onChange={async (val) => {
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  [col.key]: val || null,
                                };
                                return copy;
                              });
                              if (!item.group || !item.id) {
                                console.error(
                                  "Missing group or lead ID:",
                                  item
                                );
                                return;
                              }
                              try {
                                await updateLeads(item.group, item.id, {
                                  link: val || null,
                                });
                              } catch (err) {
                                console.error("Failed to update link:", err);
                              }
                            }}
                            onSave={saveEditCell}
                            onCancel={cancelEditCell}
                          />
                        ) : col.key === "person_detail" ? (
                          <PersonDropdown
                            value={item[col.key] || ""} // bo‘sh bo‘lsa ""
                            groupId={item.group} // groupId yuboriladi
                            leadId={item.id} // leadId yuboriladi
                            onChange={(val) => {
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  [col.key]: val || null, // bo‘sh bo‘lsa null
                                };
                                return copy;
                              });
                            }}
                            onSave={saveEditCell} // Save funksiyasi
                            onCancel={cancelEditCell} // Cancel funksiyasi
                          />
                        ) : (
                          <input
                            value={item[col.key] || ""}
                            onChange={(e) => {
                              const newVal = e.target.value || null;
                              setLocalItems((prev) => {
                                const copy = [...prev];
                                const index = prev.findIndex(
                                  (it) => it.id === item.id
                                );
                                copy[index] = {
                                  ...copy[index],
                                  [col.key]: newVal,
                                };
                                return copy;
                              });
                            }}
                            onBlur={async () => {
                              if (!item.group || !item.id) {
                                console.error(
                                  "Missing group or lead ID:",
                                  item
                                );
                                return;
                              }
                              try {
                                await updateLeads(item.group, item.id, {
                                  [col.key]: localItems.find(
                                    (it) => it.id === item.id
                                  )[col.key],
                                });
                              } catch (err) {
                                console.error(
                                  `Failed to update ${col.key}:`,
                                  err
                                );
                              }
                              saveEditCell();
                            }}
                            onFocus={() =>
                              startEditCell(
                                localItems.findIndex((it) => it.id === item.id),
                                col.key
                              )
                            }
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
                  <tr key="new-item">
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
                          key={`new-item-placeholder-${idx}`}
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
                  <tr key="add-item">
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


import { useState, useEffect, useRef } from "react";
import GroupSection from "../group-section";
import { CiExport } from "react-icons/ci";
import { BiArchiveIn } from "react-icons/bi";
import { ArrowRight, Trash2, Copy, Plus, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getGroups,
  createGroup,
  deleteGroup,
  updateGroup,
} from "../../../api/services/groupService";
import { getBoards } from "../../../api/services/boardService";
import {
  getLeads,
  createLeads,
  updateLeads,
  deleteLeads,
} from "../../../api/services/leadsService";

const STORAGE_KEY_GROUPS = "my-app-groups";
const STORAGE_KEY_EXPANDED = "my-app-groups-expanded";

const MainLead = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [availableBoards, setAvailableBoards] = useState([]);

  const toastShownRef = useRef(false);

  // Boardlarni yuklash
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await getBoards();
        setAvailableBoards(res.data);
      } catch (err) {
        console.error("Boardlarni yuklashda xato:", err);
        toast.error("Boardlarni yuklashda xato");
      }
    };
    fetchBoards();
  }, []);

  // BoardId bo'yicha guruhlarni va leadlarni yuklash
  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await getGroups(boardId); // boardId bilan
        const formatted = await Promise.all(
          res.data.map(async (group) => {
            try {
              const leadsRes = await getLeads(group.id); // groupId bilan
              return {
                id: group.id,
                title: group.name || "Untitled Group",
                items: leadsRes.data || [],
              };
            } catch {
              const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY_GROUPS) || "[]"
              );
              const savedGroup = saved.find((g) => g.id === group.id);
              return {
                id: group.id,
                title: group.name || "Untitled Group",
                items: savedGroup?.items || [],
              };
            }
          })
        );

        setGroups(formatted);

        if (!toastShownRef.current && formatted.length > 0) {
          toastShownRef.current = true;
        }
      } catch (err) {
        console.error("getGroups/getLeads xatosi:", err);
        toast.error("Guruh yoki leadlarni yuklashda xato ❌");
        const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (saved) setGroups(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    const savedExpanded = localStorage.getItem(STORAGE_KEY_EXPANDED);
    if (savedExpanded) setExpandedGroups(JSON.parse(savedExpanded));
  }, [boardId]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Guruh qo'shish
  const addGroup = async (title) => {
    const cleanName = String(title || "").trim();
    if (!cleanName || !boardId) {
      toast.error("Board mavjud emas. Iltimos, board yaratib oling.");
      setAddingGroup(false);
      return;
    }

    try {
      const res = await createGroup(cleanName, boardId);
      setGroups((prev) => [
        ...prev,
        { id: res.data.id, title: res.data.name, items: [] },
      ]);
      toast.success("Guruh yaratildi ✅");
    } catch (err) {
      console.error("createGroup xatosi:", err.response?.data || err);
      toast.error("Guruh yaratishda xatolik ❌");
      if (err.response?.status === 400 && err.response.data?.board) {
        setShowBoardSelector(true);
      }
    }

    setAddingGroup(false);
  };

  // Guruh o'chirish
  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId, boardId);
      toast.success("Guruh o'chirildi ");
    } catch (err) {
      console.error("deleteGroup xatosi:", err.response?.data || err);
      toast.error("Guruh o'chirilmadi ");
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setExpandedGroups((prev) => {
      const copy = { ...prev };
      delete copy[groupId];
      return copy;
    });
    setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));
  };

  // Lead update
  const updateGroupTitle = async (groupId, newTitle) => {
    const oldTitle = groups.find((g) => g.id === groupId)?.title;

    try {
      await updateGroup(groupId, { name: newTitle }, boardId);
      toast.success("Guruh nomi yangilandi ");

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g))
      );
    } catch (err) {
      console.error("updateGroup xatosi:", err.response?.data || err);
      toast.error("Guruh nomini yangilashda xato ");

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: oldTitle } : g))
      );
    }
  };

  // Lead qo‘shish
  const addItemToGroup = async (groupId, newItem) => {
    try {
      const res = await createLeads({ ...newItem, group: groupId });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, items: [...g.items, res.data] } : g
        )
      );
      toast.success("Lead qo'shildi ");
    } catch (err) {
      console.error("createLeads xatosi:", err);
      toast.error("Lead qo'shishda xato ");
    }
  };

  const updateItemInGroup = async (groupId, itemIndex, updatedItem) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      toast.error("Group topilmadi!");
      return;
    }

    const oldItem = group.items[itemIndex];
    if (!oldItem) {
      toast.error("Lead topilmadi!");
      return;
    }

    const leadId = oldItem.id;
    const realGroupId = oldItem.group; // backend kutadi

    try {
      const res = await updateLeads(realGroupId, leadId, updatedItem);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                items: g.items.map((item, idx) =>
                  idx === itemIndex ? res.data : item
                ),
              }
            : g
        )
      );

      toast.success("Lead yangilandi");
    } catch (err) {
      console.error("updateLeads xatosi:", err.response?.data || err);
      toast.error("Lead yangilashda xato");
    }
  };

  const deleteItemFromGroup = async (groupId, itemIndex) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const item = group.items[itemIndex];
    if (!item) return;

    try {
      await deleteLeads(item.group, item.id); // item.group va item.id yuboriladi
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.filter((_, idx) => idx !== itemIndex) }
            : g
        )
      );
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );
      toast.success("Lead o'chirildi ✅");
    } catch (err) {
      console.error("deleteLeads xatosi:", err);
      toast.error("Lead o'chirilmadi ❌");
    }
  };

  const toggleExpanded = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleSelectItem = (groupId, itemIndex, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, { groupId, itemIndex }]);
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(({ groupId, itemIndex }) =>
      deleteItemFromGroup(groupId, itemIndex)
    );
    setSelectedItems([]);
  };

  const handleDuplicateSelected = () => {
    selectedItems.forEach(({ groupId, itemIndex }) => {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        const item = group.items[itemIndex];
        addItemToGroup(groupId, { ...item, name: `${item.name} copy` });
      }
    });
    setSelectedItems([]);
  };

  const handleExportSelected = () => {
    const data = selectedItems
      .map(({ groupId, itemIndex }) => {
        const group = groups.find((g) => g.id === groupId);
        return group ? group.items[itemIndex] : null;
      })
      .filter(Boolean);
    console.log("Exported data:", data);
    toast.success("Items exported to console ");
    setSelectedItems([]);
  };

  const handleArchiveSelected = () => {
    toast.success("Items archived ");
    setSelectedItems([]);
  };

  const handleMoveTo = () => {
    toast.success("Moved items ");
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!boardId) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-lg">Iltimos, avval board tanlang</p>
        <button
          onClick={() => setShowBoardSelector(true)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Board tanlash
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 rounded-b-[8px]">
      {showBoardSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Select board</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableBoards.map((board) => (
                <div
                  key={board.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                  onClick={() => {
                    navigate(`/leads-right/${board.id}`);
                    setShowBoardSelector(false);
                  }}
                >
                  {board.name}
                </div>
              ))}
            </div>
            <button
              className="mt-4 bg-gray-300 px-4 py-2 rounded-[8px] w-full"
              onClick={() => setShowBoardSelector(false)}
            >
              Cansel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500 text-lg mb-4">📭 Hali guruhlar yo'q</p>
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-2 text-base rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" /> Add new group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <GroupSection
              key={group.id}
              id={group.id}
              title={group.title}
              items={group.items}
              expanded={!!expandedGroups[group.id]}
              onToggleExpanded={() => toggleExpanded(group.id)}
              updateTitle={updateGroupTitle}
              addItem={addItemToGroup}
              updateItem={updateItemInGroup}
              deleteItem={deleteItemFromGroup}
              deleteGroup={handleDeleteGroup}
              selected={selectedItems
                .filter((s) => s.groupId === group.id)
                .map((s) => s.itemIndex)}
              onToggleSelect={(itemIndex, isSelected) =>
                toggleSelectItem(group.id, itemIndex, isSelected)
              }
            />
          ))
        )}
      </div>

      {addingGroup ? (
        <AddGroupInput
          onSave={addGroup}
          onCancel={() => setAddingGroup(false)}
        />
      ) : groups.length > 0 ? (
        <button
          onClick={() => setAddingGroup(true)}
          className="mt-5 flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-[6px] text-[16px] rounded-[8px] font-medium transition-colors "
        >
          <Plus className="w-5 h-5" /> Add new group
        </button>
      ) : null}

      {selectedItems.length > 0 && (
        <div className="mt-5 max-w-[1000px] mx-auto bg-[#F2F2F2] p-4 flex flex-wrap items-center justify-center shadow-lg rounded-[8px]">
          <div className="flex flex-wrap items-center gap-4 font-medium text-[#313131] text-[14px] sm:text-[16px] justify-center w-full md:w-auto">
            <div className="flex items-center gap-2 sm:gap-4 text-black rounded-full px-2 sm:px-3 py-1 font-semibold">
              <span className="bg-[#0061FE] px-2 sm:px-[10px] py-[2px] text-[14px] sm:text-[16px] text-white rounded-full">
                {selectedItems.length}
              </span>
              Selected leads
            </div>

            <button
              onClick={handleDuplicateSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <Copy size={15} />
              <span className="text-xs sm:text-sm">Copy</span>
            </button>

            <button
              onClick={handleExportSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <CiExport size={15} />
              <span className="text-xs sm:text-sm">Export</span>
            </button>

            <button
              onClick={handleArchiveSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <BiArchiveIn size={15} />
              <span className="text-xs sm:text-sm">Archive</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <Trash2 size={15} />
              <span className="text-xs sm:text-sm">Delete</span>
            </button>

            <button
              onClick={handleMoveTo}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <ArrowRight size={15} />
              <span className="text-xs sm:text-sm">Move to</span>
            </button>

            <div className="hidden sm:block h-7 w-[1px] bg-[#313131] mx-2"></div>

            <button
              onClick={() => setSelectedItems([])}
              className="text-gray-500 hover:text-gray-700 p-[10px] rounded-[8px] border"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// AddGroupInput komponenti
const AddGroupInput = ({ onSave, onCancel }) => {
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
      setValue("");
    }
  };

  return (
    <div className="flex gap-2 max-w-max mt-4">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleSave}
        placeholder="Enter group title"
        className="flex-grow px-4 py-2 rounded-[8px] border border-gray-400 focus:outline-none text-base w-60"
      />
      <button
        onClick={onCancel}
        className="px-3 py-2 bg-gray-300 rounded-[8px] text-gray-700 font-semibold flex items-center"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default MainLead;

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
    const selectedStatus = statusOptions.find(
      (opt) => opt.value === selectedId
    );

    // Pass the full status object to onChange
    onChange(
      selectedStatus
        ? {
            id: selectedStatus.value,
            name: selectedStatus.label,
          }
        : null
    );

    try {
      // Update lead status in backend
      await updateBoard(groupId, itemId, {
        status: selectedStatus ? selectedStatus.value : null,
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
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;


