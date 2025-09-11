import { useState, useEffect, useRef } from "react";
// import GroupSection from "../group-section";
import GroupSection from "../group-section/GroupSection.jsx";
import { BiArchiveIn } from "react-icons/bi";
import {
  Trash2,
  Copy,
  Plus,
  X,
  Edit,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Move,
  UploadIcon,
  Search,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getBoards, exportExcelFile } from "../../../api/services/boardService";
import {
  getGroups,
  createGroup,
  deleteGroup,
  updateGroup,
} from "../../../api/services/groupService";
import {
  getLeads,
  createLeads,
  updateLeads,
  deleteLeads,
  moveLeadsToGroup,
} from "../../../api/services/leadsService";
import FilterPanel from "../filters/FilterPanel.jsx";

const MainLead = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Barcha leadlar
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [availableBoards, setAvailableBoards] = useState([]);
  const [groupMenuOpen, setGroupMenuOpen] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
// YANGI: Filter states
const [searchQuery, setSearchQuery] = useState('');
const [filterBy, setFilterBy] = useState({
  status: null,
  owner: null,
  source: null,
  dateRange: null
});
const [showFilterPanel, setShowFilterPanel] = useState(false);

// YANGI: Filtered leads funksiyasi
const getFilteredLeads = (groupId) => {
  let leads = allLeads.filter(lead => lead.group === groupId);
  
  // Search bo'yicha filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    leads = leads.filter(lead => 
      (lead.name && lead.name.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query)) ||
      (lead.notes && lead.notes.toLowerCase().includes(query))
    );
  }

  // Status bo'yicha filter
  if (filterBy.status) {
    leads = leads.filter(lead => lead.status?.id === filterBy.status);
  }

  // Owner bo'yicha filter
  if (filterBy.owner) {
    leads = leads.filter(lead => lead.person_detail?.id === filterBy.owner);
  }

  // Source bo'yicha filter
  if (filterBy.source) {
    leads = leads.filter(lead => lead.link === filterBy.source);
  }

  // Date range bo'yicha filter
  if (filterBy.dateRange?.start || filterBy.dateRange?.end) {
    leads = leads.filter(lead => {
      if (!lead.timeline_start) return false;
      const leadDate = new Date(lead.timeline_start);
      
      if (filterBy.dateRange.start && leadDate < new Date(filterBy.dateRange.start)) {
        return false;
      }
      if (filterBy.dateRange.end && leadDate > new Date(filterBy.dateRange.end)) {
        return false;
      }
      return true;
    });
  }

  return leads;
};

// Filter reset funksiyasi
const resetFilters = () => {
  setSearchQuery('');
  setFilterBy({
    status: null,
    owner: null,
    source: null,
    dateRange: null
  });
};

