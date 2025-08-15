import React, { useEffect, useState } from "react";
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
import pencil from "../../assets/icons/pencil.svg";

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
// import { updateTaskType,deleteTask, } from "../../api/services/taskService";
import { MoreVertical } from "lucide-react";
import {
  updateTaskType,
  deleteTask,
  getTaskById,
  updateTask,
  getTaskTags,
  getProjectUsers,
  createTask,
} from "../../api/services/taskService";

const NotionKanban = ({ cards, setCards }) => {
  return (
    <div className="flex gap-5 absolute top-0 right-0 left-0 pb-4 w-full overflow-x-auto hide-scrollbar">
      <Board cards={cards} setCards={setCards} />
    </div>
  );
};

const taskColumns = [
  {
    id: "assigned",
    title: "Assigned",
    color: "bg-[#DCE8FF]",
    icon: <img src={assigned} alt="" />,
  },
  {
    id: "acknowledged",
    title: "Acknowledged",
    color: "bg-[#D5F6D7]",
    icon: <img src={acknowledged} alt="" />,
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "bg-[#FAF6E1]",
    icon: <img src={inProgress} alt="" />,
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-[#F4EBF9]",
    icon: <img src={completedIcon} alt="" />,
  },
  {
    id: "in_review",
    title: "In Review",
    color: "bg-[#FFF0E0]",
    icon: <img src={inReview} alt="" />,
  },
  {
    id: "return_for_fixes",
    title: "Return for Fixes",
    color: "bg-[#E2C7A9]",
    icon: <img src={rework} alt="" />,
  },
  {
    id: "dropped",
    title: "Dropped",
    color: "bg-[#FFDADA]",
    icon: <img src={dropped} alt="" />,
  },
  {
    id: "approved",
    title: "Approved",
    color: "bg-[#C2FFCF]",
    icon: <img src={approved} alt="" />,
  },
];

const DEFAULT_CARDS = [
  {
    id: "1",
    title: "UX sketches",
    time: "4d",
    assignee: { name: "John", avatar: "bg-red-500" },
    column: "assigned",
  },
  {
    id: "2",
    title: "Mind Map",
    time: "2d 4h",
    assignee: { name: "Mike", avatar: "bg-gray-800" },
    column: "acknowledged",
  },
  {
    id: "3",
    title: "Research reports",
    time: "2d",
    assignee: { name: "Sarah", avatar: "bg-yellow-600" },
    column: "inProgress",
  },
  {
    id: "4",
    title: "Research",
    time: "4d",
    assignee: { name: "Emma", avatar: "bg-red-500" },
    column: "completed",
  },
  {
    id: "5",
    title: "UX Login + Registration",
    time: "2d",
    assignee: { name: "John", avatar: "bg-red-500" },
    column: "inReview",
  },
  {
    id: "6",
    title: "Research reports (presentation for client)",
    time: "6h",
    assignee: { name: "Lisa", avatar: "bg-pink-500" },
    column: "rework",
  },
  {
    id: "7",
    title: "UI Login + Registration (+ other screens)",
    time: "1d 6h",
    assignee: { name: "John", avatar: "bg-red-500" },
    column: "dropped",
  },
];

const Board = ({ cards, setCards }) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleEdit = (card) => {
    setSelectedCard(card);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedCard) => {
    setCards((prev) =>
      prev.map((c) => {
        // Agar updatedCard.id yo‘q bo‘lsa, eski id ishlatiladi
        const targetId = updatedCard.id ?? c.id;
        return c.id === targetId
          ? { ...updatedCard, id: targetId } // id doim saqlanadi
          : c;
      })
    );
  };

  useEffect(() => {
    const cardData = localStorage.getItem("cards");
    try {
      setCards(cardData ? JSON.parse(cardData) : DEFAULT_CARDS);
    } catch (error) {
      console.error("❌ Error parsing localStorage 'cards':", error);
      setCards(DEFAULT_CARDS);
    }
    setHasChecked(true);
  }, []);

  useEffect(() => {
    if (hasChecked) {
      localStorage.setItem("cards", JSON.stringify(cards));
    }
  }, [cards, hasChecked]);

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll items-start">
      {taskColumns.map((col) => (
        <Column
          key={col.id}
          icon={col.icon}
          title={col.title}
          column={col.id}
          backgroundColor={col.color}
          cards={cards}
          setCards={setCards}
          onEdit={handleEdit}
        />
      ))}
      {/* <BurnBarrel setCards={setCards} /> */}

      {/* Edit Modal */}
      <EditCardModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        cardData={selectedCard}
        onUpdate={handleSaveEdit}
      />
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
    setActive(false);
    clearHighlights();

    const cardId = e.dataTransfer.getData("cardId");
    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);
    const before = element?.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];
      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;

      // 1. Optimistic UI update (darhol ko'rinishni yangilash)
      cardToTransfer = { ...cardToTransfer, column };
      copy = copy.filter((c) => c.id !== cardId);

      if (before === "-1") {
        copy.push(cardToTransfer);
      } else {
        const insertAt = copy.findIndex((c) => c.id === before);
        if (insertAt === -1) return;
        copy.splice(insertAt, 0, cardToTransfer);
      }

      setCards(copy); // UI ni yangilash

      // 2. Backendga yangilash
      try {
        await updateTaskType(cardId, column); // API so'rovi
        message.success("Task status updated!");
      } catch (error) {
        // Agar xato bo'lsa, eski holatga qaytarish
        setCards((prev) => [...prev]);
        message.error("Failed to update task status");
        console.error("Update error:", error);
      }
    }
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div
      className={`max-w-[270px] min-w-[260px] sm:max-w-[270px]  rounded-xl p-4 ${backgroundColor} shadow-sm flex flex-col my-1`}
    >
      <div className="border-b border-gray-300 pb-2 mb-3 z-10 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className={`font-semibold text-lg text-gray-800`}>{title}</h3>
        <span className="rounded text-sm text-black">
          {filteredCards.length}
        </span>
      </div>
      <AddCard column={column} setCards={setCards} />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full transition-colors ${
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
            setCards={setCards} // yangi prop qo'shildi
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
  progress,
  handleDragStart,
  onEdit,
  image,
  setCards, //yangi props
}) => {
  const [hovered, setHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [projectUsers, setProjectUsers] = useState([]); // New state for project users
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  // "Got it" modal ochilganda card ma'lumotlarini saqlash
  const openViewModal = async () => {
    setIsModalOpen(true);
    setLoading(true);

    try {
      const response = await getTaskById(id);
      console.log("Task ma'lumotlari:", response.data);
      setTaskData(response.data); // API dan kelgan ma'lumotlar
      // if (taskResponse.data.project_id) {
      //   const usersResponse = await getProjectUsers(taskResponse.data.project_id);
      //   console.log("Project users:", usersResponse.data);
      //   setProjectUsers(usersResponse.data || []); // Set users array
      // } else {
      //   console.warn("No project_id found in task data");
      //   setProjectUsers([]);
      // }
    } catch (error) {
      console.error("Data olishda xatolik:", error);
      message.error("Ma'lumotlar yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const handleMoveToColumn = async (newColumn) => {
    try {
      await updateTaskType(id, newColumn);
      message.success(`Task moved to ${newColumn}`);
      // Local state ni yangilash
      onEdit({ id, title, time, description, column: newColumn });
    } catch (error) {
      message.error("Failed to move task");
      console.error("Move error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(id);
      message.success("Task deleted successfully");
      // Local state dan o'chirish
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      message.error("Failed to delete task");
      console.error("Delete error:", error);
    }
  };

  // Edit modalni ochish funksiyasi
  const handleEditCard = async () => {
    setLoading(true);
    try {
      const response = await getTaskById(id);
      setSelectedCard(response.data);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Task olishda xatolik:", error);
      message.error("Task ma'lumotlarini yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!image) return;
    if (image instanceof File) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setImageUrl(image);
  }, [image]);

  const handleUpdateCard = (updatedCard) => {
    console.log("Updated card: ", updatedCard);
    // bu yerda serverga yoki local state'ga saqlash kodini yozasan
    setIsEditModalOpen(false);
    // Cards state ni yangilash
    setCards((prev) =>
      prev.map((card) =>
        card.id === updatedCard.id
          ? {
              ...card,
              title: updatedCard.name,
              time: updatedCard.deadline,
              description: updatedCard.description,
              column: updatedCard.tasks_type,
            }
          : card
      )
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const updatedComments = [
      ...comments,
      { name: "Current User", text: newComment },
    ];
    setComments(updatedComments);
    setNewComment("");
  };

  useEffect(() => {
    if (taskData && taskData.comments) {
      setComments(taskData.comments);
    }
  }, [taskData]);

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-grab rounded-lg bg-white p-3 shadow-sm active:cursor-grabbing border border-gray-100 hover:shadow-md transition relative"
      >
        {/* New 3 point button */}
        <div className="absolute top-2 right-1">
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit",
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleEditCard(); // Yangi funksiya chaqiriladi
                  },
                },
                {
                  key: "detail",
                  label: "Detail",
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    openViewModal();
                  },
                },
                {
                  key: "move_to",
                  label: "Move to",
                  children: taskColumns.map((col) => ({
                    key: col.id,
                    label: col.title,
                    onClick: () => handleMoveToColumn(col.id),
                  })),
                },
                {
                  key: "delete",
                  label: "Delete",
                  onClick: (e) => {
                    e.domEvent.stopPropagation();
                    handleDelete();
                  },
                },
              ],
            }}
            trigger={["click"]}
          >
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-gray-200 cursor-pointer"
            >
              <MoreVertical className="size-4" />
            </button>
          </Dropdown>
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
          title={taskData ? taskData.name : `Task Details`}
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
            </Button>,
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
                  <div className="w-full sm:w-[140px] h-[140px] bg-gray-200 flex items-center justify-center rounded">
                    <span role="img" aria-label="image" className="text-4xl">
                      🖼️
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-gray-700 leading-6">
                    {taskData.description || "No description available"}
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Files</h4>
                  <div className="flex flex-wrap gap-3">
                    <p className="text-sm text-gray-500">No files attached</p>
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">Check list</h4>
                    <span className="text-xs text-gray-500">Show</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">No checklist items</p>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Comments</h4>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    {comments.length > 0 ? (
                      comments.map((c, i) => (
                        <div key={i} className="rounded-lg bg-blue-50 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                              👤
                            </div>
                            <span className="text-sm">{c.name || "User"}</span>
                          </div>
                          <div>
                            <div className="bg-white p-1 rounded-sm">
                              <p className="text-sm text-gray-700">{c.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 mb-3">
                        No comments yet
                      </p>
                    )}

                    {/* Add new comment */}
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleAddComment}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right section */}
              <div className="md:col-span-4 space-y-4 text-sm">        

               <div>
                  <p className="text-gray-400">Assignee by</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      👤
                    </div>
                   <span>
                      {taskData && taskData.assignee 
                        ? `${taskData.assignee.first_name} ${taskData.assignee.last_name}`
                        : "Not assigned"}
                    </span>
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
                  <p className="mt-1">{taskData.tasks_type || "N/A"}</p>
                </div>

                <div>
                  <p className="text-gray-400">Type</p>
                  <p className="mt-1">N/A</p>
                </div>

                <div>
                  <p className="text-gray-400">Progress</p>
                  <p className="mt-1">{taskData.progress}%</p>
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
          // assignees={[
          //   { value: "user1", label: "Botirov Shaxobiddin" },
          //   { value: "user2", label: "John Doe" },
          // ]}
        />

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Deadline */}
          <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
            <img src={clock} alt="Deadline" />
            <span>{time || "No due date"}</span>
          </div>

          {description && (
            <div>
              <img src={descriptionIcon} alt="Description Icon" />
            </div>
          )}
          <div>
            <img src={comment} alt="Comment Icon" />
          </div>

          {/* Right Side: Avatar + Checklist */}
          <div className="flex items-center gap-2">
            <span className="bg-[#64C064] text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
              <img src={checkList} alt="" />
              {progress}
              {` /10`}
            </span>
          </div>
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

