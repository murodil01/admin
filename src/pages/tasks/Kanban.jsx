import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash, FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";
import assigned from "../../assets/icons/assigned.svg";
import acknowledged from "../../assets/icons/acknowledged.svg";
import inProgress from "../../assets/icons/inProgress.svg";
import completedIcon from "../../assets/icons/completed.svg";
import inReview from "../../assets/icons/inReview.svg";
import rework from "../../assets/icons/rework.svg";
import dropped from "../../assets/icons/dropped.svg";
import approved from "../../assets/icons/approved.svg";
import descriptionIcon from "../../assets/icons/description.svg";
import comment from "../../assets/icons/comment.svg";
import checkList from "../../assets/icons/checklist.svg";
import clock from "../../assets/icons/clock.svg";
import dayjs from "dayjs";
import { DownloadOutlined } from "@ant-design/icons";
import memberSearch from "../../assets/icons/memberSearch.svg";
import pencil from "../../assets/icons/pencil.svg";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import {
  Modal,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Checkbox,
  message,
  Spin,
  Dropdown,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { MoreVertical ,X} from "lucide-react";
import {
  getTaskById,
  updateTaskType,
  createTask,
  updateTask,
  deleteTask,
  getTaskTags,
  getProjectUsers,
  getTaskFiles,
  uploadTaskFile,
  deleteTaskFile,
  // updateProjectUsers,
  // getCommentTask, ///
  createComment, //
  updateTaskComment,
  deleteTaskComment,
  createChecklistItem,
  getTaskInstructions,
  createInstruction,
  updateTaskInstruction,
  updateInstruction,
  deleteInstruction,
  deleteChecklistItem,
  getTaskFilesByTask,
  getTaskInstructionsByTask,
  getTaskCommentsByTask,
} from "../../api/services/taskService";
import { ArrowBigUpDashIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const NotionKanban = ({ cards, setCards, assignees, getAssigneeName }) => {
  return (
    <div className="flex flex-col gap-5 relative">
      <button
        onClick={() => window.history.back()}
        className="flex justify-center rounded-[14px] items-center gap-2 text-sm md:text-[16px] font-bold text-[#1F2937] hover:text-[#6b82a8] shadow bg-white w-[100px] md:w-[133px] h-[40px] md:h-[48px] cursor-pointer"
      >
        <ArrowLeft size={18} /> Go Back
      </button>

      <div className="flex gap-5 mt-[20px] w-full overflow-x-auto hide-scrollbar">
        <Board
          cards={cards}
          setCards={setCards}
          assignees={assignees}
          getAssigneeName={getAssigneeName}
        />
      </div>
    </div>
  );
};

const taskColumns = [
  {
    id: "assigned",
    title: "Assigned",
    color: "bg-[#DCE8FF]",
    icon: <img src={assigned} alt="assigned" />,
  },
  {
    id: "acknowledged",
    title: "Acknowledged",
    color: "bg-[#D5F6D7]",
    icon: <img src={acknowledged} alt="acknowledged" />,
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-[#FAF6E1]",
    icon: <img src={inProgress} alt="inProgress" />,
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-[#F4EBF9]",
    icon: <img src={completedIcon} alt="completedIcon" />,
  },
  {
    id: "in_review",
    title: "In Review",
    color: "bg-[#FFF0E0]",
    icon: <img src={inReview} alt="inReview" />,
  },
  {
    id: "return_for_fixes",
    title: (
      <Permission allowedRoles={Object.values(ROLES)}>
        <span className="flex items-center gap-1">Return for Fixes</span>
      </Permission>
    ),
    color: "bg-[#E2C7A9]",
    icon: <img src={rework} alt="" />,
    allowedRoles: Object.values(ROLES),
  },
  {
    id: "dropped",
    title: (
      <Permission allowedRoles={Object.values(ROLES)}>
        <span className="flex items-center gap-1">Dropped</span>
      </Permission>
    ),
    color: "bg-[#FFDADA]",
    icon: <img src={dropped} alt="" />,
    allowedRoles: Object.values(ROLES),
  },
  {
    id: "approved",
    title: (
      <Permission allowedRoles={Object.values(ROLES)}>
        <span className="flex items-center gap-1">Approved</span>
      </Permission>
    ),
    color: "bg-[#C2FFCF]",
    icon: <img src={approved} alt="" />,
    allowedRoles: Object.values(ROLES),
  },
];

const getStatusTitle = (statusId) => {
  const column = taskColumns.find((col) => col.id === statusId);
  return column ? column.title : statusId || "N/A";
};

const Board = ({ cards, setCards }) => {
  // const [hasChecked, setHasChecked] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleEdit = (card) => {
    setSelectedCard(card);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedCard) => {
    setCards((prev) =>
      prev.map((c) => {
        const targetId = updatedCard.id ?? c.id;
        return c.id === targetId ? { ...updatedCard, id: targetId } : c;
      })
    );
  };

  const [activeColumn, setActiveColumn] = useState(taskColumns[0]?.id || null);

  return (
    <div className="flex flex-col w-full">
      {/* Column selector for mobile */}
      <div className="items-start sm:hidden flex gap-2 overflow-x-auto mb-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
        {taskColumns.map((col) => (
          <Permission key={col.id} allowedRoles={col.allowedRoles || []}>
            <button
              onClick={() => setActiveColumn(col.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${
                  activeColumn === col.id
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.icon}</span>
                <span>{col.title}</span>
              </div>
            </button>
          </Permission>
        ))}
      </div>

      {/* Faqat active column */}
      <div className="flex-1 w-full sm:hidden">
        <Permission
          allowedRoles={
            taskColumns.find((c) => c.id === activeColumn)?.allowedRoles || []
          }
        >
          <Column
            key={activeColumn}
            icon={taskColumns.find((c) => c.id === activeColumn)?.icon}
            title={taskColumns.find((c) => c.id === activeColumn)?.title}
            column={activeColumn}
            backgroundColor={
              taskColumns.find((c) => c.id === activeColumn)?.color
            }
            cards={cards.filter((c) => c.column === activeColumn)}
            setCards={setCards}
            onEdit={handleEdit}
            showHeader={false}
          />
        </Permission>
      </div>

      {/* Edit Modal */}
      <EditCardModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        cardData={selectedCard}
        onUpdate={handleSaveEdit}
      />

      {/* Desktop: all columns side by side */}
      <div className="hidden sm:flex items-start gap-4 overflow-x-auto pb-4">
        {taskColumns.map((col) => (
          <Permission key={col.id} allowedRoles={col.allowedRoles || []}>
            <Column
              icon={col.icon}
              title={col.title}
              column={col.id}
              backgroundColor={col.color}
              cards={cards.filter((c) => c.column === col.id)}
              setCards={setCards}
              onEdit={handleEdit}
            />
          </Permission>
        ))}
      </div>
    </div>
  );
};

const Column = ({
  icon,
  title,
  backgroundColor,
  column,
  cards,
  setCards,
  onEdit,
  showHeader = true,
}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    if (el?.element) el.element.style.opacity = "1";
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => (i.style.opacity = "0"));
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    return indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );
  };

  const getIndicators = () =>
    Array.from(document.querySelectorAll(`[data-column="${column}"]`));

  const handleDragLeave = () => setActive(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setActive(false);
    clearHighlights();

    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element?.dataset.before || "-1";

    if (before !== cardId) {
      // 1. Darhol UI ni yangilash (Optimistic Update)
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, column } // card ning column ni yangi column ga o'tkazish
            : c
        )
      );

      // 2. Backendga yuborish
      try {
        console.log(`Moving card ${cardId} to column ${column}`);
        await updateTaskType(cardId, column);
        message.success(`Task moved to ${column}!`);
      } catch (error) {
        console.error("Update error:", error);
        message.error("Failed to update task status");

        // 3. Xatolik bo'lsa, eski holatga qaytarish (Rollback)
        setCards((prev) => {
          const originalCard = cards.find((c) => c.id === cardId);
          if (originalCard) {
            return prev.map((c) =>
              c.id === cardId ? { ...c, column: originalCard.column } : c
            );
          }
          return prev;
        });
      }
    }
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div
      className={`w-full sm:min-w-[260px] sm:max-w-[270px] rounded-xl p-4 ${backgroundColor} shadow-sm flex flex-col my-1`}
    >
      {showHeader && (
        <div className="border-b border-gray-300 pb-2 mb-3 z-10 flex items-center gap-2">
          <span>{icon}</span>
          <h3 className={`font-semibold text-lg text-gray-800`}>{title}</h3>
          <span className="rounded text-sm text-black">
            {filteredCards.length}
          </span>
        </div>
      )}
      <AddCard column={column} setCards={setCards} />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full transition-colors hidden md:block ${
          active ? "bg-neutral-800/50 border-dashed" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            onEdit={onEdit}
            image={c.image}
            setCards={setCards}
          />
        ))}
        <DropIndicator beforeId="-1" column={column} />
      </div>
      {/* Cards list - Mobile */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full transition-colors md:hidden space-y-3 ${
          active ? "bg-neutral-800/50 border-dashed" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            onEdit={onEdit}
            image={c.image}
            setCards={setCards}
          />
        ))}
        <DropIndicator beforeId="-1" column={column} />
      </div>
    </div>
  );
};
const Card = ({
  title,
  id,
  column,
  time,
  description,
  handleDragStart,
  onEdit,
  image,
  setCards,
}) => {
  const [hovered, setHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [projectUsers, setProjectUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  // Yuklash holatini birlashtirish
  const isLoading = authLoading || dataLoading;
  // ✅ TUZATISH: Progress va total_count uchun alohida state'lar
  const [cardProgress, setCardProgress] = useState(0);
  const [cardTotalCount, setCardTotalCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  // Comment editing uchun state'lar qo'shish
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentDropdownOpen, setCommentDropdownOpen] = useState(null);

  // Delete confirmation modal uchun state
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const [showAllChecklist, setShowAllChecklist] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // Helper functions
  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <img src="/pdf-icon.png" alt="PDF" className="w-5 h-5" />;
      case "doc":
      case "docx":
        return <img src="/docx_icon.png" alt="Word" className="w-5 h-5" />;
      case "xls":
      case "xlsx":
        return <img src="/excel-icon.png" alt="Excel" className="w-5 h-5" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <img src="/picture-icon.png" alt="Image" className="w-5 h-5" />;
      case "zip":
      case "rar":
        return <img src="/zip-icon.png" alt="Archive" className="w-5 h-5" />;
      default:
        return "📄";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return "";
    return dayjs(date).format("MMM D, YYYY");
  };

  // const handleFileDownload = (file) => {
  //   if (file.file || file.url) {
  //     const link = document.createElement("a");
  //     link.href = file.file || file.url;
  //     link.download = file.original_name || file.file_name || "download";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } else {
  //     message.warning("File download not available");
  //   }
  // };

  // Card komponenti ichida - handleFileDownload funksiyasini yangilash
  const handleFileDownload = async (file) => {
    try {
      // Loading state ni ko'rsatish uchun
      message.loading({
        content: "Downloading file...",
        key: "download",
        duration: 0,
      });

      if (file.file || file.url) {
        // File URL mavjud bo'lsa, to'g'ridan-to'g'ri download qilish
        const fileUrl = file.file || file.url;
        const fileName = file.original_name || file.file_name || "download";

        // Fetch orqali file ni olish va download qilish
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // Blob ni download qilish
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;

        // Browser compatibility uchun
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Memory cleanup
        window.URL.revokeObjectURL(downloadUrl);

        message.success({
          content: "File downloaded successfully!",
          key: "download",
        });
      } else {
        throw new Error("File URL not available");
      }
    } catch (error) {
      console.error("Download error:", error);
      message.error({
        content: `Failed to download file: ${error.message}`,
        key: "download",
      });
    }
  };

  const getAssigneeInfo = (assignee) => {
    if (!assignee)
      return { name: "Not assigned", avatar: null, initials: "NA" };

    let assigneeData = null;

    // projectUsers dan qidirish
    if (Array.isArray(projectUsers) && projectUsers.length > 0) {
      if (typeof assignee === "number" || typeof assignee === "string") {
        assigneeData = projectUsers.find((user) => user.id == assignee);
      } else if (typeof assignee === "object") {
        assigneeData = assignee;
      }
    } else if (typeof assignee === "object") {
      assigneeData = assignee;
    }

    if (!assigneeData) return { name: "Unknown", avatar: null, initials: "U" };

    // Ma'lumotlarni formatlash
    let name = "Unknown";
    let initials = "U";

    if (assigneeData.first_name && assigneeData.last_name) {
      name = `${assigneeData.first_name} ${assigneeData.last_name}`;
      initials =
        `${assigneeData.first_name[0]}${assigneeData.last_name[0]}`.toUpperCase();
    } else if (assigneeData.name) {
      name = assigneeData.name;
      const nameParts = name.split(" ");
      initials = nameParts
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    return {
      name,
      avatar: assigneeData.profile_picture || assigneeData.avatar,
      initials,
      email: assigneeData.email,
    };
  };
  const getCurrentUser = () => {
    console.log("🔍 Checking user storage...");

    const possibleKeys = ["user", "currentUser", "authUser", "userData"];

    for (const key of possibleKeys) {
      const localData = localStorage.getItem(key);
      const sessionData = sessionStorage.getItem(key);

      const userData = localData || sessionData;

      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log(
            `✅ Found user in ${
              localData ? "localStorage" : "sessionStorage"
            }[${key}]:`,
            user
          );

          if (user && user.id) {
            return user;
          }
        } catch (e) {
          console.error(`❌ Error parsing ${key}:`, e);
        }
      }
    }

    // Check for JWT token
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken");

    if (token && token.includes(".")) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("🔑 User from JWT:", payload);
        if (payload.user_id || payload.id) {
          return {
            id: payload.user_id || payload.id,
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
          };
        }
      } catch (e) {
        console.error("❌ Failed to decode JWT:", e);
      }
    }

    console.warn("⚠️ No user data found anywhere");
    return null;
  };

  // Fetch functions
  const fetchFiles = useCallback(async () => {
    if (!id) return;
    setFilesLoading(true);
    try {
      console.log("🔄 Fetching files for task ID:", id);
      const response = await getTaskFilesByTask(id);
      console.log("📥 Files API Response:", response);

      let filesList = [];
      if (Array.isArray(response.data)) {
        filesList = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        filesList = response.data.results;
      } else if (response.data && Array.isArray(response.data.files)) {
        filesList = response.data.files;
      }

      console.log("📁 Extracted files:", filesList);
      setFiles(filesList);
    } catch (error) {
      console.error("❌ Error fetching files:", error);
      message.error("Failed to load files");
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      console.log("🔄 Fetching comments for task ID:", id);
      const response = await getTaskCommentsByTask(id);
      console.log("📥 Comments API Response:", response);

      let commentsList = [];
      if (Array.isArray(response.data)) {
        commentsList = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        commentsList = response.data.results;
      } else if (response.data && Array.isArray(response.data.comments)) {
        commentsList = response.data.comments;
      }

      // ✅ YANGILASH: User ma'lumotlarini to'g'ri mapping qilish
      const mappedComments = commentsList.map((comment) => ({
        ...comment,
        user_name: comment.user
          ? `${comment.user.first_name} ${comment.user.last_name}`
          : "Unknown User",
        user_avatar: comment.user?.profile_picture || null,
        user_initials: comment.user
          ? `${comment.user.first_name?.[0] || ""}${
              comment.user.last_name?.[0] || ""
            }`.toUpperCase()
          : "U",
      }));

      console.log("📋 Extracted and mapped comments:", mappedComments);
      setComments(mappedComments);
      setCommentsCount(mappedComments.length);
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
      message.error("Failed to load comments");
      setComments([]);
      setCommentsCount(0);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  // ✅ Checklist o'zgarishida progress ni yangilash
  const fetchChecklist = useCallback(async () => {
    if (!id) return;
    setChecklistLoading(true);
    try {
      console.log("🔄 Fetching checklist for task ID:", id);
      const response = await getTaskInstructionsByTask(id);
      console.log("📥 RAW API Response:", response);

      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        items = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response.data && Array.isArray(response.data.instructions)) {
        items = response.data.instructions;
      }
      console.log("📋 Extracted items:", items);

      const normalizedItems = items.map((item) => {
        console.log("🔄 Processing item:", item);
        return {
          ...item,
          completed: item.status !== undefined ? item.status : false,
        };
      });
      setChecklistItems(normalizedItems);

      // ✅ TUZATISH: Progress ni qayta hisoblash
      const totalItems = normalizedItems.length;
      const completedItems = normalizedItems.filter(
        (item) => item.status
      ).length;

      console.log("📊 Recalculating progress:", {
        totalItems,
        completedItems,
        taskId: id,
      });

      setCardTotalCount(totalItems);
      setCardProgress(completedItems);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      message.error("Failed to load checklist");
      setChecklistItems([]);
    } finally {
      setChecklistLoading(false);
    }
  }, [id]);

  // Comment handlers
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning("Please enter a comment");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      message.error("Please log in to add a comment");
      console.error("❌ No user found. Available storage:");
      console.log("localStorage keys:", Object.keys(localStorage));
      console.log("sessionStorage keys:", Object.keys(sessionStorage));
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        task: id,
        message: newComment.trim(),
        user: currentUser.id,
      };

      console.log("📤 Creating comment with payload:", payload);
      const response = await createComment(payload);
      console.log("📥 createComment response:", response);

      setNewComment("");
      // DOM da textarea ni topib height ni reset qilish
      setTimeout(() => {
        const textarea = document.querySelector(
          'textarea[placeholder="Add a comment"]'
        );
        if (textarea) {
          textarea.style.height = "40px";
          textarea.dispatchEvent(new Event("input", { bubbles: true })); // onInput ni trigger qilish
        }
      }, 10);

      await fetchComments();
      message.success("Comment added successfully");
    } catch (error) {
      console.error("❌ Error adding comment:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        message.error(
          `Failed to add comment: ${
            error.response.data?.message || error.response.status
          }`
        );
      } else {
        message.error("Failed to add comment");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Comment edit handler
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.message || comment.text);
    setCommentDropdownOpen(null);
  };

  // Comment update handler
  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      message.warning("Comment cannot be empty");
      return;
    }

    try {
      await updateTaskComment(commentId, {
        message: editingCommentText.trim(),
      });

      // Comments ro'yxatini yangilash
      await fetchComments();

      // Edit mode dan chiqish
      setEditingCommentId(null);
      setEditingCommentText("");

      message.success("Comment updated successfully");
    } catch (error) {
      console.error("Error updating comment:", error);
      message.error("Failed to update comment");
    }
  };

  // Delete comment confirmation
  const showDeleteCommentModal = (comment) => {
    setCommentToDelete(comment);
    setDeleteCommentModalOpen(true);
    setCommentDropdownOpen(null);
  };

  // Confirm delete comment
  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteTaskComment(commentToDelete.id);

      // Comments ro'yxatini yangilash
      await fetchComments();

      message.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Failed to delete comment");
    } finally {
      setDeleteCommentModalOpen(false);
      setCommentToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDeleteComment = () => {
    setDeleteCommentModalOpen(false);
    setCommentToDelete(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // Checklist handlers
  const addChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    const tempItem = {
      id: `temp-${Date.now()}`,
      name: newChecklistItem.trim(),
      status: false,
      completed: false,
      isTemp: true,
    };

    console.log("➕ Adding new checklist item:", tempItem);

    setChecklistItems((prev) => {
      const updated = [...prev, tempItem];
      console.log("📝 Updated checklist with temp item:", updated);
      return updated;
    });

    const itemName = newChecklistItem.trim();
    setNewChecklistItem("");

    try {
      console.log("📤 Creating checklist item:", {
        task: id,
        name: itemName,
        status: false,
      });

      const response = await createChecklistItem({
        task: id,
        name: itemName,
        status: false,
      });
      console.log("📥 Create API Response:", response);

      setChecklistItems((prev) =>
        prev.map((item) =>
          item.id === tempItem.id
            ? {
                ...response.data,
                completed: response.data.status,
                isTemp: false,
              }
            : item
        )
      );

      message.success("Checklist item added");
    } catch (error) {
      console.error("❌ Error adding checklist item:", error);
      message.error("Failed to add checklist item");
      setChecklistItems((prev) =>
        prev.filter((item) => item.id !== tempItem.id)
      );
      setNewChecklistItem(itemName);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    const originalItems = [...checklistItems];
    setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await deleteChecklistItem(itemId);
      message.success("Item deleted");
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      message.error("Failed to delete item");
      setChecklistItems(originalItems);
    }
  };

  const handleUpdateChecklistItem = async (itemId, completed) => {
    const originalItems = [...checklistItems];

    // Optimistic update
    const updatedItems = checklistItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            status: completed,
            completed: completed,
          }
        : item
    );

    setChecklistItems(updatedItems);

    // Calculate new progress
    const total = updatedItems.length;
    const completedCount = updatedItems.filter((item) => item.status).length;
    console.log("📊 Updating progress:", {
      total,
      completedCount,
      taskId: id,
    });

    setCardProgress(completedCount);
    setCardTotalCount(total);

    try {
      await updateInstruction(itemId, { status: completed });
      message.success("Checklist updated");
    } catch (error) {
      console.error("Error updating checklist item:", error);
      message.error("Failed to update checklist");
      setChecklistItems(originalItems);
      // Revert progress calculation
      const originalCompleted = originalItems.filter(
        (item) => item.status
      ).length;
      setCardProgress(originalCompleted);
      setCardTotalCount(originalItems.length);
    }
  };
  // Modal handlers
  // ✅ Modal ochilganda task ma'lumotlarini yuklash
  const openViewModal = async () => {
    setDropdownOpen(false); // ✅ Dropdown ni yopish
    setIsModalOpen(true);
    setLoading(true);

    try {
      console.log("🔄 Fetching task data for ID:", id);
      const response = await getTaskById(id);
      console.log("📥 Task data:", response.data);

      setTaskData(response.data);

      // ✅ MUHIM: Progress va total_count ni to'g'ri o'rnatish
      const taskProgress = response.data.progress || 0;
      const taskTotalCount = response.data.total_count || 0;

      console.log(
        "📊 Setting progress:",
        taskProgress,
        "total_count:",
        taskTotalCount
      );

      setCardProgress(taskProgress);
      setCardTotalCount(taskTotalCount);

      // Project users ni yuklash
      let users = [];
      if (
        response.data.projectId ||
        response.data.project_id ||
        response.data.project
      ) {
        const projectId =
          response.data.projectId ||
          response.data.project_id ||
          response.data.project;
        try {
          const usersResponse = await getProjectUsers(projectId);
          console.log("👥 Project users:", usersResponse.data);

          if (Array.isArray(usersResponse.data)) {
            users = usersResponse.data;
          } else if (
            usersResponse.data &&
            Array.isArray(usersResponse.data.users)
          ) {
            users = usersResponse.data.users;
          } else if (
            usersResponse.data &&
            Array.isArray(usersResponse.data.results)
          ) {
            users = usersResponse.data.results;
          }
        } catch (error) {
          console.warn("⚠️ Failed to fetch project users:", error);
          users = [];
        }
      }

      setProjectUsers(users);

      // Comments count ni o'rnatish
      if (response.data.comment_count !== undefined) {
        setCommentsCount(response.data.comment_count);
      } else {
        const commentsResponse = await getTaskCommentsByTask(id);
        let commentsList = [];

        if (Array.isArray(commentsResponse.data)) {
          commentsList = commentsResponse.data;
        } else if (
          commentsResponse.data &&
          Array.isArray(commentsResponse.data.results)
        ) {
          commentsList = commentsResponse.data.results;
        } else if (
          commentsResponse.data &&
          Array.isArray(commentsResponse.data.comments)
        ) {
          commentsList = commentsResponse.data.comments;
        }
        setCommentsCount(commentsList.length);
      }

      await Promise.all([fetchComments(), fetchChecklist(), fetchFiles()]);
    } catch (error) {
      console.error("❌ Error fetching task data:", error);
      message.error("Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Task yaratilganda yoki yangilanganda progress ma'lumotlarini yuklash
  useEffect(() => {
    const loadProgressData = async () => {
      if (!id) return;

      try {
        console.log("🔄 Loading progress data for task:", id);
        const response = await getTaskById(id);

        if (response.data) {
          const taskProgress = response.data.progress || 0;
          const taskTotalCount = response.data.total_count || 0;

          console.log("📊 Initial progress data:", {
            taskProgress,
            taskTotalCount,
            id,
          });

          setCardProgress(taskProgress);
          setCardTotalCount(taskTotalCount);
        }
      } catch (error) {
        console.error("❌ Error loading progress data:", error);
        // Error yuz bersa default qiymatlar qoladi
      }
    };

    loadProgressData();
  }, [id]);

  const handleMoveToColumn = async (newColumn) => {
    try {
      await updateTaskType(id, newColumn);
      message.success(`Task moved to ${newColumn}`);
      // onEdit({ id, title, time, description, column: newColumn });
      //  onEdit o'rniga setCards
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, column: newColumn } : card
        )
      );
    } catch (error) {
      message.error("Failed to move task");
      console.error("Move error:", error);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete();
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteTask(id);
      message.success("Task deleted successfully");
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      message.error("Failed to delete task");
      console.error("Delete error:", error);
    }
  };

  const handleEditCard = async () => {
    setDropdownOpen(false); // ✅ Dropdown ni yopish
    setLoading(true);
    try {
      const response = await getTaskById(id);
      setSelectedCard(response.data);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error fetching task:", error);
      message.error("Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCard = (updatedCard) => {
    console.log("Updated card received:", updatedCard);

    setIsEditModalOpen(false);

    // ✅ MUHIM: Progress state'larini yangilash
    if (updatedCard.progress !== undefined) {
      setCardProgress(updatedCard.progress);
    }
    if (updatedCard.total_count !== undefined) {
      setCardTotalCount(updatedCard.total_count);
    }
    if (updatedCard.comment_count !== undefined) {
      setCommentsCount(updatedCard.comment_count);
    }

    // Cards listini yangilash
    setCards((prev) =>
      prev.map((card) =>
        card.id === updatedCard.id
          ? {
              ...card,
              title: updatedCard.name || updatedCard.title,
              time: updatedCard.deadline || updatedCard.time,
              description: updatedCard.description,
              column: updatedCard.tasks_type || updatedCard.column,
              // ✅ Progress ma'lumotlarini ham yangilash
              progress: updatedCard.progress || 0,
              total_count: updatedCard.total_count || 0,
              comment_count: updatedCard.comment_count || 0,
            }
          : card
      )
    );
  };

  useEffect(() => {
    // Task yaratilganda commentlarni yuklash
    const loadInitialComments = async () => {
      if (!id) return;

      try {
        console.log("🔄 Loading initial comments for task:", id);
        const response = await getTaskCommentsByTask(id);

        let commentsList = [];
        if (Array.isArray(response.data)) {
          commentsList = response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
          commentsList = response.data.results;
        } else if (response.data && Array.isArray(response.data.comments)) {
          commentsList = response.data.comments;
        }

        console.log(`📋 Found ${commentsList.length} comments for task ${id}`);
        setCommentsCount(commentsList.length);
      } catch (error) {
        console.error("❌ Error loading initial comments:", error);
        // Xatoni chop etish lekin foydalanuvchiga xabar bermaslik
      }
    };

    loadInitialComments();
  }, [id]);

  // Effects
  useEffect(() => {
    if (!image) return;
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImageUrl(image);
  }, [image]);

  useEffect(() => {
    if (taskData && taskData.comments) {
      setComments(taskData.comments);
      setProgress(taskData.progress || 0);
      setTotalCount(taskData.total_count || 0);

      if (taskData.checklist_items) {
        const total = taskData.checklist_items.length;
        const completed = taskData.checklist_items.filter(
          (item) => item.status
        ).length;
        setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
        setTotalCount(total);
      }
    }
  }, [taskData]);
   const openImageModal = () => {
    

  setIsImageModalOpen(true);
};

const closeImageModal = () => {
  setIsImageModalOpen(false);
};

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => {
          console.log("Drag started for card:", { title, id, column });
          handleDragStart(e, { title, id, column }); // Ma'lumotlar to'g'ri uzatilganligini tekshiring
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-grab rounded-lg bg-white p-3 shadow-sm active:cursor-grabbing border border-gray-100 hover:shadow-md transition relative"
      >
        {/* New 3 point button */}
        <div className="absolute top-2 right-1">
          <Dropdown
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            menu={{
              items: [
                {
                  key: "edit",
                  label: (
                    <Permission
                      anyOf={[ROLES.FOUNDER, ROLES.DEP_MANAGER, ROLES.MANAGER, ROLES.HEADS]}
                    >
                      <span>Edit</span>
                    </Permission>
                  ),
                  // ✅ onClick ni menu item ichiga ko'chirish
                  onClick: (e) => {
                    e.domEvent.stopPropagation(); // DOM event ni to'xtatish
                    setDropdownOpen(false); // Dropdownni yopish
                    handleEditCard();
                  },
                },
                {
                  key: "detail",
                  label: <span>Detail</span>,
                  // ✅ onClick ni menu item ichiga ko'chirish
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setDropdownOpen(false);
                    openViewModal();
                  },
                },
                {
                  key: "move_to",
                  label: "Move to",
                  children: taskColumns.map((col) => ({
                    key: col.id,
                    label: col.title,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      setDropdownOpen(false);
                      handleMoveToColumn(col.id);
                    },
                  })),
                },
                {
                  key: "delete",
                  label: (
                    <Permission
                      anyOf={[ROLES.FOUNDER, ROLES.DEP_MANAGER, ROLES.MANAGER, ROLES.HEADS]}
                    >
                      <span>Delete</span>
                    </Permission>
                  ),
                  // ✅ onClick ni menu item ichiga ko'chirish
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    setDropdownOpen(false);
                    showDeleteModal();
                  },
                },
              ],
            }}
            trigger={["click"]}
            overlayStyle={{ zIndex: 999 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="p-1 rounded hover:bg-gray-200 cursor-pointer"
            >
              <MoreVertical className="size-4" />
            </button>
          </Dropdown>

          {/* Delete Confirmation Modal */}
          <Modal
            title="Are you sure you want to delete this card?"
            open={isDeleteModalOpen}
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            okText="Yes, delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <p>This action cannot be undone.</p>
          </Modal>
        </div>

        {/* Agar image mavjud bo'lsa */}
        {imageUrl && (
          <div className="w-[100px] h-[100px] rounded overflow-hidden mb-2">
            <img
              src={imageUrl}
              alt="card"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <button
          className="text-sm font-semibold text-gray-900 mb-3 cursor-pointer"
          onClick={openViewModal}
        >
          {title}
        </button>

        <Modal
          title={
            <div
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                padding: "5px 0",
                textTransform: "capitalize",
              }}
            >
              {taskData ? taskData.name : `Task Details`}
            </div>
          }
          open={isModalOpen}
          onOk={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
          okText="Got it"
          cancelText="Edit"
          width={1000}
          style={{
            top: 30, // px qiymati, modal yuqoriga yaqinlashadi
          }}
          footer={[
            <Permission anyOf={[ROLES.FOUNDER, ROLES.DEP_MANAGER, ROLES.MANAGER, ROLES.HEADS]}>
              <Button
                key="edit"
                onClick={() => {
                  setIsModalOpen(false); // eski modal yopiladi
                  handleEditCard(); // Bu yerda ham yangi funksiya
                }}
                style={{
                  borderRadius: "14px",
                  padding: "18px 16px",
                  fontSize: "14px",
                  fontWeight: "bolder",
                }}
              >
                <span className="text-gray-500">Edit</span>{" "}
                <img src={pencil} className="w-[14px]" alt="pencil" />
              </Button>
            </Permission>,
            <Button
              key="gotit"
              type="primary"
              style={{
                borderRadius: "14px",
                padding: "18px 24px",
                fontSize: "14px",
                fontWeight: "bolder",
              }}
              onClick={() => setIsModalOpen(false)}
            >
              Got it
            </Button>,
          ]}
        >
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spin size="large" />
            </div>
          ) : taskData ? (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6 md:gap-10">
              {/* Left section */}
              <div className="md:col-span-6 space-y-6">
                {/* Top section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full max-w-5/6 sm:w-[140px] sm:h-[140px] bg-gray-200 flex items-center justify-center rounded-xl">
                   <span role="img" aria-label="image" className="text-4xl">
                    {taskData?.task_image ? (
              <img
  src={taskData.task_image}
  alt="task image"
  onError={(e) => (e.currentTarget.style.display = "none")}
  className="rounded-xl cursor-pointer hover:opacity-80 transition-opacity duration-200 w-full h-full object-cover"
  onClick={(e) => {
    e.stopPropagation();
    openImageModal(); // openModal o'rniga
  }}
/>
            ) : (
              <span>🖼️</span>
            )}
                  </span>
                  </div>
                  <div className="flex-1 text-sm text-gray-700 leading-6 whitespace-pre-wrap">
                    {taskData.description || "No description available"}
                  </div>
                </div>
               {isImageModalOpen && ( // isModalOpen o'rniga
  <div
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    onClick={closeImageModal} // closeModal o'rniga
  >
    <div className="relative max-w-4xl max-h-full">
      <button
        onClick={closeImageModal} // closeModal o'rniga
        className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>
      <img
        src={taskData.task_image}
        alt="task image enlarged"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
          </div>
        </div>
      )}
                {/* Files */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span>📁</span>
                    Files ({files.length})
                  </h4>

                  {filesLoading ? (
                    <div className="flex items-center gap-2">
                      <Spin size="small" />
                      <span className="text-sm text-gray-500">
                        Loading files...
                      </span>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-2 max-w-sm">
                      {/* Files list */}
                      <div
                        className={`space-y-2 overflow-hidden transition-all duration-300 ${
                          showAllFiles ? "max-h-none" : "max-h-80"
                        }`}
                      >
                        {(showAllFiles ? files : files.slice(0, 4)).map(
                          (file, index) => (
                            <div
                              key={file.id || index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* File type icon */}
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-lg">
                                    {getFileIcon(
                                      file.file_type || file.file_name
                                    )}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.original_name ||
                                      file.file_name ||
                                      "Unnamed file"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>
                                      {file.file_size
                                        ? formatFileSize(file.file_size)
                                        : "Size unknown"}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {file.created_at
                                        ? formatDate(file.created_at)
                                        : "Date unknown"}
                                    </span>
                                    {file.uploaded_by && (
                                      <>
                                        <span>•</span>
                                        <span>by {file.uploaded_by}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 ml-3">
                                {/* Preview button (for images) */}
                                {file.file_type?.startsWith("image/") && (
                                  <Button
                                    type="text"
                                    size="small"
                                    icon="👁️"
                                    onClick={() => {
                                      // Image preview ni modal da ochish
                                      Modal.info({
                                        title:
                                          file.original_name || file.file_name,
                                        content: (
                                          <div className="text-center">
                                            <img
                                              src={file.file || file.url}
                                              alt="Preview"
                                              style={{
                                                maxWidth: "100%",
                                                maxHeight: "400px",
                                              }}
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                  "block";
                                              }}
                                            />
                                            <div
                                              style={{ display: "none" }}
                                              className="text-gray-500"
                                            >
                                              Preview not available
                                            </div>
                                          </div>
                                        ),
                                        width: 600,
                                        okText: "Close",
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Preview image"
                                  />
                                )}

                                {/* Download button */}
                                <Button
                                  type="text"
                                  icon={<DownloadOutlined />}
                                  onClick={() => handleFileDownload(file)}
                                  className="text-blue-600 hover:text-blue-800"
                                  size="small"
                                  title="Download file"
                                />

                                {/* File info button */}
                                <Button
                                  type="text"
                                  icon="ℹ️"
                                  onClick={() => {
                                    Modal.info({
                                      title: "File Information",
                                      content: (
                                        <div className="space-y-2">
                                          <p>
                                            <strong>Name:</strong>{" "}
                                            {file.original_name ||
                                              file.file_name}
                                          </p>
                                          <p>
                                            <strong>Size:</strong>{" "}
                                            {file.file_size
                                              ? formatFileSize(file.file_size)
                                              : "Unknown"}
                                          </p>
                                          <p>
                                            <strong>Type:</strong>{" "}
                                            {file.file_type || "Unknown"}
                                          </p>
                                          <p>
                                            <strong>Uploaded:</strong>{" "}
                                            {file.created_at
                                              ? formatDate(file.created_at)
                                              : "Unknown"}
                                          </p>
                                          {file.uploaded_by && (
                                            <p>
                                              <strong>Uploaded by:</strong>{" "}
                                              {file.uploaded_by}
                                            </p>
                                          )}
                                          {file.file && (
                                            <p>
                                              <strong>URL:</strong>{" "}
                                              <a
                                                href={file.file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600"
                                              >
                                                {file.file}
                                              </a>
                                            </p>
                                          )}
                                        </div>
                                      ),
                                      okText: "Close",
                                    });
                                  }}
                                  size="small"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="File details"
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Show More/Less button */}
                      {files.length > 4 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setShowAllFiles(!showAllFiles)}
                            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            <span>
                              {showAllFiles
                                ? `Show Less`
                                : `Show ${files.length - 4} More Files`}
                            </span>
                            {showAllFiles ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-sm text-gray-500 mb-2">
                        No files attached to this task
                      </p>
                      <p className="text-xs text-gray-400">
                        Files will appear here when uploaded
                      </p>
                    </div>
                  )}

                  {/* File upload progress */}
                  {filesLoading && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Spin size="small" />
                        <span className="text-sm text-blue-700">
                          Loading files...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <img
                        src={checkList}
                        alt="checklist"
                        className="w-4 h-4 bg-blue-600"
                      />
                      Check list ({checklistItems.length})
                    </h4>
                    {checklistItems.length > 4 && (
                      <button
                        onClick={() => setShowAllChecklist(!showAllChecklist)}
                        className="text-xs text-blue-500 hover:text-blue-700 cursor-pointer font-medium transition-colors duration-200 flex items-center gap-1"
                      >
                        {showAllChecklist ? "Hide" : "Show"}
                        <span
                          className={`transform text-sm transition-transform duration-200 ${
                            showAllChecklist ? "rotate-180" : ""
                          }`}
                        >
                          <ArrowBigUpDashIcon />
                        </span>
                      </button>
                    )}
                  </div>

                  {checklistItems && checklistItems.length > 0 ? (
                    <div className="space-y-2">
                      <div
                        className={`space-y-2 transition-all duration-300 ${
                          showAllChecklist
                            ? "max-h-96 overflow-y-auto"
                            : "max-h-none"
                        }`}
                      >
                        {(showAllChecklist
                          ? checklistItems
                          : checklistItems.slice(0, 4)
                        ).map((item, index) => (
                          <div
                            key={item.id || index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors duration-150"
                          >
                            <Checkbox
                              checked={item.completed || item.status}
                              onChange={(e) =>
                                handleUpdateChecklistItem(
                                  item.id,
                                  e.target.checked
                                )
                              }
                            />
                            <span
                              className={`text-sm flex-1 ${
                                item.completed || item.status
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.title ||
                                item.name ||
                                item.description ||
                                `Item ${index + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>

                      {!showAllChecklist && checklistItems.length > 4 && (
                        <div className="text-center pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            ... and {checklistItems.length - 4} more items
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No checklist items</p>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Comments</h4>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className=" max-h-96 overflow-y-auto">
                      {comments.length > 0 ? (
                        comments.map((c) => (
                          <div
                            key={c.id}
                            className="rounded-lg bg-blue-50 mb-3"
                          >
                            <div className="flex items-center gap-3 mb-2 justify-between">
                              <div className="flex items-center gap-3">
                                {/* User avatar */}
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-xs font-semibold">
                                  {c.user_avatar ? (
                                    <img
                                      src={c.user_avatar}
                                      alt={c.user_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                          "flex";
                                      }}
                                    />
                                  ) : null}
                                  <span
                                    className={`${
                                      c.user_avatar ? "hidden" : "flex"
                                    } w-full h-full items-center justify-center bg-blue-500 text-white text-xs font-semibold`}
                                  >
                                    {c.user_initials}
                                  </span>
                                </div>

                                {/* User name */}
                                <span className="text-sm font-medium">
                                  {c.user_name || "Unknown User"}
                                </span>

                                <p className="text-xs text-gray-500">
                                  {dayjs(c.created_at).format(
                                    "MMM D, YYYY h:mm A"
                                  )}
                                </p>
                              </div>

                              {/* Comment actions dropdown */}
                              <Dropdown
                                open={commentDropdownOpen === c.id}
                                onOpenChange={(open) =>
                                  setCommentDropdownOpen(open ? c.id : null)
                                }
                                menu={{
                                  items: [
                                    {
                                      key: "edit",
                                      label: "Edit message",
                                      onClick: () => handleEditComment(c),
                                    },
                                    {
                                      key: "delete",
                                      label: "Delete",
                                      onClick: () => showDeleteCommentModal(c),
                                    },
                                  ],
                                }}
                                trigger={["click"]}
                                overlayStyle={{ zIndex: 1001 }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCommentDropdownOpen(
                                      commentDropdownOpen === c.id ? null : c.id
                                    );
                                  }}
                                  className="p-1 rounded hover:bg-gray-200 cursor-pointer"
                                >
                                  <MoreVertical className="size-3" />
                                </button>
                              </Dropdown>
                            </div>

                            <div className="ml-11">
                              <div className="bg-white p-3 rounded-lg">
                                {editingCommentId === c.id ? (
                                  // Edit mode
                                  <div className="space-y-2">
                                  
                                    <textarea
                                      value={editingCommentText}
                                      onChange={(e) =>
                                        setEditingCommentText(e.target.value)
                                      }
                                      onInput={(e) => {
                                        if (e.target.value === "") {
                                          e.target.style.height = "40px"; // Bo'sh bo'lsa minimal height
                                        } else {
                                          e.target.style.height = "auto";
                                          e.target.style.height =
                                            Math.min(
                                              e.target.scrollHeight,
                                              140
                                            ) + "px";
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleUpdateComment(c.id);
                                        }
                                      }}
                                      className="flex-1 border w-full border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                                      style={{
                                        minHeight: "40px",
                                        maxHeight: "140px",
                                      }}
                                      // rows={1}
                                    />
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        onClick={() =>
                                          handleUpdateComment(c.id)
                                        }
                                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // View mode
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {c.message || c.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 mb-3">
                          No comments yet
                        </p>
                      )}
                    </div>
                    {/* Add new comment */}
                    <div className="mt-3 flex gap-2 items-end">
                      <textarea
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onInput={(e) => {
                          if (e.target.value === "") {
                            e.target.style.height = "40px"; // Bo'sh bo'lsa minimal height
                          } else {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              Math.min(e.target.scrollHeight, 140) + "px";
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        className="flex-1 border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                        style={{ minHeight: "40px", maxHeight: "140px" }}
                        rows={1}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={submitLoading}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600 disabled:opacity-50 mb-0.5"
                      >
                        {submitLoading ? "..." : "➤"}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Delete Comment Confirmation Modal */}
                <Modal
                  title="Delete Comment"
                  open={deleteCommentModalOpen}
                  onOk={handleConfirmDeleteComment}
                  onCancel={handleCancelDeleteComment}
                  okText="Yes, delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  centered
                >
                  <div className="py-4">
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to delete this comment? This action
                      cannot be undone.
                    </p>
                    {commentToDelete && (
                      <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {commentToDelete.user_name || "Unknown User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {dayjs(commentToDelete.created_at).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          "{commentToDelete.message || commentToDelete.text}"
                        </p>
                      </div>
                    )}
                  </div>
                </Modal>
              </div>

              {/* Right section */}
              <div className="md:col-span-4 space-y-4 text-sm">
                {/* Created By */}
                <div>
                  <p className="text-gray-400">Created by</p>

                  <div className="flex items-center gap-3 mt-1">
                    <img className="w-8 h-8 rounded-full" src={taskData.created_by_image} alt="" />
                    <p>
                      {taskData.created_by || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-gray-400">Assigned to</p>

                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const assignee =
                        selectedAssignee ||
                        taskData?.assignee ||
                        taskData?.assigned_to ||
                        taskData?.assigned?.[0];
                      const assigneeInfo = getAssigneeInfo(assignee);

                      return (
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                            {assigneeInfo.avatar ? (
                              <img
                                src={assigneeInfo.avatar}
                                alt={assigneeInfo.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.innerHTML = `<span class="text-xs font-semibold text-white bg-blue-500 w-full h-full flex items-center justify-center">${assigneeInfo.initials}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-xs font-semibold text-gray-600">
                                {assigneeInfo.initials}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <span className="font-medium text-gray-900">
                              {assigneeInfo.name}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="mt-1">
                    {taskData.deadline
                      ? dayjs(taskData.deadline).format("YYYY-MM-DD")
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Notification</p>
                  <p className="mt-1">{taskData.is_active ? "On" : "Off"}</p>
                </div>

                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="mt-1">{getStatusTitle(taskData.tasks_type)}</p>
                </div>

                <div>
                  <p className="text-gray-400">Progress</p>
                  <p className="mt-1">
                    {taskData.progress}/{taskData.total_count}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {taskData.tags && taskData.tags.length > 0 ? (
                      taskData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 px-2 py-1 rounded text-xs"
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <p>N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No task data available</p>
          )}
        </Modal>
        <EditCardModal
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          cardData={selectedCard}
          onUpdate={handleUpdateCard}
        />

        {/* Bottom Row */}
        <div
          className="flex items-center justify-between text-xs text-gray-500"
          onClick={openViewModal}
        >
          {/* Deadline faqat time mavjud bo'lsa ko'rinadi */}
          {time && time !== "No due date" && (
            <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
              <img src={clock} alt="Deadline" />
              <span>{time}</span>
            </div>
          )}

          {description && (
            <div>
              <img src={descriptionIcon} alt="Description Icon" />
            </div>
          )}

          {/* Comment Icon */}
          {commentsCount > 0 && (
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] rounded-full size-4 flex items-center justify-center">
                {commentsCount}
              </span>
              <img src={comment} alt="Comment Icon" className="w-6" />
            </div>
          )}

          {/* ✅ TUZATILGAN: Checklist Progress */}
         {cardTotalCount > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 ${
                cardProgress === cardTotalCount
                  ? "bg-[#64C064] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <img src={checkList} alt="Checklist" />
              {cardProgress} / {cardTotalCount}
            </span>
          </div>
        )}
        </div>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => (
  <div
    data-before={beforeId || "-1"}
    data-column={column}
    className="my-0.5 h-2 w-full bg-violet-400 opacity-0"
  />
);

const AddCard = ({ column, setCards }) => {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newCard = {
      name: text.trim(),
      column,
      // title: text.trim(),
      tasks_type: column,
      // id: Math.random().toString(),
      // time: "",
      // assignee: null,
      description: "", // default qiymat
      project: projectId, // loyiha ID sini dynamic qilib olish kerak
      tags_ids: [], // loyiha ID sini dynamic qilib olish kerak
    };
    setLoading(true);
    try {
      // 1. Backendga yuborish
      const response = await createTask(newCard);
      const createdTask = response.data;

      // 2. UI ga yangi card qo'shish
      setCards((prev) => [
        ...prev,
        {
          id: createdTask.id,
          title: createdTask.name,
          column: createdTask.tasks_type,
          time: createdTask.deadline || "",
          assignee: createdTask.assigned
            ? {
                name: createdTask.assigned[0],
                avatar: "bg-blue-500",
              }
            : null,
        },
      ]);
      // setCards((prev) => [...prev, newCard]);
      setText("");
      setAdding(false);
      message.success("Task created successfully!");
    } catch (error) {
      console.error("Failed to create task:", error);
      message.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // bu yerda permission yozilishi kerak (boshlanish)

  return adding ? (
    <motion.form layout onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
        placeholder="Add new task..."
        className="w-full rounded-lg border border-violet-400 bg-white p-3 text-sm text-gray-700 placeholder-violet-300 focus:outline-0"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={loading}
      />
      <div className="mt-1.5 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="px-3 py-1.5 text-xs text-neutral-600 font-bold hover:text-neutral-500"
          disabled={loading}
        >
          Close
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-neutral-50 font-bold px-3 py-1.5 text-xs text-neutral-95"
          disabled={loading}
        >
          {loading ? "Creating..." : "Add"}
          {!loading && <FiPlus />}
        </button>
      </div>
    </motion.form>
  ) : (
    <Permission anyOf={[ROLES.FOUNDER, ROLES.DEP_MANAGER, ROLES.MANAGER, ROLES.HEADS]}>
      <motion.button
        layout
        onClick={() => setAdding(true)}
        className="flex w-full items-center gap-1.5 p-2 text-xs text-black font-bold hover:bg-white hover:rounded-lg cursor-pointer"
      >
        <FiPlus />
        <span>Add a card</span>
      </motion.button>
    </Permission>
  );

  // tugashi.
};

const EditCardModal = ({ visible, onClose, cardData, onUpdate }) => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [originalAssignee, setOriginalAssignee] = React.useState(null);

  // Form state variables
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("");
  const [date, setDate] = React.useState(null);
  const [notification, setNotification] = React.useState("Off");
  const [selectedAssignee, setSelectedAssignee] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState([]);

  const [progress, setProgress] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  // ✅ Image uchun yangi state'lar qo'shish
  const [currentImage, setCurrentImage] = React.useState(null);
  const [newImage, setNewImage] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState(null);

  // Files state - yetishmayotgan qism
  const [files, setFiles] = React.useState([]);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [fileUploading, setFileUploading] = React.useState(false);

  // API data state
  const [availableUsers, setAvailableUsers] = React.useState([]);
  const [availableTags, setAvailableTags] = React.useState([]);

  // Checklist uchun yangi state'lar
  const [checklist, setChecklist] = React.useState([]);
  const [checklistItems, setChecklistItems] = React.useState([]);
  const [checklistLoading, setChecklistLoading] = React.useState(false);
  // Modal ochilganda API dan ma'lumotlarni yuklash
  React.useEffect(() => {
    if (visible && projectId && cardData?.id) {
      loadModalData();
      loadTaskFiles();
      loadTaskInstructions(cardData.id);

      // Save the original assignee when modal opens
      if (
        cardData.assigned &&
        Array.isArray(cardData.assigned) &&
        cardData.assigned.length > 0
      ) {
        // Extract the ID from the assigned object/ID
        const assigneeId =
          typeof cardData.assigned[0] === "object"
            ? cardData.assigned[0].id
            : cardData.assigned[0];
        setOriginalAssignee(assigneeId);
      } else {
        setOriginalAssignee(null);
      }
    }

    // Reset when modal closes
    if (!visible) {
      setOriginalAssignee(null);
    }
  }, [visible, cardData?.id]);

  // Card ma'lumotlarini form ga yuklash
  React.useEffect(() => {
    if (visible && cardData) {
      setTitle(cardData.name || "");
      setType(cardData.tasks_type || "");
      setDate(cardData.deadline ? dayjs(cardData.deadline) : null);
      setNotification(cardData.is_active ? "On" : "Off");
      // setSelectedAssignee(cardData.assigned || []);

      // Assigned maydonini to'g'ri formatlash
      // ✅ TUZATISH: assigned maydonini to'g'ri formatlash
      if (
        cardData.assigned &&
        Array.isArray(cardData.assigned) &&
        cardData.assigned.length > 0
      ) {
        // Extract just the ID for the select value
        const assigneeId =
          typeof cardData.assigned[0] === "object"
            ? cardData.assigned[0].id
            : cardData.assigned[0];
        setSelectedAssignee(assigneeId);
      } else {
        setSelectedAssignee(null);
      }

      setDescription(cardData.description || "");
      setSelectedTags(cardData.tags ? cardData.tags.map((tag) => tag.id) : []);
      setProgress(cardData.progress || 0);
      setTotalCount(cardData.total_count || 0);
      // ✅ Image ma'lumotlarini yuklash
      if (cardData.task_image) {
        setCurrentImage(cardData.task_image);
        setImagePreviewUrl(cardData.task_image);
      } else {
        setCurrentImage(null);
        setImagePreviewUrl(null);
      }

      // Reset new image
      setNewImage(null);
      setFiles([]);
    }
  }, [cardData, visible]);

  // Checklist ma'lumotlarini yuklash
  const loadTaskInstructions = async (taskId) => {
    if (!taskId) return;

    setChecklistLoading(true);
    try {
      const response = await getTaskInstructions(taskId);
      // faqat shu taskga tegishli instructions qolsin
      const instructionsData = (response.data?.results || []).filter(
        (instruction) => instruction.task === taskId
      );
      console.log("Instructions ma'lumotlari:", response);

      // Calculate progress and total count
      const totalCount = instructionsData.length;
      const completedCount = instructionsData.filter(
        (item) => item.status
      ).length;
      const progress =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // API dan kelgan ma'lumotlarni checklist formatiga o'zgartirish
      const formattedChecklist = instructionsData.map((instruction) => ({
        id: instruction.id,
        text: instruction.name,
        done: instruction.status,
        isNew: false, // mavjud elementlar uchun
      }));

      // Update state
      setChecklistItems(instructionsData);
      setTotalCount(totalCount);
      setProgress(progress);

      setChecklist(formattedChecklist);
    } catch (error) {
      console.error("Instructions yuklashda xatolik:", error);
      message.error("Checklist ma'lumotlarini yuklashda xatolik");
      setChecklist([]);
    } finally {
      setChecklistLoading(false);
    }
  };

  // ✅ Modal yopilganda barcha state'larni tozalash
  React.useEffect(() => {
    if (!visible) {
      setChecklist([]);
      setUploadedFiles([]);
      setFiles([]);
      setCurrentImage(null);
      setNewImage(null);
      setImagePreviewUrl(null);
    }
  }, [visible]);
  // ✅ Image upload handler
  const handleImageUpload = (file) => {
    // File type validation
    if (!file.type.startsWith("image/")) {
      message.error("Faqat rasm fayllari yuklash mumkin!");
      return false;
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      message.error("Rasm hajmi 5MB dan kichik bo'lishi kerak!");
      return false;
    }

    setNewImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);

    return false; // Prevent automatic upload
  };

  // ✅ Image remove handler
  const handleImageRemove = () => {
    setNewImage(null);
    setImagePreviewUrl(currentImage); // Revert to original image
  };

  // ✅ Current image remove handler
  const handleCurrentImageRemove = () => {
    setCurrentImage(null);
    setImagePreviewUrl(null);
    setNewImage(null);
  };

  // Modal ochilganda instructions ham yuklansin
  React.useEffect(() => {
    if (visible && cardData?.id) {
      loadModalData();
      loadTaskFiles();
      loadTaskInstructions(cardData.id); // Yangi qo'shildi
    }
  }, [visible, cardData?.id]);

  // Checklist funksiyalari
  const addCheckItem = () => {
    const newItem = {
      id: Date.now().toString(), // Temporary ID for new items
      text: "",
      done: false,
      isNew: true, // yangi elementlar uchun
    };
    setChecklist((prev) => [...prev, newItem]);
  };

  const toggleCheckDone = async (index) => {
    const item = checklist[index];
    const newStatus = !item.done;

    // Optimistic update
    setChecklist((prev) =>
      prev.map((check, i) =>
        i === index ? { ...check, done: newStatus } : check
      )
    );

    // Agar mavjud element bo'lsa (isNew: false), API ga yuborish
    if (!item.isNew && item.id) {
      try {
        await updateTaskInstruction(item.id, {
          name: item.text,
          status: newStatus,
          task: cardData.id,
        });
        message.success("Checklist item updated!");
      } catch (error) {
        console.error("Checklist update error:", error);
        message.error("Failed to update checklist item");
        // Rollback
        setChecklist((prev) =>
          prev.map((check, i) =>
            i === index ? { ...check, done: !newStatus } : check
          )
        );
      }
    }
  };

  const updateCheckText = (index, newText) => {
    setChecklist((prev) =>
      prev.map((check, i) =>
        i === index ? { ...check, text: newText } : check
      )
    );
  };

  const deleteCheckItem = async (index) => {
    const item = checklist[index];

    // Optimistic update
    setChecklist((prev) => prev.filter((_, i) => i !== index));

    // Agar mavjud element bo'lsa, API dan ham o'chirish
    if (!item.isNew && item.id) {
      try {
        await deleteInstruction(item.id);
        message.success("Checklist item deleted!");
      } catch (error) {
        console.error("Checklist delete error:", error);
        message.error("Failed to delete checklist item");
        // Rollback - elementni qaytarish
        setChecklist((prev) => {
          const newList = [...prev];
          newList.splice(index, 0, item);
          return newList;
        });
      }
    }
  };

  const loadModalData = async () => {
    setLoading(true);
    try {
      // Parallel ravishda users va tags yuklab olish
      const [usersResponse, tagsResponse] = await Promise.all([
        getProjectUsers(projectId),
        getTaskTags(),
      ]);

      // Users ma'lumotlarini formatlash - YANGILANDI
      let usersData = [];
      if (usersResponse.data && usersResponse.data.users) {
        usersData = usersResponse.data.users;
      } else if (Array.isArray(usersResponse.data)) {
        usersData = usersResponse.data;
      }

      const formattedUsers = usersData.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        email: user.email,
      }));

      setAvailableUsers(formattedUsers);
      setAvailableTags(tagsResponse.data.results);
    } catch (error) {
      console.error("Modal ma'lumotlarini yuklashda xatolik:", error);
      message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Task files ni yuklash funksiyasi - YANGI
  const loadTaskFiles = async () => {
    try {
      // ✅ axios o'rniga taskService funksiyasini ishlating
      const response = await getTaskFiles();

      // Task ID ga mos fayllarni filtrlash
      const taskFiles = response.data.results.filter(
        (file) => file.task === cardData.id
      );
      setUploadedFiles(taskFiles);

      console.log("Yuklangan fayllar:", taskFiles);
    } catch (error) {
      console.error("Fayllarni yuklashda xatolik:", error);
      message.error("Fayllarni yuklashda xatolik yuz berdi");
      setUploadedFiles([]);
    }
  };

  // File upload funksiyasi - yangi qo'shilgan
  const uploadFile = async (file, taskId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("task", taskId); // Task ID ni qo'shish

    try {
      // ✅ axios o'rniga taskService funksiyasini ishlating
      const response = await uploadTaskFile(formData);
      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  // Multiple files upload
  const uploadMultipleFiles = async (taskId) => {
    if (files.length === 0) return [];

    setFileUploading(true);
    const uploadPromises = files.map((file) => uploadFile(file, taskId));

    try {
      const uploadResults = await Promise.all(uploadPromises);
      message.success(
        `${uploadResults.length} ta fayl muvaffaqiyatli yuklandi!`
      );
      return uploadResults;
    } catch (error) {
      message.error("Ba'zi fayllar yuklanmadi");
      console.error("Files upload error:", error);
      return [];
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async () => {
    if (!cardData?.id) {
      message.error("Task ID topilmadi");
      return;
    }

    if (!title.trim()) {
      message.error("Task nomi kiritilishi shart");
      return;
    }

    setSaveLoading(true);

    try {
      // FormData yaratish
      const formData = new FormData();
      formData.append("name", title.trim());
      formData.append("description", description.trim() || "");
      formData.append("tasks_type", type);
      // formData.append("deadline", date ? date.format("YYYY-MM-DD") : "");
      if (date) {
        formData.append("deadline", date.format("YYYY-MM-DD"));
      }
      formData.append("project", projectId);
      formData.append("is_active", notification === "On");

      // ✅ TUZATISH: assigned maydonini FormData ga qo'shish
      // updateTask assigned uchun array ichida string kutayotgan bo'lsa:
      if (selectedAssignee) {
        // Format 1: JSON array
        formData.append("assigned", selectedAssignee);
        // Format 2: Oddiy string (yuqoridagi qatorni comment qilib, buni sinab ko'ring)
        // formData.append("assigned", selectedAssignee);

        // Format 3: Multiple entries (yuqoridagilarni comment qilib, buni sinab ko'ring)
        // formData.append("assigned", selectedAssignee);

        console.log("🎯 Selected assignee:", selectedAssignee);
        console.log("🎯 Assigned format: JSON array");
      }

      // ✅ TUZATILGAN: tags - har bir ID ni alohida yuborish
      if (Array.isArray(selectedTags) && selectedTags.length > 0) {
        // Backend har bir tag ID ni alohida kutadi
        selectedTags.forEach((tag) => {
          formData.append("tags_ids", tag);
        });

        console.log("🎯 Selected tags:", selectedTags);
        console.log("🎯 Tags format: Multiple separate fields");
      }

      // Image field
      if (newImage) {
        formData.append("task_image", newImage);
      } else if (currentImage === null && cardData.task_image) {
        formData.append("task_image", "");
      }

      // Debug: FormData ni tekshirish
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      // Task ni yangilash
      const response = await updateTask(cardData.id, formData);
      console.log("✅ Task muvaffaqiyatli yangilandi:", response.data);

      // Checklist saqlash
      await saveChecklist();

      // Fayllarni yuklash
      let newUploadedFiles = [];
      if (files.length > 0) {
        newUploadedFiles = await uploadMultipleFiles(cardData.id);
      }

      // ✅ MUHIM: Yangilangan task ma'lumotlarini qayta yuklash
      const updatedTaskResponse = await getTaskById(cardData.id);
      message.success("Task muvaffaqiyatli yangilandi!");
      // ✅ TUZATISH: To'g'ri formatda ma'lumot yuborish
      const updatedCardData = {
        id: cardData.id,
        title: updatedTaskResponse.data.name,
        name: updatedTaskResponse.data.name,
        time: updatedTaskResponse.data.deadline,
        description: updatedTaskResponse.data.description,
        column: updatedTaskResponse.data.tasks_type,
        tasks_type: updatedTaskResponse.data.tasks_type,
        assigned: updatedTaskResponse.data.assigned,
        task_image: updatedTaskResponse.data.task_image,
        // ✅ MUHIM: Progress ma'lumotlarini qo'shish
        progress: updatedTaskResponse.data.progress || 0,
        total_count: updatedTaskResponse.data.total_count || 0,
        comment_count: updatedTaskResponse.data.comment_count || 0,
        files: [...uploadedFiles, ...newUploadedFiles],
      };

      onUpdate(updatedCardData);
      onClose();
    } catch (error) {
      console.error("❌ Task yangilashda xatolik:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        // Server xabarini ko'rsatish
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        message.error(`Task yangilashda xatolik: ${errorMessage}`);
      } else if (error.request) {
        message.error("Server bilan bog'lanishda xatolik");
      } else {
        message.error("Kutilmagan xatolik yuz berdi");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // ✅ Assignee state ni ham tekshiring:
  React.useEffect(() => {
    if (visible && cardData) {
      setTitle(cardData.name || "");
      setType(cardData.tasks_type || "");
      setDate(cardData.deadline ? dayjs(cardData.deadline) : null);
      setNotification(cardData.is_active ? "On" : "Off");

      // ✅ TUZATISH: assigned maydonini to'g'ri formatlash
      if (
        cardData.assigned &&
        Array.isArray(cardData.assigned) &&
        cardData.assigned.length > 0
      ) {
        setSelectedAssignee(cardData.assigned[0]); // Birinchi elementni olish
      } else {
        setSelectedAssignee(null);
      }

      setDescription(cardData.description || "");
      setSelectedTags(cardData.tags ? cardData.tags.map((tag) => tag.id) : []);
      setProgress(cardData.progress || 0);
      setTotalCount(cardData.totalCount || 0);
      setFiles([]);
    }
  }, [cardData, visible]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // File delete funksiyasi - YANGILANGAN
  const deleteUploadedFile = async (fileId) => {
    try {
      // ✅ axios o'rniga taskService funksiyasini ishlating
      await deleteTaskFile(fileId);
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      message.success("Fayl o'chirildi");
    } catch (error) {
      message.error("Faylni o'chirishda xatolik");
      console.error("File delete error:", error);
    }
  };

  // File download funksiyasi - YANGI
  const downloadFile = (file) => {
    if (file.file) {
      // Faylni yangi tabda ochish yoki download qilish
      window.open(file.file, "_blank");
    } else {
      message.error("Fayl topilmadi");
    }
  };

  // Yangi checklist elementlarini saqlash funksiyasi
  const saveChecklist = async () => {
    const newItems = checklist.filter((item) => item.isNew && item.text.trim());

    if (newItems.length === 0) return;

    try {
      const savePromises = newItems.map((item) =>
        createInstruction({
          name: item.text.trim(),
          status: item.done,
          task: cardData.id,
        })
      );

      await Promise.all(savePromises);
      console.log(`${newItems.length} ta yangi checklist item saqlandi`);
    } catch (error) {
      console.error("Checklist saqlashda xatolik:", error);
      // message.error("Ba'zi checklist elementlari saqlanmadi");
      message.error(`Failed to add instructions: ${error}`);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
      title={
        <h2 className="px-4 text-2xl font-bold text-[#1F2937]">Edit Task</h2>
      }
      className="custom-modal"
    >
    
      <div className="px-5 sm:px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
            {/* LEFT SIDE */}
            <div className="xl:col-span-3 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
                  Task Title
                </label>
                <Input
                  style={{ height: "54px", borderRadius: "14px" }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Status
                </label>
                <Select
                  className="custom-select"
                  value={type}
                  onChange={setType}
                  style={{ height: "54px" }}
                  options={taskColumns.map((col) => ({
                    value: col.id,
                    label: col.title,
                  }))}
                />
              </div>

              {/* Time, Notification, Assignee */}
              <div className="flex justify-between items-center gap-[20px] max-sm:flex-wrap">
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mt-4 mb-2">
                    Due time
                  </label>
                  <DatePicker
                    className="w-full"
                    style={{ borderRadius: "14px", height: "54px" }}
                    value={date}
                    onChange={(date) => setDate(date)}
                    disabledDate={(current) => {
                      // O'tgan sanalarni disable qilish
                      return current && current < dayjs().startOf("day");
                    }}
                    // placeholder="Select deadline"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Notification
                  </label>
                  <Select
                    className="custom-notif"
                    value={notification}
                    onChange={setNotification}
                    options={[
                      { value: "On", label: "On" },
                      { value: "Off", label: "Off" },
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Assignee
                  </label>
                  <div className="relative">
                    <Select
                      showSearch
                      placeholder="Select assignee"
                      value={selectedAssignee}
                      optionFilterProp="label"
                      className="custom-assigne"
                      onChange={setSelectedAssignee}
                      options={availableUsers}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase()) ||
                        (option?.email ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={
                        availableUsers.length === 0 ? "No users found" : null
                      }
                    />
                    <span className="absolute top-7 right-10 -translate-y-1/2 flex items-center pointer-events-none">
                      <img
                        src={memberSearch}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Description
                </label>
                <TextArea
                  style={{ borderRadius: "14px" }}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
                  Task tags
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="xl:col-span-2 space-y-6">
              {/* ✅ Image Upload Section - Updated */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Task Image
                </label>

                {/* Image Preview */}
                {imagePreviewUrl && (
                  <div className="mb-4 relative">
                    <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={imagePreviewUrl}
                        alt="Task preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image load error:", e);
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {/* Remove current image button */}
                      <button
                        onClick={handleCurrentImageRemove}
                        className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        type="button"
                        title="Remove image"
                      >
                        <FiTrash className="w-4 h-4" />
                      </button>
                    </div>
                    {newImage && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Yangi rasm (saqlaganda yuklanadi)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Button */}
                <Upload
                  style={{ width: "100%" }}
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  accept="image/*"
                  listType="picture"
                >
                  <Button
                    className="custom-upload-btn"
                    style={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "14px",
                      fontWeight: "500",
                    }}
                    type={imagePreviewUrl ? "default" : "dashed"}
                  >
                    {imagePreviewUrl ? "Change image" : "Upload image"}
                  </Button>
                </Upload>

                {/* Current image info */}
                {currentImage && !newImage && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Mavjud rasm
                    </span>
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div className="mt-4">
                <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                  Files
                </label>

                {/* Existing uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Yuklangan fayllar:
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`uploaded-${file.id}`}
                        className="flex items-center gap-2 mb-2 p-2 border rounded-lg bg-green-50"
                      >
                        <div className="flex-1 w-[60%]">
                          <p className="text-sm font-medium truncate">
                            {file.file
                              ? file.file.split("/").pop()
                              : `File ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created:{" "}
                            {file.created_at
                              ? new Date(file.created_at).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Download file"
                        >
                          <DownloadOutlined />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm("Bu faylni o'chirmoqchimisiz?")
                            ) {
                              deleteUploadedFile(file.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete file"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New files to be uploaded */}
                {files.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Yangi fayllar (saqlaganda yuklanadi):
                    </p>
                    {files.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="flex items-center gap-2 mb-2 p-2 border rounded-lg bg-orange-50"
                      >
                        <div className="flex-1  w-[60%]">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-orange-600">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <span className="text-orange-500 text-xs px-2 py-1 bg-orange-200 rounded">
                          Yangi
                        </span>
                        <button
                          onClick={() =>
                            setFiles((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove file"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File upload */}
                <Upload
                  className="w-full"
                  multiple
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // File size check (10MB limit)
                    if (file.size > 10 * 1024 * 1024) {
                      message.error(
                        `${file.name} faylining hajmi 10MB dan katta!`
                      );
                      return false;
                    }

                    setFiles((prev) => [...prev, file]);
                    return false;
                  }}
                  accept="*/*"
                >
                  <button
                    className="text-blue-600 text-[14px] font-bold hover:text-blue-800 transition-colors"
                    disabled={fileUploading}
                  >
                    {fileUploading ? "Uploading..." : "+ add file"}
                  </button>
                </Upload>

                {/* Files summary */}
                {(uploadedFiles.length > 0 || files.length > 0) && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    Jami fayllar: {uploadedFiles.length + files.length}
                    {files.length > 0 && ` (${files.length} ta yangi)`}
                  </div>
                )}
              </div>

              {/* Instructions */}
              {/* Instructions/Checklist */}
              <div>
                <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                  Check list
                </label>

                {checklistLoading ? (
                  <div className="text-center py-4">
                    <Spin size="small" />
                    <p className="text-xs text-gray-500 mt-2">
                      Loading checklist...
                    </p>
                  </div>
                ) : (
                  <>
                    {checklist.map((check, index) => (
                      <div
                        key={check.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Checkbox
                          checked={check.done}
                          onChange={() => toggleCheckDone(index)}
                        />
                        <Input
                          value={check.text}
                          onChange={(e) =>
                            updateCheckText(index, e.target.value)
                          }
                          className="flex-1"
                          placeholder="Enter checklist item"
                          style={{ borderRadius: "8px" }}
                        />
                        <FiTrash
                          className="text-gray-500 cursor-pointer hover:text-red-500 transition-colors"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bu checklist elementini o'chirmoqchimisiz?"
                              )
                            ) {
                              deleteCheckItem(index);
                            }
                          }}
                          title="Delete checklist item"
                        />
                      </div>
                    ))}

                    <button
                      onClick={addCheckItem}
                      className="text-blue-600 text-[14px] font-bold hover:text-blue-800 transition-colors"
                      type="button"
                    >
                      + add new check
                    </button>

                    {checklist.length === 0 && !checklistLoading && (
                      <p className="text-xs text-gray-400 italic">
                        No checklist items yet. Click "add new check" to create
                        one.
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-5 pt-8 md:pt-32">
                <Button
                  onClick={onClose}
                  disabled={saveLoading || fileUploading}
                  style={{
                    width: "140px",
                    height: "48px",
                    fontSize: "17px",
                    fontWeight: "600",
                    borderRadius: "14px",
                    border: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(217, 217, 217, 0.5)",
                    color: "#595959",
                    backgroundColor: "#fff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#d9d9d9";
                    e.currentTarget.style.color = "#595959";
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.color = "#595959";
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  type="primary"
                  loading={saveLoading}
                  disabled={fileUploading}
                  style={{
                    width: "140px",
                    height: "48px",
                    fontSize: "17px",
                    fontWeight: "600",
                    borderRadius: "14px",
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.5)",
                    transition: "box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(24, 144, 255, 0.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(24, 144, 255, 0.5)")
                  }
                >
                  {saveLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NotionKanban;