// YANGI: Filter count hisoblovchi funksiya
const getActiveFiltersCount = () => {
  let count = 0;
  if (searchQuery.trim()) count++;
  if (filterBy.status) count++;
  if (filterBy.owner) count++;
  if (filterBy.source) count++;
  if (filterBy.dateRange?.start || filterBy.dateRange?.end) count++;
  return count;
};

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

  // Groups va Leads ni alohida yuklash
  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    const fetchGroupsAndLeads = async () => {
      setLoading(true);
      try {
        // 1. Avval grouplarni olish
        const groupsRes = await getGroups(boardId);

        // 2. Keyin barcha leadlarni olish
        const leadsRes = await getLeads();

        console.log("Groups response:", groupsRes.data);
        console.log("Leads response:", leadsRes.data);

        // Groups ni format qilish
        const formattedGroups = groupsRes.data
          .filter((group) => group.board === boardId)
          .map((group) => ({
            id: group.id,
            title: group.name || "Untitled Group",
            boardId: group.board,
          }));

        setGroups(formattedGroups);
        setAllLeads(leadsRes.data || []);

        // Birinchi guruhni avtomatik ochish
        if (formattedGroups.length > 0) {
          setExpandedGroups({ [formattedGroups[0].id]: true });
        }
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xato:", err);
        toast.error("Ma'lumotlarni yuklashda xato");
        setGroups([]);
        setAllLeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupsAndLeads();
  }, [boardId]);

  // Guruh uchun tegishli leadlarni olish funksiyasi
  const getLeadsForGroup = (groupId) => {
    return allLeads.filter((lead) => lead.group === groupId);
  };

  // Guruh qo'shish
  const addGroup = async (title) => {
    const cleanName = String(title || "").trim();
    if (!cleanName || !boardId) {
      toast.error("Board mavjud emas. Iltimos, board yaratib oling.");
      setAddingGroup(false);
      return;
    }

    try {
      console.log("Creating group:", cleanName, "for board:", boardId);
      const res = await createGroup(cleanName, boardId);
      setGroups((prev) => [
        ...prev,
        {
          id: res.data.id,
          title: res.data.name,
          boardId: boardId,
        },
      ]);
      toast.success("Guruh yaratildi");
    } catch (err) {
      console.error("createGroup xatosi:", err.response?.data || err);
      toast.error("Guruh yaratishda xatolik");
    }

    setAddingGroup(false);
  };

  // Guruh o'chirish
  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Bu guruhni o'chirishni xohlaysizmi? Barcha leadlar ham o'chadi!"
    );
    if (!confirmDelete) return;

    try {
      await deleteGroup(groupId, boardId);

      // Guruhni state dan o'chirish
      setGroups((prev) => prev.filter((g) => g.id !== groupId));

      // Guruhga tegishli leadlarni olib tashlash
      setAllLeads((prev) => prev.filter((lead) => lead.group !== groupId));

      // Expanded state ni tozalash
      setExpandedGroups((prev) => {
        const copy = { ...prev };
        delete copy[groupId];
        return copy;
      });

      // Selection larni tozalash
      setSelectedItems((prev) => prev.filter((s) => s.groupId !== groupId));

      // Menu ni yopish
      setGroupMenuOpen((prev) => ({ ...prev, [groupId]: false }));

      toast.success("Guruh o'chirildi");
    } catch (err) {
      console.error("deleteGroup xatosi:", err.response?.data || err);
      toast.error("Guruh o'chirilmadi");
    }
  };

  // Leadlarni boshqa groupga ko'chirish
  const handleMoveSelected = async (targetGroupId) => {
    if (selectedItems.length === 0) {
      toast.error("Hech qanday element tanlanmagan");
      return;
    }

    setIsMoving(true);

    try {
      // Tanlangan itemlardan lead ID larini olish
      const leadIds = [];

      selectedItems.forEach(({ groupId, itemIndex }) => {
        const groupLeads = getLeadsForGroup(groupId);
        const lead = groupLeads[itemIndex];
        if (lead && lead.id) {
          leadIds.push(lead.id);
        }
      });

      if (leadIds.length === 0) {
        toast.error("Ko'chirilishi mumkin bo'lgan elementlar topilmadi");
        return;
      }

      // Backend ga so'rov yuborish
      const result = await moveLeadsToGroup(targetGroupId, leadIds);

      // Muvaffaqiyat xabari
      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success(`${leadIds.length} ta lead muvaffaqiyatli ko'chirildi`);
      }

      // Ma'lumotlarni qayta yuklash
      window.location.reload(); // yoki state ni yangilash

      // Selection ni tozalash
      setSelectedItems([]);
      setShowMoveDropdown(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Leadlarni ko'chirishda xatolik yuz berdi";

      toast.error(errorMessage);
      console.error("Move error:", error);
    } finally {
      setIsMoving(false);
    }
  };

  // Guruh nomini yangilash
  const updateGroupTitle = async (groupId, newTitle) => {
    const cleanTitle = String(newTitle || "").trim();
    if (!cleanTitle) {
      toast.error("Guruh nomi bo'sh bo'lishi mumkin emas");
      return;
    }

    // Optimistic update
    const oldTitle = groups.find((g) => g.id === groupId)?.title;

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title: newTitle } : g))
    );

    try {
      await updateGroup(groupId, { name: newTitle }, boardId);
      toast.success("Guruh nomi yangilandi");
    } catch (err) {
      console.error("updateGroup xatosi:", err.response?.data || err);
      toast.error("Guruh nomini yangilashda xato");

      // Rollback qilish
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, title: oldTitle } : g))
      );
    }
  };

  // Lead qo'shish - optimallashtirilgan
  const addItemToGroup = async (groupId, newItem) => {
    try {
      console.log("Adding new lead to group:", groupId, newItem);
      const res = await createLeads({ ...newItem, group: groupId });

      // AllLeads ga qo'shish
      setAllLeads((prev) => [...prev, res.data]);

      toast.success("Lead qo'shildi");

      // Response qaytarish (GroupSection uchun)
      return res;
    } catch (err) {
      console.error("createLeads xatosi:", err);
      toast.error("Lead qo'shishda xato");
      throw err;
    }
  };

  // Lead yangilash
  // ✅ updateItemInGroup - real-time state sync
  const updateItemInGroup = async (groupId, itemIndex, updatedItem) => {
    const groupLeads = getLeadsForGroup(groupId);
    const oldItem = groupLeads[itemIndex];

    if (!oldItem) {
      toast.error("Lead topilmadi!");
      return;
    }

    const leadId = oldItem.id;

    // ✅ DARHOL allLeads state ni yangilash (optimistic update)
    setAllLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          const updatedLead = { ...lead, ...updatedItem };
          console.log(
            "🔄 MainLead updating lead:",
            leadId,
            updatedItem,
            "Result:",
            updatedLead
          );
          return updatedLead;
        }
        return lead;
      })
    );

    // ✅ Backend ga saqlash faqat kerakli fieldlar uchun
    try {
      console.log(
        "📤 MainLead sending update to backend:",
        leadId,
        updatedItem
      );

      const updatePayload = {};

      // Har bir fieldni alohida tekshirish va format qilish
      Object.keys(updatedItem).forEach((key) => {
        if (key === "status" && updatedItem[key] !== undefined) {
          // Status uchun - agar object bo'lsa ID ni olish
          if (updatedItem[key] === null) {
            updatePayload.status = null;
          } else if (
            typeof updatedItem[key] === "object" &&
            updatedItem[key].id
          ) {
            updatePayload.status = updatedItem[key].id;
          } else {
            updatePayload.status = updatedItem[key];
          }
        } else if (key === "person_detail" && updatedItem[key] !== undefined) {
          // Person detail uchun - faqat ID yuborish
          if (updatedItem[key] === null) {
            updatePayload.person = null;
          } else if (
            typeof updatedItem[key] === "object" &&
            updatedItem[key].id
          ) {
            updatePayload.person = updatedItem[key].id;
          } else {
            updatePayload.person = updatedItem[key];
          }
        } else if (
          [
            "timeline_start",
            "timeline_end",
            "name",
            "phone",
            "link",
            "notes",
            "potential_value",
          ].includes(key)
        ) {
          // Boshqa fieldlar uchun to'g'ridan-to'g'ri yuborish
          updatePayload[key] = updatedItem[key];
        }
      });

      console.log("📋 Final backend payload:", updatePayload);

      // Backend ga so'rov yuborish (GroupSection allaqachon yuborib bo'lgani uchun bu ikki marta bo'ladi - bu normal)
      const res = await updateLeads(leadId, updatePayload);

      console.log("✅ MainLead backend update successful:", res);

      // Server javobini yangilash
      setAllLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, ...res } : lead))
      );
    } catch (err) {
      console.error(
        "❌ MainLead backend update failed:",
        err.response?.data || err
      );
      toast.error("Lead yangilashda xato");

      // ✅ ROLLBACK - xatolik bo'lsa eski holatga qaytarish
      setAllLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? oldItem : lead))
      );
    }
  };

  // Lead o'chirish
  const deleteItemFromGroup = async (groupId, itemIndex) => {
    const groupLeads = getLeadsForGroup(groupId);
    const item = groupLeads[itemIndex];

    if (!item) return;

    try {
      await deleteLeads(item.group, item.id);

      // AllLeads dan o'chirish
      setAllLeads((prev) => prev.filter((lead) => lead.id !== item.id));

      // Selection dan o'chirish
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );

      toast.success("Lead o'chirildi");
    } catch (err) {
      console.error("deleteLeads xatosi:", err);
      toast.error("Lead o'chirilmadi");
    }
  };

  // Guruhni yoyish/yig'ish
  const toggleExpanded = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Group menu toggle
  const toggleGroupMenu = (groupId) => {
    setGroupMenuOpen((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Edit group name
  const startEditingGroup = (groupId) => {
    setEditingGroup(groupId);
    setGroupMenuOpen((prev) => ({ ...prev, [groupId]: false }));
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
      setSelectedItems((prev) => [...prev, { groupId, itemIndex }]);
    } else {
      setSelectedItems((prev) =>
        prev.filter(
          (s) => !(s.groupId === groupId && s.itemIndex === itemIndex)
        )
      );
    }
  };

  // Tanlangan itemlarni o'chirish
  const handleDeleteSelected = () => {
    selectedItems.forEach(({ groupId, itemIndex }) =>
      deleteItemFromGroup(groupId, itemIndex)
    );
    setSelectedItems([]);
  };

  const handleDuplicateSelected = () => {
    selectedItems.forEach(({ groupId, itemIndex }) => {
      const groupLeads = getLeadsForGroup(groupId);
      const item = groupLeads[itemIndex];
      if (item) {
        addItemToGroup(groupId, { ...item, name: `${item.name} copy` });
      }
    });
    setSelectedItems([]);
  };

  //  handleExportSelected funksiyasi tanlangan leads ni export qilish uchun

  const handleExportSelected = async () => {
    if (selectedItems.length === 0) {
      toast.error("Hech qanday element tanlanmagan");
      return;
    }

    try {
      // Loading toast ko'rsatish
      toast.loading("Excel fayl tayyorlanmoqda...", { id: "export-loading" });

      // Tanlangan itemlarni group bo'yicha guruhlash
      const groupedSelections = {};

      selectedItems.forEach(({ groupId, itemIndex }) => {
        if (!groupedSelections[groupId]) {
          groupedSelections[groupId] = [];
        }

        const groupLeads = getLeadsForGroup(groupId);
        const lead = groupLeads[itemIndex];
        if (lead && lead.id) {
          groupedSelections[groupId].push(lead.id);
        }
      });

      // Har bir group uchun export qilish
      const exportPromises = Object.entries(groupedSelections).map(
        async ([groupId, leadIds]) => {
          if (leadIds.length === 0) return null;

          return await exportExcelFile(boardId, groupId, leadIds);
        }
      );

      const responses = await Promise.all(exportPromises);

      // Fayllarni download qilish
      responses.forEach((response, index) => {
        if (!response) return;

        const groupId = Object.keys(groupedSelections)[index];
        const groupName =
          groups.find((g) => g.id == groupId)?.title || `Group_${groupId}`;

        // Blob dan fayl yaratish
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Fayl nomini yaratish
        const fileName = `${groupName}_leads_export_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;

        // Faylni download qilish
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      toast.dismiss("export-loading");
      toast.success(
        `${selectedItems.length} ta element Excel faylga export qilindi`
      );

      // Selectionni tozalash
      setSelectedItems([]);
    } catch (error) {
      toast.dismiss("export-loading");

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Excel export qilishda xatolik yuz berdi";

      toast.error(errorMessage);

      console.error("Export error:", error);
    }
  };

  const handleArchiveSelected = () => {
    toast.success("Items archived");
    setSelectedItems([]);
  };

 // Click outside handler for group menus and move dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    // Group menu uchun
    if (!event.target.closest(".group-menu-container")) {
      setGroupMenuOpen({});
    }
    
    // Move dropdown uchun
    if (showMoveDropdown && !event.target.closest(".move-dropdown-container")) {
      setShowMoveDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showMoveDropdown]); // showMoveDropdown ni dependency ga qo'shing

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
         {/* YANGI: Filter Panel */}
         {showFilterPanel && (
        <FilterPanel 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          onClose={() => setShowFilterPanel(false)}
          onReset={resetFilters}
          boardId={boardId}
          allLeads={allLeads}
        />
      )}

      {/* Active filters indicator */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {getActiveFiltersCount()} filter(s) active
          </span>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Board selector modal */}
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

      <div className="flex flex-col gap-4 overflow-x w-full">
        {groups.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500 text-lg mb-4">Hali guruhlar yo'q</p>
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-2 text-base rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" /> Add new group
            </button>
          </div>
        ) : (
          groups
          .map((group) => {
            const groupId = group.id; // BU QATORNI QOSHISH KERAK
            const groupTitle = String(group.title || "Untitled Group"); // BU HAM
            
            const groupLeads = getFilteredLeads(groupId);
              
              // Agar filter natijasida lead yo'q bo'lsa, guruhni yashirish
              if (groupLeads.length === 0 && getActiveFiltersCount() > 0) {
                return null;
              }

              return (
                <div key={group.id} className="bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => toggleExpanded(groupId)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedGroups[groupId] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </button>

                      {editingGroup === groupId ? (
                        <GroupEditInput
                          initialValue={groupTitle}
                          onSave={(newTitle) =>
                            saveGroupEdit(groupId, newTitle)
                          }
                          onCancel={cancelGroupEdit}
                        />
                      ) : (
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {groupTitle}
                        </h3>
                      )}

                      <span className="text-sm text-gray-500 ml-2">
                        ({groupLeads.length} items)
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
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-60 min-w-[120px]">
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

                  {expandedGroups[group.id] && (
                    <div className="p-4">
                      <GroupSection
                        key={`group-${group.id}-${groupLeads.length}`}
                        id={group.id}
                        items={groupLeads}
                        title={group.title}
                        expanded={true}
                        onToggleExpanded={() => {}}
                        updateTitle={updateGroupTitle}
                        addItem={addItemToGroup}
                        updateItem={updateItemInGroup}
                        deleteItem={deleteItemFromGroup}
                        deleteGroup={handleDeleteGroup}
                        boardId={boardId}
                        selected={selectedItems
                          .filter((s) => s.groupId === groupId)
                          .map((s) => s.itemIndex)}
                        onToggleSelect={(itemIndex, isSelected) =>
                          toggleSelectItem(groupId, itemIndex, isSelected)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })
            .filter(Boolean)
        )}
      </div>


        {/* Search va filter tugmasi uchun floating button */}
        <button
        onClick={() => setShowFilterPanel(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-30"
      >
        <Search size={20} />
        {getActiveFiltersCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* Add Group Input */}
      {addingGroup ? (
        <AddGroupInput
          onSave={addGroup}
          onCancel={() => setAddingGroup(false)}
        />
      ) : groups.length > 0 ? (
        <button
          onClick={() => setAddingGroup(true)}
          className="my-5  flex items-center justify-center gap-2 bg-[#7D8592] hover:bg-gray-600 text-white px-5 py-[6px] text-[16px] rounded-[8px] font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Add new group
        </button>
      ) : null}

      {/* Selected Items Actions Panel */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 max-w-[95vw]">
          <div className="bg-white border border-gray-200 shadow-2xl p-4 flex flex-wrap items-center justify-center rounded-lg">
            <div className="flex flex-wrap items-center gap-4 font-medium text-[#313131] text-[14px] sm:text-[16px] justify-center w-full md:w-auto">
              <div className="flex items-center gap-2 sm:gap-4 text-black rounded-full px-2 sm:px-3 py-1 font-semibold">
                <span className="bg-[#0061FE] px-2 sm:px-[10px] py-[2px] text-[14px] sm:text-[16px] text-white rounded-full">
                  {selectedItems.length}
                </span>
                Selected leads
              </div>

              <button
                onClick={handleDuplicateSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Copy selected items"
              >
                <Copy size={16} />
                <span className="text-xs sm:text-sm">Copy</span>
              </button>

              <button
                onClick={handleExportSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Export selected items"
              >
                <UploadIcon size={16} />
                <span className="text-xs sm:text-sm">Export</span>
              </button>

              <div className="relative move-dropdown-container">
                <button
                  onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                  className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                  title="Move selected items to another group"
                  disabled={isMoving}
                >
                  <Move size={16} />
                  <span className="text-xs sm:text-sm">
                    {isMoving ? "Moving..." : "Move To"}
                  </span>
                </button>

                {/* Move Dropdown */}
                {showMoveDropdown && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[180px] max-h-60 overflow-y-auto">
                    <div className="p-2 text-sm font-medium text-gray-700 border-b">
                      Select destination group:
                    </div>

                    {groups
                      .filter((group) => {
                        // Faqat boshqa grouplarni ko'rsatish (hozirgi group tanlangan bo'lsa)
                        const currentGroupIds = selectedItems.map(
                          (item) => item.groupId
                        );
                        return !currentGroupIds.includes(group.id);
                      })
                      .map((group) => (
                        <button
                          key={group.id}
                          onClick={() => handleMoveSelected(group.id)}
                          disabled={isMoving}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-medium">{group.title}</div>
                          <div className="text-xs text-gray-500">
                            {getLeadsForGroup(group.id).length} leads
                          </div>
                        </button>
                      ))}

                    {groups.length <= 1 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No other groups available
                      </div>
                    )}

                    <div className="border-t p-2">
                      <button
                        onClick={() => setShowMoveDropdown(false)}
                        className="w-full px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleArchiveSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Archive selected items"
              >
                <BiArchiveIn size={16} />
                <span className="text-xs sm:text-sm">Archive</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px] hover:bg-red-50 text-red-600 p-2 rounded-md transition-colors"
                title="Delete selected items"
              >
                <Trash2 size={16} />
                <span className="text-xs sm:text-sm">Delete</span>
              </button>

              <button
                onClick={() => setSelectedItems([])}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-2 rounded-md transition-colors"
                title="Clear selection"
              >
                <X size={20} />
              </button>
            </div>
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
