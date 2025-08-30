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
  const [tableSelectedRows, setTableSelectedRows] = useState([]);
  const [showTableView, setShowTableView] = useState(false);
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
        const res = await getGroups(boardId);

        const formatted = await Promise.all(
          res.data.map(async (group) => {
            try {
              const leadsRes = await getLeads(group.id);
              return {
                id: group.id,
                title: group.name || "Untitled Group",
                items: leadsRes.data || [],
              };
            } catch (err) {
              console.error("getLeads xatosi:", err);
              return {
                id: group.id,
                title: group.name || "Untitled Group",
                items: [],
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
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    const savedExpanded = localStorage.getItem(STORAGE_KEY_EXPANDED);
    if (savedExpanded) setExpandedGroups(JSON.parse(savedExpanded));
  }, [boardId]);

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
      toast.success("Guruh o'chirildi ✅");
      
      // Guruhni o'chirishdan oldin selection larni tozalash
      setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));
      
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
  };

  // Guruh nomini yangilash
  const updateGroupTitle = async (groupId, newTitle) => {
    const oldTitle = groups.find((g) => g.id === groupId)?.title;

    try {
      const res = await updateGroup(groupId, { name: newTitle }, boardId);
      const updatedTitle = res.data.name || newTitle;
      toast.success("Guruh nomi yangilandi ✅");

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: updatedTitle } : g))
      );
    } catch (err) {
      console.error("updateGroup xatosi:", err.response?.data || err);
      toast.error("Guruh nomini yangilashda xato ❌");

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: oldTitle } : g))
      );
    }
  };

  // Lead qo'shish
  const addItemToGroup = async (groupId, newItem) => {
    try {
      const res = await createLeads({ ...newItem, group: groupId });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, items: [...g.items, res.data] } : g
        )
      );
      toast.success("Lead qo'shildi ✅");
    } catch (err) {
      console.error("createLeads xatosi:", err);
      toast.error("Lead qo'shishda xato ❌");
    }
  };

  // Lead yangilash
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
    const realGroupId = oldItem.group;

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

      toast.success("Lead yangilandi ✅");
    } catch (err) {
      console.error("updateLeads xatosi:", err.response?.data || err);
      toast.error("Lead yangilashda xato ❌");
    }
  };

  // Lead o'chirish
  const deleteItemFromGroup = async (groupId, itemIndex) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const item = group.items[itemIndex];
    if (!item) return;

    try {
      await deleteLeads(item.group, item.id);
      
      // Selection dan ham o'chirish
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );
      
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.filter((_, idx) => idx !== itemIndex) }
            : g
        )
      );
      
      toast.success("Lead o'chirildi ✅");
    } catch (err) {
      console.error("deleteLeads xatosi:", err);
      toast.error("Lead o'chirilmadi ❌");
    }
  };

  // Guruhni yoyish/yig'ish
  const toggleExpanded = (groupId) => {
    const newExpanded = {
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId],
    };
    setExpandedGroups(newExpanded);
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(newExpanded));
  };

  // Item tanlash/bekor qilish
  const toggleSelectItem = (groupId, itemIndex, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => {
        // Agar allaqachon mavjud bo'lsa, takrorlamaymiz
        const exists = prev.some(s => s.groupId === groupId && s.itemIndex === itemIndex);
        if (exists) return prev;
        return [...prev, { groupId, itemIndex }];
      });
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );
    }
  };

  // Tanlangan itemlarni o'chirish
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(`${selectedItems.length} ta lead o'chirilsinmi?`);
    if (!confirmDelete) return;

    // Har bir tanlangan itemni o'chirish
    for (const { groupId, itemIndex } of selectedItems) {
      await deleteItemFromGroup(groupId, itemIndex);
    }
    
    setSelectedItems([]);
    toast.success(`${selectedItems.length} ta lead o'chirildi ✅`);
  };

  // Tanlangan itemlarni nusxalash
  const handleDuplicateSelected = async () => {
    if (selectedItems.length === 0) return;

    for (const { groupId, itemIndex } of selectedItems) {
      const group = groups.find((g) => g.id === groupId);
      if (group && group.items[itemIndex]) {
        const item = group.items[itemIndex];
        await addItemToGroup(groupId, { 
          ...item, 
          name: `${item.name} (copy)`,
          id: undefined // ID ni o'chiramiz, yangi yaratilishi uchun
        });
      }
    }
    
    setSelectedItems([]);
    toast.success(`${selectedItems.length} ta lead nusxalandi ✅`);
  };

  // Tanlangan itemlarni export qilish
  const handleExportSelected = () => {
    if (selectedItems.length === 0) return;

    const data = selectedItems
      .map(({ groupId, itemIndex }) => {
        const group = groups.find((g) => g.id === groupId);
        return group && group.items[itemIndex] ? group.items[itemIndex] : null;
      })
      .filter(Boolean);

    // JSON formatda export qilish
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-leads-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSelectedItems([]);
    toast.success(`${data.length} ta lead export qilindi ✅`);
  };

  // Tanlangan itemlarni arxivlash
  const handleArchiveSelected = () => {
    if (selectedItems.length === 0) return;
    
    // Bu yerda arxivlash logikasini yozasiz
    console.log("Arxivlash uchun:", selectedItems);
    toast.success(`${selectedItems.length} ta lead arxivlandi ✅`);
    setSelectedItems([]);
  };

  // Tanlangan itemlarni ko'chirish
  const handleMoveTo = () => {
    if (selectedItems.length === 0) return;
    
    // Bu yerda ko'chirish logikasini yozasiz (modal oynasi bilan)
    console.log("Ko'chirish uchun:", selectedItems);
    toast.success(`${selectedItems.length} ta lead ko'chirildi ✅`);
    setSelectedItems([]);
  };

  // Barcha itemlarni tanlash/bekor qilish
  const handleSelectAll = () => {
    const allItems = [];
    groups.forEach(group => {
      group.items.forEach((_, itemIndex) => {
        allItems.push({ groupId: group.id, itemIndex });
      });
    });

    if (selectedItems.length === allItems.length) {
      // Agar barcha tanlangan bo'lsa, hammasi ni bekor qilish
      setSelectedItems([]);
    } else {
      // Barcha itemlarni tanlash
      setSelectedItems(allItems);
    }
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

  // Jami itemlar soni
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="bg-gray-50 py-2 px-4 sm:px-6 lg:px-8 rounded-b-[8px] overflow-x">
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
              Cancel
            </button>
          </div>
        </div>
      )}

   
      <div className="flex flex-col gap-6 overflow-x w-full">
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
              items={group.items}
              title={group.title}
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
              onToggleSelect={toggleSelectItem}
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
          className="mt-5 flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-[6px] text-[16px] rounded-[8px] font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Add new group
        </button>
      ) : null}

      {/* Selected Items Actions Panel */}
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