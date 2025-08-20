import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
  // X,
} from "lucide-react";
// import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updateGroup } from "../../../api/services/groupService";
import {
  // getLeads,
  updateStatus,
  // getLeadsById,
  updateLeads,
} from "../../../api/services/leadsService";
import StatusDropdown from "./status-board";
import { Select, Avatar } from "antd";
import TableBox from "./Table";
// const SingleDatePickerCell = ({ value = "", onChange, onSave, onCancel }) => {
//   const [date, setDate] = useState(value ? new Date(value) : null);

//   const handleChange = (date) => {
//     setDate(date);
//     onChange(date ? date.toISOString().split("T")[0] : null);
//   };

//   return (
//     <div className="flex flex-col gap-1 w-full h-full">
//       <ReactDatePicker
//         selected={date}
//         onChange={handleChange}
//         dateFormat="yyyy-MM-dd"
//         onBlur={() => onSave(date ? date.toISOString().split("T")[0] : null)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") onSave();
//           if (e.key === "Escape") onCancel();
//         }}
//         className="w-full px-2 py-1 text-center focus:outline-none bg-transparent"
//         placeholderText="Select Date"
//         isClearable
//       />
//     </div>
//   );
// };

// const DateRangePickerCell = ({
//   value = { start: null, end: null },
//   onChange,
//   onSave,
//   onCancel,
// }) => {
//   const safeValue = value || { start: null, end: null };
//   const [startDate, setStartDate] = useState(
//     safeValue.start ? new Date(safeValue.start) : null
//   );
//   const [endDate, setEndDate] = useState(
//     safeValue.end ? new Date(safeValue.end) : null
//   );

//   const handleChange = (dates) => {
//     const [start, end] = dates;
//     setStartDate(start);
//     setEndDate(end);
//     onChange({
//       start: start ? start.toISOString().split("T")[0] : null,
//       end: end ? end.toISOString().split("T")[0] : null,
//     });
//   };

//   const handleSave = () => {
//     onSave({
//       start: startDate ? startDate.toISOString().split("T")[0] : null,
//       end: endDate ? endDate.toISOString().split("T")[0] : null,
//     });
//   };

//   return (
//     <div className="flex flex-col gap-1 w-full h-full">
//       <ReactDatePicker
//         selected={startDate}
//         onChange={handleChange}
//         startDate={startDate}
//         endDate={endDate}
//         selectsRange
//         dateFormat="yyyy-MM-dd"
//         onBlur={handleSave}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") handleSave();
//           if (e.key === "Escape") onCancel();
//         }}
//         className="w-full px-2 py-1 text-center focus:outline-none bg-transparent"
//         placeholderText="Timeline"
//         isClearable
//       />
//     </div>
//   );
// };

// const LinkDropdown = ({ value, onChange, onSave, onCancel }) => {
//   const linkOptions = [
//     { value: "", label: "Select Link Type" },
//     { value: "ad", label: "Ad" },
//     { value: "outreach", label: "Outreach" },
//     { value: "referral", label: "Referral" },
//     { value: "event", label: "Event" },
//   ];

//   const handleChange = (e) => {
//     onChange(e.target.value);
//     onSave();
//   };

//   return (
//     <select
//       value={value || ""}
//       onChange={handleChange}
//       onBlur={onSave}
//       onKeyDown={(e) => {
//         if (e.key === "Enter") onSave();
//         if (e.key === "Escape") onCancel();
//       }}
//       className="w-full h-full text-center focus:outline-none border-none appearance-none bg-transparent"
//     >
//       {linkOptions.map((option) => (
//         <option
//           key={option.value}
//           value={option.value}
//           className="bg-white text-black"
//         >
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// const PersonDropdown = ({ value, onChange, onSave, groupId, leadId }) => {
//   const [personOptions, setPersonOptions] = useState([]);

//   useEffect(() => {
//     const fetchPersons = async () => {
//       try {
//         const res = await getLeads();
//         const options = res.data
//           .filter((lead) => lead.person_detail)
//           .map((lead) => ({
//             id: lead.person_detail.id,
//             name: lead.person_detail.fullname || "Unnamed Person",
//             img: (() => {
//               const picture = lead.person_detail.profile_picture;
//               if (!picture) return null;
//               const url = typeof picture === "string" ? picture : picture?.url;
//               if (!url) return null;
//               if (url.startsWith("http://") || url.startsWith("https://")) {
//                 return url;
//               }
//               return `https://prototype-production-2b67.up.railway.app${url}`;
//             })(),
//           }));
//         setPersonOptions(options);
//       } catch (err) {
//         console.error("Failed to fetch persons:", err);
//       }
//     };
//     fetchPersons();
//   }, []);

//  const handleChange = async (selectedId) => {
//     const selectedPerson = personOptions.find((p) => p.id === selectedId) || null;
//     onChange(selectedPerson);

//     if (groupId && leadId) {
//       try {
//         // Fixed: Use correct function with proper parameters
//         await updateLeads(groupId, leadId, { person_detail: selectedPerson });
//       } catch (err) {
//         console.error("Failed to update person_detail:", err);
//       }
//     }
//     onSave();
//   };

