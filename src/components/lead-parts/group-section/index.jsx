import { useState, useEffect, useRef } from "react";
import {
  User,
  ChevronRight,
  ChevronDown,
  Trash2,
  MoreVertical,
  Edit2,
} from "lucide-react";

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

  const [localItems, setLocalItems] = useState(items || []);
  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const [editingCell, setEditingCell] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleDoubleClick = () => setEditingTitle(true);
  const handleTitleChange = (e) => setTitleValue(e.target.value);
  const handleTitleBlur = () => {
    updateTitle(id, titleValue.trim() || "Untitled Group");
    setEditingTitle(false);
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

  const startEditCell = (row, field) => setEditingCell({ row, field });
  const cancelEditCell = () => setEditingCell(null);

  const saveEditCell = () => {
    if (!editingCell) return;

    const { row, field } = editingCell;
    let val = localItems[row][field];
    if (typeof val === "string") val = val.trim();

    if (val === "") {
      val = field === "name" ? "Unnamed" : "";
    }

    const newItems = [...localItems];
    newItems[row] = { ...newItems[row], [field]: val };
    setLocalItems(newItems);

    updateItem(id, row, newItems[row]);

    cancelEditCell();
  };

  const getStatusClass = (status) => {
    if (status === "Working on it") return "bg-purple-300 text-purple-800";
    if (status === "Done") return "bg-green-300 text-green-800";
    return "bg-gray-300 text-gray-800";
  };

  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const saveNewItem = () => {
    if (newItemName.trim()) {
      const newItem = { name: newItemName.trim(), status: "", date: "" };
      setLocalItems((prev) => [...prev, newItem]);
      addItem(id, newItem);
      setNewItemName("");
      setAddingItem(false);
    }
  };

  return (
    <div className="mb-3 bg-[#CBCBCB] rounded-[8px] relative">
      <div className="flex items-center justify-between w-full p-[30px] cursor-pointer rounded-[8px] select-none">
        <div
          onClick={onToggleExpanded}
          className="flex items-center gap-3 font-medium text-gray-900 flex-1"
          aria-label="Toggle group"
        >
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
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                className="text-[18px] text-black font-medium rounded-[8px]"
              />
            ) : (
              <span
                onDoubleClick={handleTitleDoubleClick}
                className="text-[18px] font-medium cursor-pointer"
                title="Double click to edit title"
              >
                {titleValue}
              </span>
            )}

            <small className="font-normal text-[14px] text-black mt-1">
              {localItems.length} item{localItems.length > 1 ? "s" : ""}
            </small>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((open) => !open);
            }}
            className="p-2 rounded-[8px] bg-[#E2E2E2] hover:bg-gray-300"
            title="Options"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-31 bg-[#F5F7FF] rounded-[8px] shadow-md z-50">
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

      {expanded && (
        <div className="px-6 pb-5 pt-3 bg-white">
          <table className="w-full table-fixed border-collapse border border-gray-300 text-sm rounded-b-[8px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 p-2 w-8"></th>
                <th className="border border-gray-300 p-2 text-center text-[16px] font-medium text-black cursor-pointer">
                  Item
                </th>
                <th className="border border-gray-300 p-2 text-center text-[16px] font-medium text-black cursor-pointer">
                  Person
                </th>
                <th className="border border-gray-300 p-2 text-center text-[16px] font-medium text-black cursor-pointer">
                  Status
                </th>
                <th className="border border-gray-300 p-2 text-center text-[16px] font-medium text-black cursor-pointer">
                  Date
                </th>
                <th className="border border-gray-300 p-2 text-center text-[16px] font-medium text-black cursor-pointer">
                  +
                </th>
              </tr>
            </thead>
            <tbody>
              {localItems.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="border border-gray-300 text-center p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={(e) => onToggleSelect(i, e.target.checked)}
                    />
                  </td>
                  <td
                    className="border border-gray-300 p-2 cursor-pointer text-center"
                    onClick={() => startEditCell(i, "name")}
                  >
                    {editingCell?.row === i && editingCell?.field === "name" ? (
                      <input
                        autoFocus
                        value={item.name}
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
                      item.name
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <User className="inline w-4 h-4 text-gray-600" />
                  </td>
                  <td
                    className={`border border-gray-300 p-2 cursor-pointer text-center transition-colors ${getStatusClass(
                      item.status
                    )}`}
                    onClick={() => startEditCell(i, "status")}
                  >
                    {editingCell?.row === i &&
                    editingCell?.field === "status" ? (
                      <input
                        autoFocus
                        value={item.status}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setLocalItems((prev) => {
                            const copy = [...prev];
                            copy[i] = { ...copy[i], status: newVal };
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
                      item.status || "-"
                    )}
                  </td>
                  <td
                    className="border border-gray-300 p-2 cursor-pointer text-center"
                    onClick={() => startEditCell(i, "date")}
                  >
                    {editingCell?.row === i && editingCell?.field === "date" ? (
                      <input
                        autoFocus
                        type="text" // Changed to text for simple Aug1 format
                        value={item.date}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setLocalItems((prev) => {
                            const copy = [...prev];
                            copy[i] = { ...copy[i], date: newVal };
                            return copy;
                          });
                        }}
                        onBlur={saveEditCell}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditCell();
                          if (e.key === "Escape") cancelEditCell();
                        }}
                        className="w-full px-2 py-1 rounded border border-gray-400 focus:outline-none"
                      />
                    ) : (
                      item.date || "-"
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-center"></td>{" "}
                  {/* Empty column for + in header */}
                </tr>
              ))}

              {addingItem ? (
                <tr>
                  <td colSpan={6} className="p-2">
                    <input
                      autoFocus
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onBlur={saveNewItem}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNewItem();
                        if (e.key === "Escape") setAddingItem(false);
                      }}
                      placeholder="Enter item name..."
                      className="w-full px-3 py-2 rounded-[8px] border border-gray-400 focus:outline-none"
                    />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-gray-300 p-2 text-black cursor-pointer font-normal text-center"
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