// const BurnBarrel = ({ setCards }) => {
//   const [active, setActive] = useState(false);

//   const handleDrop = async (e) => {
//     e.preventDefault();
//     const cardId = e.dataTransfer.getData("cardId");
//     if (!cardId) {
//       setActive(false);
//       return;
//     }

//     // 1) Local UI dan olib tashlash — string bilan solishtirish (type mismatch oldini olish uchun)
//     setCards((prev) => prev.filter((c) => String(c.id) !== String(cardId)));

//     // 2) (Optional) Serverda ham o'chirish — agar kerak bo'lsa
//     try {
//       await deleteTask(cardId); // agar id raqam bo'lsa ham API odatda string id qabul qiladi
//       message.success("Task successfully deleted.");
//     } catch (err) {
//       console.error("Failed to delete task on server:", err);
//       // UI da ham foydalanuvchiga xabar bering; lokal o'chirishni rollback qilishni xohlasangiz, shu yerda revert qiling
//       message.error("Server delete failed — removed locally.");
//     } finally {
//       setActive(false);
//     }
//   };

//   return (
//     <div
//       onDrop={handleDrop}
//       onDragOver={(e) => {
//         e.preventDefault();
//         setActive(true);
//       }}
//       onDragLeave={() => setActive(false)}
//       className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl
//         ${
//           active
//             ? "border-red-800 bg-red-800/20 text-red-500"
//             : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
//         }`}
//     >
//       {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
//     </div>
//   );
// };

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
    <motion.button
      layout
      onClick={() => setAdding(true)}
      className="flex w-full items-center gap-1.5 p-2 text-xs text-black font-bold hover:bg-white hover:rounded-lg cursor-pointer"
    >
      <FiPlus />
      <span>Add a card</span>
    </motion.button>
  );
};

