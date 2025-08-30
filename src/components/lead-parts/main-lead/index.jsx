import { useState, useEffect, useRef } from "react";
import GroupSection from "../group-section";
import { CiExport } from "react-icons/ci";
import { BiArchiveIn } from "react-icons/bi";
import { ArrowRight, Trash2, Copy, Plus, X, Edit, ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
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
  const [groupMenuOpen, setGroupMenuOpen] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);

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
        console.log("getGroups response:", res);

        const formatted = await Promise.all(
          res.data.map(async (group) => {
            try {
              const leadsRes = await getLeads(group.id);
              return {
                id: group.id,
                title: String(group.name || "Untitled Group"),
                items: Array.isArray(leadsRes.data) ? leadsRes.data : [],
              };
            } catch (err) {
              console.error("getLeads xatosi:", err);
              return {
                id: group.id,
                title: String(group.name || "Untitled Group"),
                items: [],
              };
            }
          })
        );

        console.log("Formatted groups:", formatted);
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

  // Guruh qo'shish - har safar yangi ID bilan
  const addGroup = async (title) => {
    const cleanName = String(title || "").trim();
    if (!cleanName || !boardId) {
      toast.error("Board mavjud emas. Iltimos, board yaratib oling.");
      setAddingGroup(false);
      return;
    }

    try {
      // Yangi guruh yaratish
      const res = await createGroup(cleanName, boardId);
      
      // Response ni tekshirish
      console.log("createGroup response:", res);
      
      // Yangi guruhni qo'shish
      const newGroup = { 
        id: res.data?.id || res.id || Date.now(), // Fallback ID
        title: res.data?.name || res.name || cleanName, 
        items: [] 
      };
      
      console.log("New group object:", newGroup);
      
      setGroups((prev) => [...prev, newGroup]);
      
      // Yangi guruhni avtomatik ochiq holatga o'tkazish
      setExpandedGroups(prev => ({
        ...prev,
        [newGroup.id]: true
      }));
      
      toast.success("Guruh yaratildi ✅");
    } catch (err) {
      console.error("createGroup xatosi:", err.response?.data || err);
      toast.error("Guruh yaratishda xatolik ❌");
      if (err.response?.status === 400 && err.response?.data?.board) {
        setShowBoardSelector(true);
      }
    }

    setAddingGroup(false);
  };

  // Guruh o'chirish
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm("Bu guruhni o'chirishni xohlaysizmi? Barcha leadlar ham o'chadi!");
    if (!confirmDelete) return;

    try {
      await deleteGroup(groupId, boardId);
      
      // Guruhni o'chirishdan oldin selection larni tozalash
      setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));
      
      // Guruhni state dan o'chirish
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      
      // Expanded state ni tozalash
      setExpandedGroups((prev) => {
        const copy = { ...prev };
        delete copy[groupId];
        localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(copy));
        return copy;
      });
      
      // Menu ni yopish
      setGroupMenuOpen(prev => ({ ...prev, [groupId]: false }));
      
      toast.success("Guruh o'chirildi ✅");
    } catch (err) {
      console.error("deleteGroup xatosi:", err.response?.data || err);
      toast.error("Guruh o'chirilmadi ❌");
    }
  };

  // Guruh nomini yangilash
  const updateGroupTitle = async (groupId, newTitle) => {
    const cleanTitle = String(newTitle || "").trim();
    if (!cleanTitle) {
      toast.error("Guruh nomi bo'sh bo'lishi mumkin emas");
      return;
    }

    const oldTitle = groups.find((g) => g.id === groupId)?.title;

    // Optimistic update
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title: cleanTitle } : g))
    );

    try {
      const res = await updateGroup(groupId, { name: cleanTitle }, boardId);
      const updatedTitle = res.data.name || cleanTitle;
      
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: updatedTitle } : g))
      );
      
      toast.success("Guruh nomi yangilandi ✅");
    } catch (err) {
      console.error("updateGroup xatosi:", err.response?.data || err);
      toast.error("Guruh nomini yangilashda xato ❌");

      // Revert changes on error
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

  // Group menu toggle
  const toggleGroupMenu = (groupId) => {
    setGroupMenuOpen(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Edit group name
  const startEditingGroup = (groupId) => {
    setEditingGroup(groupId);
    setGroupMenuOpen(prev => ({ ...prev, [groupId]: false }));
  };

  const saveGroupEdit = (groupId, newTitle) => {
    updateGroupTitle(groupId, newTitle);
    setEditingGroup(null);
  };

  const cancelGroupEdit = () => {
    setEditingGroup(null);
  };

  // Item tanlash/bekor qilish
  const toggleSelectItem = (groupId, itemIndex, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => {
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

    for (const { groupId, itemIndex } of selectedItems) {
      await deleteItemFromGroup(groupId, itemIndex);
    }
    
    setSelectedItems([]);
    toast.success(`${selectedItems.length} ta lead o'chirildi ✅`);
  };

  // Click outside handler for group menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.group-menu-container')) {
        setGroupMenuOpen({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          groups.map((group) => {
            // Group object ni validate qilish
            if (!group || typeof group !== 'object') {
              console.error("Invalid group object:", group);
              return null;
            }

            const groupId = group.id;
            const groupTitle = String(group.title || "Untitled Group");
            const groupItems = Array.isArray(group.items) ? group.items : [];

            return (
              <div key={groupId} className="bg-white rounded-lg shadow-sm border">
                {/* Group Header/Navbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleExpanded(groupId)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedGroups[groupId] ? 
                        <ChevronDown className="w-4 h-4 text-gray-600" /> : 
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      }
                    </button>
                    
                    {editingGroup === groupId ? (
                      <GroupEditInput
                        initialValue={groupTitle}
                        onSave={(newTitle) => saveGroupEdit(groupId, newTitle)}
                        onCancel={cancelGroupEdit}
                      />
                    ) : (
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {groupTitle}
                      </h3>
                    )}
                    
                    <span className="text-sm text-gray-500 ml-2">
                      ({groupItems.length} items)
                    </span>
                  </div>

                  <div className="relative group-menu-container">
                    <button
                      onClick={() => toggleGroupMenu(groupId)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {groupMenuOpen[groupId] && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => startEditingGroup(groupId)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(groupId)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Content */}
                {expandedGroups[groupId] && (
                  <div className="p-4">
                    <GroupSection
                      id={groupId}
                      items={groupItems}
                      title={groupTitle}
                      expanded={true}
                      onToggleExpanded={() => {}}
                      updateTitle={() => {}}
                      addItem={addItemToGroup}
                      updateItem={updateItemInGroup}
                      deleteItem={deleteItemFromGroup}
                      deleteGroup={() => {}}
                      selected={selectedItems
                        .filter((s) => s.groupId === groupId)
                        .map((s) => s.itemIndex)}
                      onToggleSelect={toggleSelectItem}
                    />
                  </div>
                )}
              </div>
            );
          }).filter(Boolean)
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

// Group Edit Input komponenti
const GroupEditInput = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") onCancel();
      }}
      onBlur={handleSave}
      className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold bg-white"
    />
  );
};

export default MainLead;