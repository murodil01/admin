import { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { updateGroup } from "../../../api/services/groupService";
import TableBox from "./Table";

const GroupSection = ({
  id,
  title,
  items,
  expanded,
  onToggleExpanded,
  updateTitle,
  deleteGroup,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [localItems, setLocalItems] = useState((items || []).filter(Boolean));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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