const EditCardModal = ({ visible, onClose, cardData, onUpdate }) => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state variables
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("");
  const [date, setDate] = React.useState(null);
  const [notification, setNotification] = React.useState("Off");
  const [selectedAssignee, setSelectedAssignee] = React.useState([]);
  const [description, setDescription] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [progress, setProgress] = React.useState(0);

  // API data state
  const [availableUsers, setAvailableUsers] = React.useState([]);
  const [availableTags, setAvailableTags] = React.useState([]);
  // Modal ochilganda API dan ma'lumotlarni yuklash
  React.useEffect(() => {
    if (visible && projectId) {
      loadModalData();
    }
  }, [visible, projectId]);

  // Card ma'lumotlarini form ga yuklash
  React.useEffect(() => {
    if (visible && cardData) {
      setTitle(cardData.name || "");
      setType(cardData.tasks_type || "");
      setDate(cardData.deadline ? dayjs(cardData.deadline) : null);
      setNotification(cardData.is_active ? "On" : "Off");
      setSelectedAssignee(cardData.assigned || []);
      setDescription(cardData.description || "");
      setSelectedTags(cardData.tags ? cardData.tags.map((tag) => tag.id) : []);
      setProgress(cardData.progress || 0);
    }
  }, [cardData, visible]);

  const loadModalData = async () => {
    setLoading(true);
    try {
      // Parallel ravishda users va tags yuklab olish
      const [usersResponse, tagsResponse] = await Promise.all([
        getProjectUsers(projectId),
        getTaskTags(),
      ]);

      // Users ma'lumotlarini formatlash
      const formattedUsers = usersResponse.data.map((user) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        email: user.email,
      }));

      setAvailableUsers(formattedUsers);
      setAvailableTags(tagsResponse.data);
    } catch (error) {
      console.error("Modal ma'lumotlarini yuklashda xatolik:", error);
      message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cardData?.id) {
      message.error("Task ID topilmadi");
      return;
    }
    // Validatsiya qo'shish
    if (!title.trim()) {
      message.error("Task nomi kiritilishi shart");
      return;
    }

    setSaveLoading(true);

    try {
      const updateData = {
        name: title.trim(),
        description: description.trim() || null, // bo'sh bo'lsa null
        tasks_type: type,
        deadline: date ? date.format("YYYY-MM-DD") : null,
        project: projectId, // MUHIM: project maydoni majburiy (*)
        // assigned - UUID array formatida (swagger bo'yicha)
        assigned: selectedAssignee.length > 0 ? selectedAssignee : [],
        // tags_ids - UUID array formatida (swagger bo'yicha)
        tags_ids: selectedTags.length > 0 ? selectedTags : [],
        progress: Math.min(100, Math.max(0, progress)), // 0-100 orasida
        is_active: notification === "On",
      };
      console.log("Yuborilayotgan ma'lumotlar:", updateData); // Debug uchun
      console.log("Project ID:", projectId); // Project ID ni tekshirish
      const response = await updateTask(cardData.id, updateData);

      message.success("Task muvaffaqiyatli yangilandi!");

      // onUpdate chaqirishdan oldin response tekshirish
      if (response && response.data) {
        onUpdate(response.data);
      } else {
        // Agar response.data yo'q bo'lsa, local ma'lumotni yuborish
        onUpdate({
          ...cardData,
          ...updateData,
          id: cardData.id,
        });
      }
      onClose();
    } catch (error) {
      console.error("Task yangilashda xatolik:", error);

      // Xatolikni batafsil ko'rsatish
      if (error.response) {
        console.error("Server javobi:", error.response.data);
        console.error("Status:", error.response.status);

        // Server xatolik xabarini ko'rsatish
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.detail ||
          `Server xatolik: ${error.response.status}`;
        message.error(errorMessage);
      } else if (error.request) {
        message.error("Serverga ulanishda xatolik");
      } else {
        message.error("Kutilmagan xatolik yuz berdi");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
      title={
        <h2 className="px-5 text-2xl font-bold text-[#1F2937]">Edit Task</h2>
      }
      className="custom-modal"
    >
      <div className="px-5 py-8">
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
                  className="custom-select w-full"
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
              <div className="flex justify-between items-center gap-[20px] flex-wrap">
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mt-4 mb-2">
                    Due time
                  </label>
                  <DatePicker
                    className="w-full"
                    style={{ borderRadius: "14px", height: "54px" }}
                    value={date}
                    onChange={(date) => setDate(date)}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Notification
                  </label>
                  <Select
                    className="custom-notif w-full"
                    style={{ height: "54px" }}
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
                  <Select
                    className="custom-assigne"
                    showSearch
                    mode="multiple"
                    placeholder="Select assignees"
                    optionFilterProp="label"
                    style={{ height: "54px" }}
                    value={selectedAssignee}
                    onChange={setSelectedAssignee}
                    options={availableUsers}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
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

              {/* Progress */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  style={{ height: "54px", borderRadius: "14px" }}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  placeholder="Enter progress percentage"
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
              {/* Image Upload */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Image
                </label>
                <Upload
                  style={{ width: "100%" }}
                  showUploadList={true}
                  beforeUpload={(file) => {
                    // Handle file upload here
                    return false;
                  }}
                >
                  <Button
                    className="custom-upload-btn"
                    style={{
                      width: "100%",
                      height: "54px",
                      borderRadius: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Upload image
                  </Button>
                </Upload>
              </div>

              {/* Task Info Display */}
              <div className="space-y-4">
                <div>
                  <p className="text-[14px] font-bold text-[#7D8592] mb-2">
                    Task Information
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm ml-2">
                        {cardData?.created_at
                          ? dayjs(cardData.created_at).format("YYYY-MM-DD")
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Updated:</span>
                      <span className="text-sm ml-2">
                        {cardData?.updated_at
                          ? dayjs(cardData.updated_at).format("YYYY-MM-DD")
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Project:</span>
                      <span className="text-sm ml-2">
                        {cardData?.project || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-5 pt-10 md:pt-65">
                <Button
                  onClick={onClose}
                  disabled={saveLoading}
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

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { FaFire } from "react-icons/fa";
// import { FiPlus, FiTrash, FiEdit } from "react-icons/fi";
// import { motion } from "framer-motion";
// import assigned from "../../assets/icons/assigned.svg";
// import acknowledged from "../../assets/icons/acknowledged.svg";
// import inProgress from "../../assets/icons/inProgress.svg";
// import completedIcon from "../../assets/icons/completed.svg";
// import inReview from "../../assets/icons/inReview.svg";
// import rework from "../../assets/icons/rework.svg";
// import dropped from "../../assets/icons/dropped.svg";
// import approved from "../../assets/icons/approved.svg";
// import descriptionIcon from "../../assets/icons/description.svg";
// import comment from "../../assets/icons/comment.svg";
// import checkList from "../../assets/icons/checklist.svg";
// import clock from "../../assets/icons/clock.svg";
// import dayjs from "dayjs";
// import { DownloadOutlined } from "@ant-design/icons";
// import pencil from "../../assets/icons/pencil.svg";

// import {
//   Modal,
//   Input,
//   Select,
//   DatePicker,
//   Upload,
//   Button,
//   Checkbox,
//   message,
//   Spin,
//   Dropdown,
// } from "antd";
// import TextArea from "antd/es/input/TextArea";
// // import { updateTaskType,deleteTask, } from "../../api/services/taskService";
// import { MoreVertical } from "lucide-react";
// import {
//   updateTaskType,
//   deleteTask,
//   getTaskById,
//   updateTask,
//   getTaskTags,
//   getProjectUsers,
//   createTask,
// } from "../../api/services/taskService";

// const NotionKanban = ({ cards, setCards }) => {
//   return (
//     <div className="flex gap-5 absolute top-0 right-0 left-0 pb-4 w-full overflow-x-auto hide-scrollbar">
//       <Board cards={cards} setCards={setCards} />
//     </div>
//   );
// };

// const taskColumns = [
//   {
//     id: "assigned",
//     title: "Assigned",
//     color: "bg-[#DCE8FF]",
//     icon: <img src={assigned} alt="" />,
//   },
//   {
//     id: "acknowledged",
//     title: "Acknowledged",
//     color: "bg-[#D5F6D7]",
//     icon: <img src={acknowledged} alt="" />,
//   },
//   {
//     id: "in_progress",
//     title: "In Progress",
//     color: "bg-[#FAF6E1]",
//     icon: <img src={inProgress} alt="" />,
//   },
//   {
//     id: "completed",
//     title: "Completed",
//     color: "bg-[#F4EBF9]",
//     icon: <img src={completedIcon} alt="" />,
//   },
//   {
//     id: "in_review",
//     title: "In Review",
//     color: "bg-[#FFF0E0]",
//     icon: <img src={inReview} alt="" />,
//   },
//   {
//     id: "return_for_fixes",
//     title: "Return for Fixes",
//     color: "bg-[#E2C7A9]",
//     icon: <img src={rework} alt="" />,
//   },
//   {
//     id: "dropped",
//     title: "Dropped",
//     color: "bg-[#FFDADA]",
//     icon: <img src={dropped} alt="" />,
//   },
//   {
//     id: "approved",
//     title: "Approved",
//     color: "bg-[#C2FFCF]",
//     icon: <img src={approved} alt="" />,
//   },
// ];

// const DEFAULT_CARDS = [
//   {
//     id: "1",
//     title: "UX sketches",
//     time: "4d",
//     assignee: { name: "John", avatar: "bg-red-500" },
//     column: "assigned",
//   },
//   {
//     id: "2",
//     title: "Mind Map",
//     time: "2d 4h",
//     assignee: { name: "Mike", avatar: "bg-gray-800" },
//     column: "acknowledged",
//   },
//   {
//     id: "3",
//     title: "Research reports",
//     time: "2d",
//     assignee: { name: "Sarah", avatar: "bg-yellow-600" },
//     column: "inProgress",
//   },
//   {
//     id: "4",
//     title: "Research",
//     time: "4d",
//     assignee: { name: "Emma", avatar: "bg-red-500" },
//     column: "completed",
//   },
//   {
//     id: "5",
//     title: "UX Login + Registration",
//     time: "2d",
//     assignee: { name: "John", avatar: "bg-red-500" },
//     column: "inReview",
//   },
//   {
//     id: "6",
//     title: "Research reports (presentation for client)",
//     time: "6h",
//     assignee: { name: "Lisa", avatar: "bg-pink-500" },
//     column: "rework",
//   },
//   {
//     id: "7",
//     title: "UI Login + Registration (+ other screens)",
//     time: "1d 6h",
//     assignee: { name: "John", avatar: "bg-red-500" },
//     column: "dropped",
//   },
// ];

// const Board = ({ cards, setCards }) => {
//   const [hasChecked, setHasChecked] = useState(false);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [selectedCard, setSelectedCard] = useState(null);

//   const handleEdit = (card) => {
//     setSelectedCard(card);
//     setEditModalVisible(true);
//   };

//   const handleSaveEdit = (updatedCard) => {
//     setCards((prev) =>
//       prev.map((c) => {
//         // Agar updatedCard.id yo‘q bo‘lsa, eski id ishlatiladi
//         const targetId = updatedCard.id ?? c.id;
//         return c.id === targetId
//           ? { ...updatedCard, id: targetId } // id doim saqlanadi
//           : c;
//       })
//     );
//   };

//   useEffect(() => {
//     const cardData = localStorage.getItem("cards");
//     try {
//       setCards(cardData ? JSON.parse(cardData) : DEFAULT_CARDS);
//     } catch (error) {
//       console.error("❌ Error parsing localStorage 'cards':", error);
//       setCards(DEFAULT_CARDS);
//     }
//     setHasChecked(true);
//   }, []);

//   useEffect(() => {
//     if (hasChecked) {
//       localStorage.setItem("cards", JSON.stringify(cards));
//     }
//   }, [cards, hasChecked]);

//   return (
//     <div className="flex h-full w-full gap-3 overflow-scroll items-start">
//       {taskColumns.map((col) => (
//         <Column
//           key={col.id}
//           icon={col.icon}
//           title={col.title}
//           column={col.id}
//           backgroundColor={col.color}
//           cards={cards}
//           setCards={setCards}
//           onEdit={handleEdit}
//         />
//       ))}
//       {/* <BurnBarrel setCards={setCards} /> */}

//       {/* Edit Modal */}
//       <EditCardModal
//         visible={editModalVisible}
//         onClose={() => setEditModalVisible(false)}
//         cardData={selectedCard}
//         onUpdate={handleSaveEdit}
//       />
//     </div>
//   );
// };

// const Column = ({
//   icon,
//   title,
//   backgroundColor,
//   column,
//   cards,
//   setCards,
//   onEdit,
// }) => {
//   const [active, setActive] = useState(false);

//   const handleDragStart = (e, card) => {
//     e.dataTransfer.setData("cardId", card.id);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     highlightIndicator(e);
//     setActive(true);
//   };

//   const highlightIndicator = (e) => {
//     const indicators = getIndicators();
//     clearHighlights(indicators);
//     const el = getNearestIndicator(e, indicators);
//     if (el?.element) el.element.style.opacity = "1";
//   };

//   const clearHighlights = (els) => {
//     const indicators = els || getIndicators();
//     indicators.forEach((i) => (i.style.opacity = "0"));
//   };

//   const getNearestIndicator = (e, indicators) => {
//     const DISTANCE_OFFSET = 50;

//     return indicators.reduce(
//       (closest, child) => {
//         const box = child.getBoundingClientRect();
//         const offset = e.clientY - (box.top + DISTANCE_OFFSET);

//         if (offset < 0 && offset > closest.offset) {
//           return { offset, element: child };
//         } else {
//           return closest;
//         }
//       },
//       {
//         offset: Number.NEGATIVE_INFINITY,
//         element: indicators[indicators.length - 1],
//       }
//     );
//   };

//   const getIndicators = () =>
//     Array.from(document.querySelectorAll(`[data-column="${column}"]`));

//   const handleDragLeave = () => setActive(false);

//   const handleDrop = async (e) => {
//     setActive(false);
//     clearHighlights();

//     const cardId = e.dataTransfer.getData("cardId");
//     const indicators = getIndicators();
//     const { element } = getNearestIndicator(e, indicators);
//     const before = element?.dataset.before || "-1";

//     if (before !== cardId) {
//       let copy = [...cards];
//       let cardToTransfer = copy.find((c) => c.id === cardId);
//       if (!cardToTransfer) return;

//       // 1. Optimistic UI update (darhol ko'rinishni yangilash)
//       cardToTransfer = { ...cardToTransfer, column };
//       copy = copy.filter((c) => c.id !== cardId);

//       if (before === "-1") {
//         copy.push(cardToTransfer);
//       } else {
//         const insertAt = copy.findIndex((c) => c.id === before);
//         if (insertAt === -1) return;
//         copy.splice(insertAt, 0, cardToTransfer);
//       }

//       setCards(copy); // UI ni yangilash

//       // 2. Backendga yangilash
//       try {
//         await updateTaskType(cardId, column); // API so'rovi
//         message.success("Task status updated!");
//       } catch (error) {
//         // Agar xato bo'lsa, eski holatga qaytarish
//         setCards((prev) => [...prev]);
//         message.error("Failed to update task status");
//         console.error("Update error:", error);
//       }
//     }
//   };

//   const filteredCards = cards.filter((c) => c.column === column);

//   return (
//     <div
//       className={`max-w-[270px] min-w-[260px] sm:max-w-[270px]  rounded-xl p-4 ${backgroundColor} shadow-sm flex flex-col my-1`}
//     >
//       <div className="border-b border-gray-300 pb-2 mb-3 z-10 flex items-center gap-2">
//         <span>{icon}</span>
//         <h3 className={`font-semibold text-lg text-gray-800`}>{title}</h3>
//         <span className="rounded text-sm text-black">
//           {filteredCards.length}
//         </span>
//       </div>
//       <AddCard column={column} setCards={setCards} />
//       <div
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         className={`w-full transition-colors ${
//           active ? "bg-neutral-800/50 border-dashed" : "bg-neutral-800/0"
//         }`}
//       >
//         {filteredCards.map((c) => (
//           <Card
//             key={c.id}
//             {...c}
//             handleDragStart={handleDragStart}
//             onEdit={onEdit}
//             image={c.image}
//             setCards={setCards} // yangi prop qo'shildi
//           />
//         ))}
//         <DropIndicator beforeId="-1" column={column} />
//       </div>
//     </div>
//   );
// };

// const Card = ({
//   title,
//   id,
//   column,
//   time,
//   description,
//   progress,
//   handleDragStart,
//   onEdit,
//   image,
//   setCards, //yangi props
// }) => {
//   const [hovered, setHovered] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   const [selectedCard, setSelectedCard] = useState(null);

//   const [taskData, setTaskData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // "Got it" modal ochilganda card ma'lumotlarini saqlash
//   const openViewModal = async () => {
//     setIsModalOpen(true);
//     setLoading(true);

//     try {
//       const response = await getTaskById(id);
//       console.log("Task ma'lumotlari:", response.data);
//       setTaskData(response.data); // API dan kelgan ma'lumotlar
//     } catch (error) {
//       console.error("Task olishda xatolik:", error);
//       message.error("Task ma'lumotlarini yuklab bo'lmadi");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const [imageUrl, setImageUrl] = useState(null);

//   const handleMoveToColumn = async (newColumn) => {
//     try {
//       await updateTaskType(id, newColumn);
//       message.success(`Task moved to ${newColumn}`);
//       // Local state ni yangilash
//       onEdit({ id, title, time, description, column: newColumn });
//     } catch (error) {
//       message.error("Failed to move task");
//       console.error("Move error:", error);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await deleteTask(id);
//       message.success("Task deleted successfully");
//       // Local state dan o'chirish
//       setCards((prev) => prev.filter((card) => card.id !== id));
//     } catch (error) {
//       message.error("Failed to delete task");
//       console.error("Delete error:", error);
//     }
//   };

//   // Edit modalni ochish funksiyasi
//   const handleEditCard = async () => {
//     setLoading(true);
//     try {
//       const response = await getTaskById(id);
//       setSelectedCard(response.data);
//       setIsEditModalOpen(true);
//     } catch (error) {
//       console.error("Task olishda xatolik:", error);
//       message.error("Task ma'lumotlarini yuklab bo'lmadi");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!image) return;
//     if (image instanceof File) {
//       const url = URL.createObjectURL(image);
//       setImageUrl(url);
//       return () => URL.revokeObjectURL(url);
//     }

//     setImageUrl(image);
//   }, [image]);

//   const handleUpdateCard = (updatedCard) => {
//     console.log("Updated card: ", updatedCard);
//     // bu yerda serverga yoki local state'ga saqlash kodini yozasan
//     setIsEditModalOpen(false);
//     // Cards state ni yangilash
//     setCards((prev) =>
//       prev.map((card) =>
//         card.id === updatedCard.id
//           ? {
//               ...card,
//               title: updatedCard.name,
//               time: updatedCard.deadline,
//               description: updatedCard.description,
//               column: updatedCard.tasks_type,
//             }
//           : card
//       )
//     );
//   };

//   const handleAddComment = () => {
//     if (!newComment.trim()) return;

//     const updatedComments = [
//       ...comments,
//       { name: "Current User", text: newComment },
//     ];
//     setComments(updatedComments);
//     setNewComment("");
//   };

//   useEffect(() => {
//     if (taskData && taskData.comments) {
//       setComments(taskData.comments);
//     }
//   }, [taskData]);

//   return (
//     <>
//       <DropIndicator beforeId={id} column={column} />
//       <motion.div
//         layout
//         layoutId={id}
//         draggable="true"
//         onDragStart={(e) => handleDragStart(e, { title, id, column })}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className="cursor-grab rounded-lg bg-white p-3 shadow-sm active:cursor-grabbing border border-gray-100 hover:shadow-md transition relative"
//       >
//         {/* New 3 point button */}
//         <div className="absolute top-2 right-1">
//           <Dropdown
//             menu={{
//               items: [
//                 {
//                   key: "edit",
//                   label: "Edit",
//                   onClick: (e) => {
//                     e.domEvent.stopPropagation();
//                     handleEditCard(); // Yangi funksiya chaqiriladi
//                   },
//                 },
//                 {
//                   key: "detail",
//                   label: "Detail",
//                   onClick: (e) => {
//                     e.domEvent.stopPropagation();
//                     openViewModal();
//                   },
//                 },
//                 {
//                   key: "move_to",
//                   label: "Move to",
//                   children: taskColumns.map((col) => ({
//                     key: col.id,
//                     label: col.title,
//                     onClick: () => handleMoveToColumn(col.id),
//                   })),
//                 },
//                 {
//                   key: "delete",
//                   label: "Delete",
//                   onClick: (e) => {
//                     e.domEvent.stopPropagation();
//                     handleDelete();
//                   },
//                 },
//               ],
//             }}
//             trigger={["click"]}
//           >
//             <button
//               onClick={(e) => e.stopPropagation()}
//               className="p-1 rounded hover:bg-gray-200 cursor-pointer"
//             >
//               <MoreVertical className="size-4" />
//             </button>
//           </Dropdown>
//         </div>

//         {/* Agar image mavjud bo'lsa */}
//         {imageUrl && (
//           <div className="w-[100px] h-[100px] rounded overflow-hidden mb-2">
//             <img
//               src={imageUrl}
//               alt="card"
//               className="w-full h-full object-cover"
//             />
//           </div>
//         )}

//         {/* Title */}
//         <button
//           className="text-sm font-semibold text-gray-900 mb-3 cursor-pointer"
//           onClick={openViewModal}
//         >
//           {title}
//         </button>

//         <Modal
//           title={taskData ? taskData.name : `Task Details`}
//           open={isModalOpen}
//           onOk={() => setIsModalOpen(false)}
//           onCancel={() => setIsModalOpen(false)}
//           okText="Got it"
//           cancelText="Edit"
//           width={1000}
//           style={{
//             top: 30, // px qiymati, modal yuqoriga yaqinlashadi
//           }}
//           footer={[
//             <Button
//               key="edit"
//               onClick={() => {
//                 setIsModalOpen(false); // eski modal yopiladi
//                 handleEditCard(); // Bu yerda ham yangi funksiya
//               }}
//               style={{
//                 borderRadius: "14px",
//                 padding: "18px 16px",
//                 fontSize: "14px",
//                 fontWeight: "bolder",
//               }}
//             >
//               <span className="text-gray-500">Edit</span>{" "}
//               <img src={pencil} className="w-[14px]" alt="pencil" />
//             </Button>,
//             <Button
//               key="gotit"
//               type="primary"
//               style={{
//                 borderRadius: "14px",
//                 padding: "18px 24px",
//                 fontSize: "14px",
//                 fontWeight: "bolder",
//               }}
//               onClick={() => setIsModalOpen(false)}
//             >
//               Got it
//             </Button>,
//           ]}
//         >
//           {loading ? (
//             <div className="flex justify-center items-center h-[400px]">
//               <Spin size="large" />
//             </div>
//           ) : taskData ? (
//             <div className="grid grid-cols-1 md:grid-cols-10 gap-6 md:gap-10">
//               {/* Left section */}
//               <div className="md:col-span-6 space-y-6">
//                 {/* Top section */}
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="w-full sm:w-[140px] h-[140px] bg-gray-200 flex items-center justify-center rounded">
//                     <span role="img" aria-label="image" className="text-4xl">
//                       🖼️
//                     </span>
//                   </div>
//                   <div className="flex-1 text-sm text-gray-700 leading-6">
//                     {taskData.description || "No description available"}
//                   </div>
//                 </div>

//                 {/* Files */}
//                 <div>
//                   <h4 className="font-semibold text-sm mb-3">Files</h4>
//                   <div className="flex flex-wrap gap-3">
//                     <p className="text-sm text-gray-500">No files attached</p>
//                   </div>
//                 </div>

//                 {/* Checklist */}
//                 <div>
//                   <div className="flex justify-between items-center mb-2">
//                     <h4 className="font-semibold text-sm">Check list</h4>
//                     <span className="text-xs text-gray-500">Show</span>
//                   </div>
//                   <div className="flex flex-col gap-3">
//                     <p className="text-sm text-gray-500">No checklist items</p>
//                   </div>
//                 </div>

//                 {/* Comments */}
//                 <div>
//                   <h4 className="font-semibold text-sm mb-3">Comments</h4>
//                   <div className="p-4 bg-blue-50 rounded-xl">
//                     {comments.length > 0 ? (
//                       comments.map((c, i) => (
//                         <div key={i} className="rounded-lg bg-blue-50 mb-3">
//                           <div className="flex items-center gap-2 mb-2">
//                             <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
//                               👤
//                             </div>
//                             <span className="text-sm">{c.name || "User"}</span>
//                           </div>
//                           <div>
//                             <div className="bg-white p-1 rounded-sm">
//                               <p className="text-sm text-gray-700">{c.text}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-sm text-gray-500 mb-3">
//                         No comments yet
//                       </p>
//                     )}

//                     {/* Add new comment */}
//                     <div className="mt-3 flex gap-2">
//                       <input
//                         type="text"
//                         placeholder="Add a comment"
//                         value={newComment}
//                         onChange={(e) => setNewComment(e.target.value)}
//                         className="flex-1 border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none"
//                       />
//                       <button
//                         onClick={handleAddComment}
//                         className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600"
//                       >
//                         ➤
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right section */}
//               <div className="md:col-span-4 space-y-4 text-sm">
//                 <div>
//                   <p className="text-gray-400">Assigned by</p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
//                       👤
//                     </div>
//                     <span>N/A</span>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Assignee</p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
//                       👤
//                     </div>
//                     <span>
//                       {taskData.assigned && taskData.assigned.length > 0
//                         ? taskData.assigned.join(", ")
//                         : "N/A"}
//                     </span>
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Date</p>
//                   <p className="mt-1">
//                     {taskData.deadline
//                       ? dayjs(taskData.deadline).format("YYYY-MM-DD")
//                       : "N/A"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Notification</p>
//                   <p className="mt-1">{taskData.is_active ? "On" : "Off"}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Status</p>
//                   <p className="mt-1">{taskData.tasks_type || "N/A"}</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Type</p>
//                   <p className="mt-1">N/A</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Progress</p>
//                   <p className="mt-1">{taskData.progress}%</p>
//                 </div>

//                 <div>
//                   <p className="text-gray-400">Tags</p>
//                   <div className="flex flex-wrap gap-2 mt-1">
//                     {taskData.tags && taskData.tags.length > 0 ? (
//                       taskData.tags.map((tag, i) => (
//                         <span
//                           key={i}
//                           className="bg-gray-200 px-2 py-1 rounded text-xs"
//                         >
//                           {tag.name}
//                         </span>
//                       ))
//                     ) : (
//                       <p>N/A</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="text-center text-gray-500">No task data available</p>
//           )}
//         </Modal>

//         <EditCardModal
//           visible={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           cardData={selectedCard}
//           onUpdate={handleUpdateCard}
//           // assignees={[
//           //   { value: "user1", label: "Botirov Shaxobiddin" },
//           //   { value: "user2", label: "John Doe" },
//           // ]}
//         />

//         {/* Bottom Row */}
//         <div className="flex items-center justify-between text-xs text-gray-500">
//           {/* Deadline */}
//           <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
//             <img src={clock} alt="Deadline" />
//             <span>{time || "No due date"}</span>
//           </div>

//           {description && (
//             <div>
//               <img src={descriptionIcon} alt="Description Icon" />
//             </div>
//           )}
//           <div>
//             <img src={comment} alt="Comment Icon" />
//           </div>

//           {/* Right Side: Avatar + Checklist */}
//           <div className="flex items-center gap-2">
//             <span className="bg-[#64C064] text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
//               <img src={checkList} alt="" />
//               {progress}
//               {` /10`}
//             </span>
//           </div>
//         </div>
//       </motion.div>
//     </>
//   );
// };

// const DropIndicator = ({ beforeId, column }) => (
//   <div
//     data-before={beforeId || "-1"}
//     data-column={column}
//     className="my-0.5 h-2 w-full bg-violet-400 opacity-0"
//   />
// );

// // const BurnBarrel = ({ setCards }) => {
// //   const [active, setActive] = useState(false);

// //   const handleDrop = async (e) => {
// //     e.preventDefault();
// //     const cardId = e.dataTransfer.getData("cardId");
// //     if (!cardId) {
// //       setActive(false);
// //       return;
// //     }

// //     // 1) Local UI dan olib tashlash — string bilan solishtirish (type mismatch oldini olish uchun)
// //     setCards((prev) => prev.filter((c) => String(c.id) !== String(cardId)));

// //     // 2) (Optional) Serverda ham o'chirish — agar kerak bo'lsa
// //     try {
// //       await deleteTask(cardId); // agar id raqam bo'lsa ham API odatda string id qabul qiladi
// //       message.success("Task successfully deleted.");
// //     } catch (err) {
// //       console.error("Failed to delete task on server:", err);
// //       // UI da ham foydalanuvchiga xabar bering; lokal o'chirishni rollback qilishni xohlasangiz, shu yerda revert qiling
// //       message.error("Server delete failed — removed locally.");
// //     } finally {
// //       setActive(false);
// //     }
// //   };

// //   return (
// //     <div
// //       onDrop={handleDrop}
// //       onDragOver={(e) => {
// //         e.preventDefault();
// //         setActive(true);
// //       }}
// //       onDragLeave={() => setActive(false)}
// //       className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl
// //         ${
// //           active
// //             ? "border-red-800 bg-red-800/20 text-red-500"
// //             : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
// //         }`}
// //     >
// //       {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
// //     </div>
// //   );
// // };

// const AddCard = ({ column, setCards }) => {
//   const [text, setText] = useState("");
//   const [adding, setAdding] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { projectId } = useParams();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;

//     const newCard = {
//       name: text.trim(),
//       column,
//       // title: text.trim(),
//       tasks_type: column,
//       // id: Math.random().toString(),
//       // time: "",
//       // assignee: null,
//       description: "", // default qiymat
//       project: projectId, // loyiha ID sini dynamic qilib olish kerak
//       tags_ids: [], // loyiha ID sini dynamic qilib olish kerak
//     };
//     setLoading(true);
//     try {
//       // 1. Backendga yuborish
//       const response = await createTask(newCard);
//       const createdTask = response.data;

//       // 2. UI ga yangi card qo'shish
//       setCards((prev) => [
//         ...prev,
//         {
//           id: createdTask.id,
//           title: createdTask.name,
//           column: createdTask.tasks_type,
//           time: createdTask.deadline || "",
//           assignee: createdTask.assigned
//             ? {
//                 name: createdTask.assigned[0],
//                 avatar: "bg-blue-500",
//               }
//             : null,
//         },
//       ]);
//       // setCards((prev) => [...prev, newCard]);
//       setText("");
//       setAdding(false);
//       message.success("Task created successfully!");
//     } catch (error) {
//       console.error("Failed to create task:", error);
//       message.error(error.response?.data?.message || "Failed to create task");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return adding ? (
//     <motion.form layout onSubmit={handleSubmit}>
//       <textarea
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         autoFocus
//         placeholder="Add new task..."
//         className="w-full rounded-lg border border-violet-400 bg-white p-3 text-sm text-gray-700 placeholder-violet-300 focus:outline-0"
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             handleSubmit(e);
//           }
//         }}
//         disabled={loading}
//       />
//       <div className="mt-1.5 flex items-center justify-end gap-1.5">
//         <button
//           type="button"
//           onClick={() => setAdding(false)}
//           className="px-3 py-1.5 text-xs text-neutral-600 font-bold hover:text-neutral-500"
//           disabled={loading}
//         >
//           Close
//         </button>
//         <button
//           type="submit"
//           className="flex items-center gap-1.5 rounded-lg bg-neutral-50 font-bold px-3 py-1.5 text-xs text-neutral-95"
//           disabled={loading}
//         >
//           {loading ? "Creating..." : "Add"}
//           {!loading && <FiPlus />}
//         </button>
//       </div>
//     </motion.form>
//   ) : (
//     <motion.button
//       layout
//       onClick={() => setAdding(true)}
//       className="flex w-full items-center gap-1.5 p-2 text-xs text-black font-bold hover:bg-white hover:rounded-lg cursor-pointer"
//     >
//       <FiPlus />
//       <span>Add a card</span>
//     </motion.button>
//   );
// };

// const EditCardModal = ({ visible, onClose, cardData, onUpdate }) => {
//   const { projectId } = useParams();
//   const [loading, setLoading] = useState(false);
//   const [saveLoading, setSaveLoading] = useState(false);

//   // Form state variables
//   const [title, setTitle] = React.useState("");
//   const [type, setType] = React.useState("");
//   const [date, setDate] = React.useState(null);
//   const [notification, setNotification] = React.useState("Off");
//   const [selectedAssignee, setSelectedAssignee] = React.useState([]);
//   const [description, setDescription] = React.useState("");
//   const [selectedTags, setSelectedTags] = React.useState([]);
//   const [progress, setProgress] = React.useState(0);

//   // API data state
//   const [availableUsers, setAvailableUsers] = React.useState([]);
//   const [availableTags, setAvailableTags] = React.useState([]);
//   // Modal ochilganda API dan ma'lumotlarni yuklash
//   React.useEffect(() => {
//     if (visible && projectId) {
//       loadModalData();
//     }
//   }, [visible, projectId]);

//   // Card ma'lumotlarini form ga yuklash
//   React.useEffect(() => {
//     if (visible && cardData) {
//       setTitle(cardData.name || "");
//       setType(cardData.tasks_type || "");
//       setDate(cardData.deadline ? dayjs(cardData.deadline) : null);
//       setNotification(cardData.is_active ? "On" : "Off");
//       setSelectedAssignee(cardData.assigned || []);
//       setDescription(cardData.description || "");
//       setSelectedTags(cardData.tags ? cardData.tags.map((tag) => tag.id) : []);
//       setProgress(cardData.progress || 0);
//     }
//   }, [cardData, visible]);

//   const loadModalData = async () => {
//     setLoading(true);
//     try {
//       // Parallel ravishda users va tags yuklab olish
//       const [usersResponse, tagsResponse] = await Promise.all([
//         getProjectUsers(projectId),
//         getTaskTags(),
//       ]);

//       // Users ma'lumotlarini formatlash
//       const formattedUsers = usersResponse.data.map((user) => ({
//         value: user.id,
//         label: `${user.first_name} ${user.last_name}`,
//         email: user.email,
//       }));

//       setAvailableUsers(formattedUsers);
//       setAvailableTags(tagsResponse.data);
//     } catch (error) {
//       console.error("Modal ma'lumotlarini yuklashda xatolik:", error);
//       message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!cardData?.id) {
//       message.error("Task ID topilmadi");
//       return;
//     }
//     // Validatsiya qo'shish
//     if (!title.trim()) {
//       message.error("Task nomi kiritilishi shart");
//       return;
//     }

//     setSaveLoading(true);

//     try {
//       const updateData = {
//         name: title.trim(),
//         description: description.trim() || null, // bo'sh bo'lsa null
//         tasks_type: type,
//         deadline: date ? date.format("YYYY-MM-DD") : null,
//         project: projectId, // MUHIM: project maydoni majburiy (*)
//         // assigned - UUID array formatida (swagger bo'yicha)
//         assigned: selectedAssignee.length > 0 ? selectedAssignee : [],
//         // tags_ids - UUID array formatida (swagger bo'yicha)
//         tags_ids: selectedTags.length > 0 ? selectedTags : [],
//         progress: Math.min(100, Math.max(0, progress)), // 0-100 orasida
//         is_active: notification === "On",
//       };
//       console.log("Yuborilayotgan ma'lumotlar:", updateData); // Debug uchun
//       console.log("Project ID:", projectId); // Project ID ni tekshirish
//       const response = await updateTask(cardData.id, updateData);

//       message.success("Task muvaffaqiyatli yangilandi!");

//       // onUpdate chaqirishdan oldin response tekshirish
//       if (response && response.data) {
//         onUpdate(response.data);
//       } else {
//         // Agar response.data yo'q bo'lsa, local ma'lumotni yuborish
//         onUpdate({
//           ...cardData,
//           ...updateData,
//           id: cardData.id,
//         });
//       }
//       onClose();
//     } catch (error) {
//       console.error("Task yangilashda xatolik:", error);

//       // Xatolikni batafsil ko'rsatish
//       if (error.response) {
//         console.error("Server javobi:", error.response.data);
//         console.error("Status:", error.response.status);

//         // Server xatolik xabarini ko'rsatish
//         const errorMessage =
//           error.response.data?.message ||
//           error.response.data?.error ||
//           error.response.data?.detail ||
//           `Server xatolik: ${error.response.status}`;
//         message.error(errorMessage);
//       } else if (error.request) {
//         message.error("Serverga ulanishda xatolik");
//       } else {
//         message.error("Kutilmagan xatolik yuz berdi");
//       }
//     } finally {
//       setSaveLoading(false);
//     }
//   };

//   const toggleTag = (tagId) => {
//     setSelectedTags((prev) =>
//       prev.includes(tagId)
//         ? prev.filter((id) => id !== tagId)
//         : [...prev, tagId]
//     );
//   };

//   return (
//     <Modal
//       open={visible}
//       onCancel={onClose}
//       footer={null}
//       centered
//       width={1000}
//       title={
//         <h2 className="px-5 text-2xl font-bold text-[#1F2937]">Edit Task</h2>
//       }
//       className="custom-modal"
//     >
//       <div className="px-5 py-8">
//         {loading ? (
//           <div className="flex justify-center items-center h-[400px]">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
//             {/* LEFT SIDE */}
//             <div className="xl:col-span-3 space-y-6">
//               {/* Title */}
//               <div>
//                 <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
//                   Task Title
//                 </label>
//                 <Input
//                   style={{ height: "54px", borderRadius: "14px" }}
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Enter task title"
//                 />
//               </div>

//               {/* Type */}
//               <div>
//                 <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                   Status
//                 </label>
//                 <Select
//                   className="custom-select w-full"
//                   value={type}
//                   onChange={setType}
//                   style={{ height: "54px" }}
//                   options={taskColumns.map((col) => ({
//                     value: col.id,
//                     label: col.title,
//                   }))}
//                 />
//               </div>

//               {/* Time, Notification, Assignee */}
//               <div className="flex justify-between items-center gap-[20px] flex-wrap">
//                 <div>
//                   <label className="block text-[14px] font-bold text-[#7D8592] mt-4 mb-2">
//                     Due time
//                   </label>
//                   <DatePicker
//                     className="w-full"
//                     style={{ borderRadius: "14px", height: "54px" }}
//                     value={date}
//                     onChange={(date) => setDate(date)}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                     Notification
//                   </label>
//                   <Select
//                     className="custom-notif w-full"
//                     style={{ height: "54px" }}
//                     value={notification}
//                     onChange={setNotification}
//                     options={[
//                       { value: "On", label: "On" },
//                       { value: "Off", label: "Off" },
//                     ]}
//                   />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                     Assignee
//                   </label>
//                   <Select
//                     className="custom-assigne"
//                     showSearch
//                     mode="multiple"
//                     placeholder="Select assignees"
//                     optionFilterProp="label"
//                     style={{ height: "54px" }}
//                     value={selectedAssignee}
//                     onChange={setSelectedAssignee}
//                     options={availableUsers}
//                     filterOption={(input, option) =>
//                       (option?.label ?? "")
//                         .toLowerCase()
//                         .includes(input.toLowerCase())
//                     }
//                   />
//                 </div>
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                   Description
//                 </label>
//                 <TextArea
//                   style={{ borderRadius: "14px" }}
//                   rows={4}
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder="Enter task description"
//                 />
//               </div>

//               {/* Progress */}
//               <div>
//                 <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                   Progress (%)
//                 </label>
//                 <Input
//                   type="number"
//                   min={0}
//                   max={100}
//                   style={{ height: "54px", borderRadius: "14px" }}
//                   value={progress}
//                   onChange={(e) => setProgress(Number(e.target.value))}
//                   placeholder="Enter progress percentage"
//                 />
//               </div>

//               {/* Tags */}
//               <div>
//                 <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
//                   Task tags
//                 </label>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                   {availableTags.map((tag) => (
//                     <label
//                       key={tag.id}
//                       className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag.id)}
//                         onChange={() => toggleTag(tag.id)}
//                       />
//                       {tag.name}
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT SIDE */}
//             <div className="xl:col-span-2 space-y-6">
//               {/* Image Upload */}
//               <div>
//                 <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
//                   Image
//                 </label>
//                 <Upload
//                   style={{ width: "100%" }}
//                   showUploadList={true}
//                   beforeUpload={(file) => {
//                     // Handle file upload here
//                     return false;
//                   }}
//                 >
//                   <Button
//                     className="custom-upload-btn"
//                     style={{
//                       width: "100%",
//                       height: "54px",
//                       borderRadius: "14px",
//                       fontWeight: "500",
//                     }}
//                   >
//                     Upload image
//                   </Button>
//                 </Upload>
//               </div>

//               {/* Task Info Display */}
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-[14px] font-bold text-[#7D8592] mb-2">
//                     Task Information
//                   </p>
//                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
//                     <div>
//                       <span className="text-sm text-gray-600">Created:</span>
//                       <span className="text-sm ml-2">
//                         {cardData?.created_at
//                           ? dayjs(cardData.created_at).format("YYYY-MM-DD")
//                           : "N/A"}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Updated:</span>
//                       <span className="text-sm ml-2">
//                         {cardData?.updated_at
//                           ? dayjs(cardData.updated_at).format("YYYY-MM-DD")
//                           : "N/A"}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-sm text-gray-600">Project:</span>
//                       <span className="text-sm ml-2">
//                         {cardData?.project || "N/A"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Buttons */}
//               <div className="flex justify-center gap-5 pt-10 md:pt-65">
//                 <Button
//                   onClick={onClose}
//                   disabled={saveLoading}
//                   style={{
//                     width: "140px",
//                     height: "48px",
//                     fontSize: "17px",
//                     fontWeight: "600",
//                     borderRadius: "14px",
//                     border: "none",
//                     transition: "all 0.3s ease",
//                     boxShadow: "0 4px 12px rgba(217, 217, 217, 0.5)",
//                     color: "#595959",
//                     backgroundColor: "#fff",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.borderColor = "#d9d9d9";
//                     e.currentTarget.style.color = "#595959";
//                     e.currentTarget.style.backgroundColor = "#f5f5f5";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.borderColor = "transparent";
//                     e.currentTarget.style.color = "#595959";
//                     e.currentTarget.style.backgroundColor = "#fff";
//                   }}
//                 >
//                   Cancel
//                 </Button>

//                 <Button
//                   onClick={handleSave}
//                   type="primary"
//                   loading={saveLoading}
//                   style={{
//                     width: "140px",
//                     height: "48px",
//                     fontSize: "17px",
//                     fontWeight: "600",
//                     borderRadius: "14px",
//                     boxShadow: "0 4px 12px rgba(24, 144, 255, 0.5)",
//                     transition: "box-shadow 0.3s ease",
//                   }}
//                   onMouseEnter={(e) =>
//                     (e.currentTarget.style.boxShadow =
//                       "0 6px 20px rgba(24, 144, 255, 0.8)")
//                   }
//                   onMouseLeave={(e) =>
//                     (e.currentTarget.style.boxShadow =
//                       "0 4px 12px rgba(24, 144, 255, 0.5)")
//                   }
//                 >
//                   {saveLoading ? "Saving..." : "Save"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default NotionKanban;
