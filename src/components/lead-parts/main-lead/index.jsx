import { useState, useEffect, useRef } from "react";
import GroupSection from "../group-section";
import { CiExport } from "react-icons/ci";
import { BiArchiveIn } from "react-icons/bi";
import { ArrowRight, Trash2, Copy, Plus, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  getGroups,
  createGroup,
  deleteGroup,
  updateGroup,
} from "../../../api/services/groupService";
import { getBoards } from "../../../api/services/boardService";

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

  // BoardId bo'yicha guruhlarni yuklash
  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await getGroups(boardId); // boardId bilan
        const formatted = res.data.map((group) => ({
          id: group.id,
          title: group.name || "Untitled Group",
          items: [],
        }));

        setGroups(formatted);

        if (!toastShownRef.current && formatted.length > 0) {
          toast.success("Guruhlar yuklandi ✅");
          toastShownRef.current = true;
        }
      } catch (err) {
        console.error("getGroups xatosi:", err);
        toast.error("Guruhlarni yuklashda xato ❌");
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
      await deleteGroup(groupId, boardId); // boardId bilan
      toast.success("Guruh o'chirildi ✅");
    } catch (err) {
      console.error("deleteGroup xatosi:", err.response?.data || err);
      toast.error("Guruh o'chirilmadi ❌");
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setExpandedGroups((prev) => {
      const copy = { ...prev };
      delete copy[groupId];
      return copy;
    });
    setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));
  };

  // Guruh nomini update qilish
  const updateGroupTitle = async (id, newTitle) => {
    const oldTitle = groups.find((g) => g.id === id)?.title;

    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, title: newTitle } : g))
    );

    try {
      await updateGroup(id, { name: newTitle }, boardId); // boardId bilan
      toast.success("Guruh nomi yangilandi ✅");
    } catch (err) {
      console.error("updateGroup xatosi:", err.response?.data || err);
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, title: oldTitle } : g))
      );
      toast.error("Guruh nomini yangilashda xato ❌");
    }
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
    toast.success("Items exported to console ✅");
    setSelectedItems([]);
  };

  const handleArchiveSelected = () => {
    toast.success("Items archived ✅");
    setSelectedItems([]);
  };

  const handleMoveTo = () => {
    toast.success("Moved items ✅");
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
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 rounded-b-[8px] relative overflow-x-auto">
      <Toaster position="top-right" />

      {showBoardSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Board tanlang</h3>
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
              className="mt-4 bg-gray-300 px-4 py-2 rounded-md w-full"
              onClick={() => setShowBoardSelector(false)}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 w-full overflow-x-auto">
        {groups.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-lg mb-4">📭 Hali guruhlar yo'q</p>
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-2 text-base rounded-lg font-medium transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" /> Guruh qo'shish
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
          className="mt-5 flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-[5px] text-[16px] rounded-[8px] font-medium transition-colors mx-auto"
        >
          <Plus className="w-5 h-5" /> Yangi guruh qo'shish
        </button>
      ) : null}

      {selectedItems.length > 0 && (
        <div className="mt-5 max-w-[1000px] mx-auto bg-[#F2F2F2] p-4 flex flex-wrap items-center justify-center shadow-lg rounded-[8px]">
          <div className="flex flex-wrap items-center gap-4 font-medium text-[#313131] text-[14px] sm:text-[16px] justify-center w-full md:w-auto">
            <div className="flex items-center gap-2 sm:gap-4 text-black rounded-full px-2 sm:px-3 py-1 font-semibold">
              <span className="bg-[#0061FE] px-2 sm:px-[10px] py-[2px] text-[14px] sm:text-[16px] text-white rounded-full">
                {selectedItems.length}
              </span>
              Tanlangan leadlar
            </div>

            <button
              onClick={handleDuplicateSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <Copy size={15} />
              <span className="text-xs sm:text-sm">Nusxalash</span>
            </button>

            <button
              onClick={handleExportSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <CiExport size={15} />
              <span className="text-xs sm:text-sm">Eksport</span>
            </button>

            <button
              onClick={handleArchiveSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <BiArchiveIn size={15} />
              <span className="text-xs sm:text-sm">Arxivlash</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <Trash2 size={15} />
              <span className="text-xs sm:text-sm">O'chirish</span>
            </button>

            <button
              onClick={handleMoveTo}
              className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]"
            >
              <ArrowRight size={15} />
              <span className="text-xs sm:text-sm">Ko'chirish</span>
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
    <div className="flex gap-3 max-w-max mt-4 mx-auto">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleSave}
        placeholder="Guruh nomini kiriting..."
        className="flex-grow px-4 py-2 rounded-[8px] border border-gray-400 focus:outline-none text-base w-64"
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


