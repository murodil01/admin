import { useState, useEffect } from "react";
import GroupSection from "../group-section";
import { CiExport } from "react-icons/ci";
import { BiArchiveIn } from "react-icons/bi";
import { ArrowRight, Trash2, Copy, Plus, X } from "lucide-react";
import {
  getGroups,
  // getGroupById,
  createGroup,
  // updateGroup,
  // deleteGroup,
} from "../../../api/services/groupService";

const STORAGE_KEY_GROUPS = "my-app-groups";
const STORAGE_KEY_EXPANDED = "my-app-groups-expanded";

const MainLead = () => {
  const [groups, setGroups] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [mainBoardId, setMainBoardId] = useState(null);

  // Backend'dan boards olish
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await getGroups();
        console.log("✅ Backend javobi:", res.data);

        if (res.data.length > 0) {
          setMainBoardId(res.data[0].id); // mavjud birinchi board ID ni saqlab qo'yamiz
        }

        const formatted = res.data.map((board) => ({
          id: board.id,
          title: board.name || "Untitled Group",
          items: [],
        }));

        setGroups(formatted);
      } catch (err) {
        console.error("❌ getGroups xatosi:", err);
        // Agar backend ishlamasa, localStorage’dan o‘qiymiz
        const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (saved) setGroups(JSON.parse(saved));
      }
    };

    fetchBoards();

    const savedExpanded = localStorage.getItem(STORAGE_KEY_EXPANDED);
    if (savedExpanded) setExpandedGroups(JSON.parse(savedExpanded));
  }, []);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Guruh qo‘shish
  const addGroup = async (title) => {
    const cleanName = String(title || "").trim();
    if (!cleanName) return;

    try {
      const res = await createGroup(cleanName, mainBoardId || null);

      console.log("✅ Yaratildi:", res.data);

      setGroups((prev) => [
        ...prev,
        { id: res.data.id, title: res.data.name, items: [] },
      ]);
    } catch (err) {
      console.error("❌ createGroup xatosi:", err.response?.data || err);

      setGroups((prev) => [
        ...prev,
        { id: Date.now(), title: cleanName, items: [] },
      ]);
    }

    setAddingGroup(false);
  };

  // Guruh o‘chirish
  const deleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      console.log(`✅ O'chirildi: ${groupId}`);
    } catch (err) {
      console.error("❌ deleteGroup xatosi:", err.response?.data || err);
    }

    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setExpandedGroups((prev) => {
      const copy = { ...prev };
      delete copy[groupId];
      return copy;
    });
    setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));
  };

  const updateGroupTitle = (id, newTitle) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, title: newTitle } : g))
    );
  };

  const addItemToGroup = (groupId, newItem) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, items: [...g.items, newItem] } : g
      )
    );
  };

  const updateItemInGroup = (groupId, itemIndex, newItem) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newItems = [...g.items];
          newItems[itemIndex] = newItem;
          return { ...g, items: newItems };
        }
        return g;
      })
    );
  };

  const deleteItemFromGroup = (groupId, itemIndex) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newItems = g.items.filter((_, idx) => idx !== itemIndex);
          return { ...g, items: newItems };
        }
        return g;
      })
    );
    setSelectedItems((prev) =>
      prev.filter((s) => !(s.groupId === groupId && s.itemIndex === itemIndex))
    );
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
    alert("Items exported to console.");
    setSelectedItems([]);
  };

  const handleArchiveSelected = () => {
    alert("Items archived.");
    setSelectedItems([]);
  };

  const handleMoveTo = () => {
    alert("Moved items.");
    setSelectedItems([]);
  };

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 rounded-b-[8px] relative overflow-x-auto">
      <div className="flex flex-col gap-6 w-full overflow-x-auto">
        {groups.length === 0 ? (
          <p className="text-center text-gray-500">📭 Hali boardlar yo'q</p>
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
              deleteGroup={deleteGroup}
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
        ) : (
          <button
            onClick={() => setAddingGroup(true)}
            className="mt-5 flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-[5px] text-[16px] rounded-[8px] font-medium transition-colors"
            aria-label="Add new group"
          >
            <Plus className="w-5 h-5" />
            Add new group
          </button>
        )}

      {selectedItems.length > 0 && (
        <div className="mt-5 max-w-[1000px] mx-auto bg-[#F2F2F2] p-4 flex flex-wrap items-center justify-center shadow-lg rounded-[8px]">
          <div className="flex flex-wrap items-center gap-4 font-medium text-[#313131] text-[14px] sm:text-[16px] justify-center w-full md:w-auto">
            <div className="flex items-center gap-2 sm:gap-4 text-black rounded-full px-2 sm:px-3 py-1 font-semibold">
              <span className="bg-[#0061FE] px-2 sm:px-[10px] py-[2px] text-[14px] sm:text-[16px] text-white rounded-full">
                {selectedItems.length}
              </span>
              Lead selected
            </div>

            <button
              onClick={handleDuplicateSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <Copy size={15} />
              <span className="text-xs sm:text-sm">Duplicate</span>
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

const AddGroupInput = ({ onSave, onCancel }) => {
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
      setValue("");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-max">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleSave}
        placeholder="Enter group title..."
        className="flex-grow px-4 py-2 rounded-[8px] border border-gray-400 focus:outline-none text-base"
      />
      <button
        onClick={onCancel}
        className="px-3 py-2 bg-gray-300 rounded-[8px] text-gray-700 font-semibold"
        aria-label="Cancel adding group"
      >
        <X size={20}/>
      </button>
    </div>
  );
};

export default MainLead;