//   return (
//     <Select
//       value={value?.id || undefined}
//       onChange={handleChange}
//       onBlur={onSave}
//       placeholder="Select Person"
//       style={{ width: "100%", border: "none" }}
//       className="ant-select-borderless custom-selectt"
//       optionLabelProp="label"
//     >
//       {personOptions.map((person) => (
//         <Select.Option
//           key={person.id}
//           value={person.id}
//           label={person.name}
//           style={{ border: "none" }}
//         >
//           <div className="flex items-center gap-2">
//             {person.img && <Avatar size={24} src={person.img} />}
//             <span>{person.name}</span>
//           </div>
//         </Select.Option>
//       ))}
//     </Select>
//   );
// };

const GroupSection = ({
  id,
  title,
  items,
  expanded,
  onToggleExpanded,
  updateTitle,
  // addItem,
  updateItem,
  deleteGroup,
  // selected,
  // onToggleSelect,
  // boardId,
  // onMoveItem,
  // onDragStart,
  // onDragOver,
  // onDrop,
  // onDragEnd,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [localItems, setLocalItems] = useState((items || []).filter(Boolean));
  const [editingCell, setEditingCell] = useState(null);
  // const [addingItem, setAddingItem] = useState(false);
  // const [newItemName, setNewItemName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [editingColumnIndex, setEditingColumnIndex] = useState(null);
  // const [columnTitleValue, setColumnTitleValue] = useState("");
  const dropdownRef = useRef();

  // const [columns, setColumns] = useState([
  //   { key: "name", label: "Leads", isCustom: false },
  //   { key: "phone", label: "Phone Number", isCustom: false },
  //   { key: "link", label: "Source", isCustom: false },
  //   { key: "person_detail", label: "Owner", isCustom: false },
  //   { key: "last_interaction", label: "Last interaction", isCustom: false },
  //   { key: "status", label: "Status", isCustom: false },
  //   { key: "notes", label: "Notes", isCustom: false },
  //   { key: "potential_value", label: "Potential value", isCustom: false },
  //   { key: "timeline", label: "Timeline", isCustom: false },
  // ]);

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

  // const startEditCell = (row, field) => setEditingCell({ row, field });
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
      val = val || null;
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

        // Use the correct function based on the field being updated
        if (field === "status") {
          // For status updates, use updateStatus with the lead ID
          await updateStatus(newItems[row].id, { [field]: val });
        } else {
          // For other fields, use updateLeads
          await updateLeads(newItems[row].group, newItems[row].id, {
            [field]: val,
          });
        }
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    }

    cancelEditCell();
  };

  // const saveNewItem = () => {
  //   if (newItemName.trim()) {
  //     const newItem = {
  //       name: newItemName.trim(),
  //       id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
  //       group: id, // Set group ID
  //       person: null, // Initialize person as null
  //     };
  //     columns.forEach((col) => {
  //       if (!newItem[col.key]) {
  //         newItem[col.key] = col.key === "potential_value" ? null : null;
  //       }
  //     });
  //     setLocalItems((prev) => [...prev.filter(Boolean), newItem]);
  //     addItem(id, newItem);
  //     setNewItemName("");
  //     setAddingItem(false);
  //   }
  // };

  // const addColumn = () => {
  //   const newKey = `custom_${Date.now()}`;
  //   const newLabel = `Custom ${
  //     columns.filter((col) => col.isCustom).length + 1
  //   }`;
  //   setColumns((prev) => [
  //     ...prev,
  //     { key: newKey, label: newLabel, isCustom: true },
  //   ]);
  //   setLocalItems((prev) =>
  //     prev.map((item) => ({
  //       ...item,
  //       [newKey]: null,
  //     }))
  //   );
  // };

  // const startEditColumnTitle = (index, currentLabel) => {
  //   setEditingColumnIndex(index);
  //   setColumnTitleValue(currentLabel);
  // };

  // const saveColumnTitle = () => {
  //   if (editingColumnIndex !== null) {
  //     const newLabel = columnTitleValue.trim() || "Untitled Column";
  //     setColumns((prev) =>
  //       prev.map((col, idx) =>
  //         idx === editingColumnIndex ? { ...col, label: newLabel } : col
  //       )
  //     );
  //     setEditingColumnIndex(null);
  //     setColumnTitleValue("");
  //   }
  // };

  // const cancelEditColumnTitle = () => {
  //   setEditingColumnIndex(null);
  //   setColumnTitleValue("");
  // };

  // const deleteColumn = (index) => {
  //   const columnToDelete = columns[index];
  //   if (columnToDelete.isCustom) {
  //     setColumns((prev) => prev.filter((_, idx) => idx !== index));
  //     setLocalItems((prev) =>
  //       prev.map((item) => {
  //         const newItem = { ...item };
  //         delete newItem[columnToDelete.key];
  //         return newItem;
  //       })
  //     );
  //   }
  // };

  return (
    <div className="mb-3 rounded-[8px] w-full h-auto">
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
        <>
          <TableBox />
        </>
      )}
    </div>
  );
};

export default GroupSection;
