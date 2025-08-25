///////////////////////////////////////////////////////////////////////////////TaskDetails.jsx
import { AiOutlinePaperClip } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import { FiTrash } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Select,
  DatePicker,
  Input,
  Upload,
  message,
} from "antd";
import Kanban from "./Kanban";
import memberSearch from "../../assets/icons/memberSearch.svg";
import {
  createTask,
  getProjectTaskById,
  getTaskTags,
  getProjectUsers,
} from "../../api/services/taskService";
import { getProjectById } from "../../api/services/projectService";
import dayjs from "dayjs";

import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const { TextArea } = Input;

// Add this function to your taskService.js file
// const getTaskTags = async () => {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     throw new Error("No authentication token found");
//   }

//   const response = await fetch('https://prototype-production-2b67.up.railway.app/project/tags/', {
//     method: 'GET',
//     headers: {
//       'accept': 'application/json',
//       'Authorization': `Bearer ${token}`, // Add Bearer token
//       'Content-Type': 'application/json',
//     },
//   });

//   if (!response.ok) {
//     if (response.status === 401) {
//       throw new Error("Authentication failed");
//     }
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return await response.json();
// };

const TaskDetails = ({ tagOptionsFromApi = [] }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Initialize with empty array, will be populated from API
  const [tagOptions, setTagOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notification, setNotification] = useState("On");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [files, setFiles] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [cards, setCards] = useState([]);
  const [type, setType] = useState("acknowledged");
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [file, setFile] = useState(null); // File object
  const [preview, setPreview] = useState(null);
  const [projectName, setProjectName] = useState("");
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId)
        .then((response) => {
          setProjectName(response.name); // Adjust according to your API response structure
        })
        .catch((error) => {
          console.error("Error fetching project:", error);
        });
    }
  }, [projectId]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);
  // Fetch tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const response = await getTaskTags();
        const tagsData = response.data;
        // API dan array qaytarsa to'g'ridan-to'g'ri ishlatamiz, aks holda bo'sh array
        setTagOptions(Array.isArray(tagsData) ? tagsData : []);
      } catch (error) {
        console.error("Error fetching tags:", error);

        // ✅ Error handling
        if (error.response?.status === 401) {
          console.error("Authentication failed. Please log in again.");
        } else if (error.response?.status === 403) {
          console.error("Permission denied to access tags.");
        } else {
          console.error("Failed to load tags");
        }

        // ✅ Fallback - bo'sh array set qilish
        setTagOptions([]);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Fetch tasks on mount
  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Please log in to access tasks");
      return;
    }

    getProjectTaskById(projectId)
      .then((response) => {
        setCards(mapTasksToCards(response.data.results));
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        if (err.response?.status === 401) {
          console.error("Session expired. Please log in again.");
        } else {
          console.error("Failed to fetch tasks");
        }
      });
  }, [projectId]);

  // Fetch project users on mount (needed for assignee names in cards)
  useEffect(() => {
    if (projectId) {
      fetchProjectUsers();
    }
  }, [projectId]);

  const fetchProjectUsers = async () => {
    setLoadingAssignees(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Please log in to access users");
        return;
      }

      const response = await getProjectUsers(projectId);

      // ✅ Yangi data structure: response.users arrayini ishlatamiz
      const users = response.users || response.data?.users || [];

      const userOptions = users.map((user) => ({
        label:
          `${user.first_name} ${user.last_name}`.trim() ||
          user.email ||
          "Unknown User",
        value: user.id,
        avatar: user.avatar || user.profile_picture,
        email: user.email,
      }));

      setAssignees(userOptions);
    } catch (error) {
      console.error("Error fetching project users:", error);
      message.error("Failed to load project users");
      setAssignees([]);
    } finally {
      setLoadingAssignees(false);
    }
  };

  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return "Not assigned";

    const user = assignees.find((u) => u.value === assigneeId);
    return user ? user.label : "Unknown user";
  };

  // Helper to map API tasks to card format
  const mapTasksToCards = (tasks) => {
    if (!Array.isArray(tasks)) {
      console.warn("Tasks is not an array:", typeof tasks, tasks);
      return [];
    }
    return tasks.map((task) => ({
      id: task.id ? task.id.toString() : Math.random().toString(),
      title: task.name || "Untitled Task",
      time: task.deadline
        ? new Date(task.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No due date",
      description: task.description,
      assignee: {
        name:
          task.assigned?.length > 0
            ? task.assigned
                .map((id) => getAssigneeName(id))
                .filter((name) => name !== "Unknown user")
                .join(", ") || "Unknown"
            : "Not assigned",
        avatar: "bg-blue-500",
      },
      progress: task.progress || 0,
      column: task.tasks_type,
      tags: task.tags || [],
      files: [],
    }));
  };

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    setIsModalOpen(false);
    // Reset form
    setTitle("");
    setType("assigned");
    setNotification("Off");
    setDate(null);
    setDescription("");
    setTags([]);
    setFiles([]);
    setChecklist([]);
    setImage(null);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      message.error("Please enter a column title");
      return;
    }
    if (!type) {
      message.error("Please select a type");
      return;
    }

    // Retrieve token
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Please log in to create a task");
      return;
    }

    // Prepare FormData for API
    const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description || ""); // Bo'sh bo'lsa ham string yuborish
    formData.append("tasks_type", type);
    formData.append("project", projectId);

    // ✅ FIX 1: Deadline format - faqat sana tanlangan bo'lsa yuborish
    if (date) {
      // Agar date string bo'lsa
      if (typeof date === "string") {
        formData.append("deadline", date);
      } else {
        // Agar dayjs object bo'lsa
        formData.append("deadline", dayjs(date).format("YYYY-MM-DD"));
      }
    }
    // deadline bo'sh bo'lsa hech narsa yubormaslik

    // ✅ FIX 2: tags_ids - faqat tanlangan bo'lsa yuborish
    if (tags && tags.length > 0) {
      tags.forEach((tagId) => {
        formData.append("tags_ids", tagId);
      });
    }

    // ✅ FIX 3: assigned - to'g'ri format
    if (selectedAssignee) {
      // Backend list kutayapti, lekin JSON.stringify ishlatmasdan
      // har bir element uchun alohida append qilish
      formData.append("assigned", selectedAssignee);
    }

    // ✅ FIX 4: task_image - faqat file tanlangan bo'lsa yuborish
    if (file && file instanceof File) {
      formData.append("task_image", file);
    }

    // Append other files if any
    files.forEach((fileItem) => {
      if (fileItem instanceof File) {
        formData.append("files", fileItem);
      }
    });

    // Debug: FormData ni tekshirish
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Call createTask API
      const response = await createTask(formData);
      const newTask = response.data;

      // Map the new task to card format
      const completedChecks = checklist.filter(
        (item) => item.text && item.text.trim() !== ""
      ).length;
      const totalChecks = checklist.length;

      // Find the assignee name from the assignees array
      const assigneeName =
        assignees.find((a) => a.value === selectedAssignee)?.label || "Unknown";

      const newCard = {
        id: newTask.id,
        title: newTask.name,
        time: newTask.deadline
          ? new Date(newTask.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "No due date",
        description: newTask.description,
        assignee: {
          name: assigneeName,
          avatar: "bg-blue-500",
        },
        tags: newTask.tags || newTask.tags_ids || tags,
        checklistProgress: `${completedChecks}/${totalChecks || 0}`,
        column: newTask.tasks_type,
        files,
      };

      setCards((prev) => [...prev, newCard]);
      message.success("Task created successfully!");

      // Reset form
      handleCancel();
    } catch (error) {
      console.error("Error creating task:", error);

      // ✅ Batafsil error log qilish
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      if (error.response?.status === 401) {
        console.error("Session expired. Please log in again.");
      } else {
        console.error(error.response?.data?.message || "Failed to create task");
      }
    }
  };

  const toggleTag = (tagId) => {
    console.log("Toggling tag ID:", tagId, "Current tags:", tags);
    setTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      return [...prev, tagId];
    });
  };

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          {projectName || "Loading..."}
        </h3>
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button
            onClick={showModal}
            className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
          >
            <span className="text-[22px]">+</span>
            <span>Add Column</span>
          </button>
        </Permission>

        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
          width={900}
          className="custom-modal"
          title={
            <h2 className="px-4 text-[22px] font-bold text-[#0A1629]">
              Add Column
            </h2>
          }
          styles={{
            body: { padding: 0 },
          }}
        >
          <div className="px-3 sm:px-4 py-8">
            <div className=" flex justify-center items-center md:justify-between flex-wrap gap-4 mb-6">
              <div className=" w-[100%] flex md:max-w-[250px] flex-col">
                <label className="mb-1" htmlFor="">
                  Column title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="name..."
                  className=" "
                  style={{
                    borderRadius: "14px",
                    height: "54px",
                    color: "#0A1629",
                    fontWeight: "regular",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div className="  w-[100%] md:max-w-[250px] flex flex-col ">
                <label className=" mb-1" htmlFor="">
                  Type
                </label>
                <Select
                  className="custom-select  flex-1 min-w-[250px]"
                  value={type}
                  onChange={setType}
                  options={[
                    { value: "assigned", label: "Assigned" },
                    { value: "acknowledged", label: "Acknowledged" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                    { value: "in_review", label: "In Review" },
                    { value: "return_for_fixes", label: "Return for Fixes" },
                    { value: "dropped", label: "Dropped" },
                    { value: "approved", label: "Approved" },
                  ]}
                />
              </div>

              <Upload
                className="w-[100%] md:max-w-[250px]"
                style={{ width: "100%" }}
                showUploadList={false}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith("image/");
                  if (!isImage) {
                    message.error("Only image files are allowed!");
                    return false;
                  }
                  setFile(file);
                  setImage(file);
                  return false;
                }}
              >
                <div className=" w-[100%] flex   flex-col">
                  <label className=" mb-1" htmlFor="">
                    Image
                  </label>
                  <Button
                    style={{ height: "54px", borderRadius: "14px" }}
                    className="  flex justify-between border border-gray-300"
                  >
                    <span>Change image</span>
                    <AiOutlinePaperClip className="text-lg" />
                  </Button>
                </div>
              </Upload>
              {file && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={preview}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.type}
                    </div>
                    <div className="mt-2">
                      <Button
                        size="small"
                        onClick={() => {
                          setFile(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                Description
              </label>
              <TextArea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ borderRadius: "14px" }}
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 flex flex-col flex-wrap md:col-span-2">
                <label
                  className=" mb-1 font-bold text-[14px] text-[#7D8592]"
                  htmlFor=""
                >
                  Deadline
                </label>
                <DatePicker
                  className=" w-full"
                  onChange={(_, dateStr) => setDate(dateStr)}
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                  }}
                />
              </div>
              <div className="relative flex-1 flex flex-col flex-wrap md:col-span-2">
                <label
                  className=" mb-1 font-bold text-[14px] text-[#7D8592]"
                  htmlFor=""
                >
                  Notification
                </label>
                <Select
                  className="w-full"
                  optionFilterProp="label"
                  style={{ borderRadius: "8px", height: "40px" }}
                  value={notification}
                  onChange={setNotification}
                  options={[
                    { value: "On", label: "On" },
                    { value: "Off", label: "Off" },
                  ]}
                />
              </div>
              <div className="relative flex-1 flex flex-col flex-wrap md:col-span-2">
                <label
                  className="  mb-1 flex-1 font-bold text-[14px] text-[#7D8592]"
                  htmlFor=""
                >
                  Assignee
                </label>
                <Select
                  showSearch
                  placeholder={
                    loadingAssignees ? "Loading users..." : "Change assignee"
                  }
                  optionFilterProp="label"
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  options={assignees}
                  loading={loadingAssignees}
                  disabled={loadingAssignees}
                  className="w-full "
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                  }}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    loadingAssignees ? "Loading..." : "No users found"
                  }
                />
                <span className="absolute inset-y-11.5 right-6 flex items-center pointer-events-none">
                  <img src={memberSearch} alt="search" className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2 font-bold">
                Task tags
              </label>

              {/* ✅ Loading state ko'rsatish */}
              {loadingTags ? (
                <div className="text-center py-4">
                  <span>Loading tags...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {tagOptions.length > 0 ? (
                    tagOptions.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
                      >
                        <input
                          type="checkbox"
                          checked={tags.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                        />
                        {tag.name}
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500">
                      No tags available
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-5  flex-row-reverse ">
              <Button
                onClick={handleSave}
                type="primary"
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
                Create
              </Button>

              <Button
                onClick={handleCancel}
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
            </div>
          </div>
        </Modal>
      </div>

      <div className="w-full">
        <div className="w-full pb-4 relative">
          <Kanban
            cards={cards}
            setCards={setCards}
            assignees={assignees}
            getAssigneeName={getAssigneeName}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

// import { AiOutlinePaperClip } from "react-icons/ai";
// import { FiTrash } from "react-icons/fi";
// import { useState } from "react";
// import {
//   Button,
//   Modal,
//   Select,
//   DatePicker,
//   Input,
//   Upload,
//   message,
// } from "antd";
// import Kanban from "./Kanban";
// import memberSearch from "../../assets/icons/memberSearch.svg";
// import { createTask } from "../../api/services/tasksService";
// import { useEffect } from "react";

// const { TextArea } = Input;

// const tagOptions = [
//   "service work",
//   "training",
//   "learning",
//   "recruitment",
//   "client support",
//   "design",
//   "planning",
//   "event/PR",
//   "maintenance",
//   "blureaucracy",
//   "R&D/Innovation",
//   "internal systems",
//   "marketing & sales",
// ];

// const assignees = [
//   { label: "Jasurbek", value: "jasurbek" },
//   { label: "Sardor", value: "sardor" },
//   { label: "Malika", value: "malika" },
//   { label: "Nodir", value: "nodir" },
// ];

// const TaskDetails = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [title, setTitle] = useState("");
//   const [notification, setNotification] = useState("Off");
//   const [date, setDate] = useState(null);
//   const [description, setDescription] = useState("");
//   const [tags, setTags] = useState([]);
//   const [image, setImage] = useState(null); // faqat rasm uchun
//   const [files, setFiles] = useState([]); // boshqa fayllar uchun
//   const [checklist, setChecklist] = useState([]);
//   const [cards, setCards] = useState([]);
//   const [type, setType] = useState("acknowledged");

//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     createTask()
//       .then((data) => setTasks(data))
//       .catch((err) => console.error("Proyektlarni olishda xatolik:", err));
//   }, []);

//   const addCheckItem = () => {
//     setChecklist((prev) => [...prev, { text: "", done: false }]);
//   };

//   const toggleCheckDone = (index) => {
//     setChecklist((prev) =>
//       prev.map((item, i) =>
//         i === index ? { ...item, done: !item.done } : item
//       )
//     );
//   };

//   const updateCheckText = (index, value) => {
//     setChecklist((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, text: value } : item))
//     );
//   };

//   const showModal = () => setIsModalOpen(true);
//   const handleCancel = () => setIsModalOpen(false);

//   const handleSave = () => {
//     // Validatsiya
//     if (!title.trim()) {
//       message.error("Please enter a column title");
//       return;
//     }
//     if (!type) {
//       message.error("Please select a type");
//       return;
//     }

//     const completedChecks = checklist.filter(
//       (item) => item.text.trim() !== ""
//     ).length;
//     const totalChecks = checklist.length;

//     const newCard = {
//       id: Date.now().toString(),
//       title,
//       time: date
//         ? new Date(date).toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })
//         : "No due date",
//       description,
//       assignee: {
//         name: selectedAssignee || "Unknown",
//         avatar: "bg-blue-500", // Placeholder avatar
//       },
//       tags,
//       checklistProgress: `${completedChecks}/${totalChecks || 0}`,
//       column: type,
//       files, // Fayllar to‘liq obyekt bo‘lib saqlanadi
//     };

//     setCards((prev) => [...prev, newCard]);
//     message.success("Task saved!");

//     // Reset form
//     setTitle("");
//     setType("");
//     setNotification("Off");
//     setDate(null);
//     setSelectedAssignee(null);
//     setDescription("");
//     setTags([]);
//     setFiles([]);
//     setChecklist([]);
//     setIsModalOpen(false);
//   };

//   const [selectedAssignee, setSelectedAssignee] = useState(null);

//   const toggleTag = (tag) => {
//     if (tags.includes(tag)) {
//       setTags((prev) => prev.filter((t) => t !== tag));
//     } else {
//       setTags((prev) => [...prev, tag]);
//     }
//   };

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
//         <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
//           Project name
//         </h3>
//         <button
//           onClick={showModal}
//           className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
//         >
//           <span className="text-[22px]">+</span>
//           <span>Add Column</span>
//         </button>

//         <Modal
//           open={isModalOpen}
//           onCancel={handleCancel}
//           footer={null}
//           centered
//           width={1000}
//           className="custom-modal"
//           title={
//             <h2 className="px-4 text-[22px] font-bold text-[#0A1629]">
//               Add Column
//             </h2>
//           }
//           styles={{
//             body: { padding: 0 }, // eski bodyStyle o‘rniga
//           }}
//         >
//           <div className="px-3 sm:px-4 py-8">
//             <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
//               {/* LEFT SIDE */}
//               <div className="xl:col-span-3 space-y-6">
//                 <div>
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     <span className="text-bold">Column title</span>
//                   </label>
//                   <Input
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="name-1"
//                     style={{
//                       borderRadius: "14px",
//                       height: "54px",
//                       color: "#0A1629",
//                       fontWeight: "regular",
//                       fontSize: "14px",
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     Type
//                   </label>
//                   <Select
//                     className="custom-select w-full"
//                     value={type}
//                     onChange={setType}
//                     options={[
//                       { value: "acknowledged", label: "Acknowledged" },
//                       { value: "assigned", label: "Assigned" },
//                       { value: "inProgress", label: "In Progress" },
//                       { value: "completed", label: "Completed" },
//                       { value: "inReview", label: "In Review" },
//                       { value: "rework", label: "Rework" },
//                       { value: "dropped", label: "Dropped" },
//                       { value: "approved", label: "Approved" },
//                     ]}
//                   />
//                 </div>

//                 {/* Due time, Notif Assigne */}
//                 <div className="flex justify-between items-center gap-[20px] flex-wrap">
//                   {/* Due Time */}
//                   <div>
//                     <label className="block font-bold text-[14px] text-[#7D8592] mt-4 mb-2">
//                       Due time
//                     </label>
//                     <DatePicker
//                       className="w-full"
//                       onChange={(_, dateStr) => setDate(dateStr)}
//                       style={{
//                         borderRadius: "14px",
//                         width: "",
//                         height: "54px",
//                       }}
//                     />
//                   </div>

//                   {/* Notification */}
//                   <div>
//                     <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                       Notification
//                     </label>
//                     <Select
//                       style={{ borderRadius: "14px" }}
//                       className="custom-notif"
//                       value={notification}
//                       onChange={setNotification}
//                       options={[
//                         { value: "On", label: "On" },
//                         { value: "Off", label: "Off" },
//                       ]}
//                     />
//                   </div>

//                   {/* Assignee (2 column span) */}
//                   <div className="md:col-span-2">
//                     <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                       Assignee
//                     </label>
//                     <div className="relative">
//                       <Select
//                         showSearch
//                         placeholder="Change assignee"
//                         optionFilterProp="label"
//                         value={selectedAssignee}
//                         onChange={setSelectedAssignee}
//                         options={assignees}
//                         className="custom-assigne"
//                         filterOption={(input, option) =>
//                           (option?.label ?? "")
//                             .toLowerCase()
//                             .includes(input.toLowerCase())
//                         }
//                       />
//                       <span className="absolute top-7 right-10 -translate-y-1/2 flex items-center pointer-events-none">
//                         <img
//                           src={memberSearch}
//                           alt="avatar"
//                           className="w-6 h-6 rounded-full object-cover"
//                         />
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     Description
//                   </label>
//                   <TextArea
//                     rows={4}
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     style={{ borderRadius: "14px" }}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm text-gray-400 mb-2 font-bold">
//                     Task tags
//                   </label>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                     {tagOptions.map((tag) => (
//                       <label
//                         key={tag}
//                         className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={tags.includes(tag)}
//                           onChange={() => toggleTag(tag)}
//                         />
//                         {tag}
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT SIDE */}
//               <div className="xl:col-span-2 space-y-6">
//                 {/* Image upload */}
//                 <div>
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     Image
//                   </label>
//                   <Upload
//                     style={{
//                       width: "100%",
//                     }}
//                     showUploadList={false}
//                     beforeUpload={(file) => {
//                       const isImage = file.type.startsWith("image/");
//                       if (!isImage) {
//                         message.error("Only image files are allowed!");
//                         return false;
//                       }
//                       setImage(file); // faqat bitta rasm
//                       return false;
//                     }}
//                   >
//                     <Button
//                       style={{ height: "54px", borderRadius: "14px" }}
//                       className="w-full flex items-center justify-between border border-gray-300"
//                     >
//                       <span>Change image</span>
//                       <AiOutlinePaperClip className="text-lg" />
//                     </Button>
//                   </Upload>

//                   {/* Image preview */}
//                   {image && (
//                     <div className="flex items-center gap-2 mt-2">
//                       <Input value={image.name} disabled className="flex-1" />
//                       <FiTrash
//                         className="text-gray-500 cursor-pointer hover:text-red-500"
//                         onClick={() => setImage(null)}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Files */}
//                 <div className="mt-4">
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     Files
//                   </label>

//                   {/* Uploaded files preview */}
//                   {files.map((file, index) => (
//                     <div key={index} className="flex items-center gap-2 mb-2">
//                       <Input
//                         value={file.name}
//                         disabled
//                         className="flex-1"
//                         style={{ height: "54px" }}
//                       />
//                       <FiTrash
//                         className="text-gray-500 cursor-pointer hover:text-red-500"
//                         onClick={() =>
//                           setFiles((prev) => prev.filter((_, i) => i !== index))
//                         }
//                       />
//                     </div>
//                   ))}

//                   {/* File Upload */}
//                   <Upload
//                     className="w-full"
//                     multiple
//                     showUploadList={false}
//                     beforeUpload={(file) => {
//                       setFiles((prev) => [...prev, file]); // faqat fayllar
//                       return false;
//                     }}
//                   >
//                     <button className="text-blue-600 text-[14px] font-bold">
//                       + add file
//                     </button>
//                   </Upload>
//                 </div>

//                 {/* Checklist */}
//                 <div>
//                   <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
//                     Check list
//                   </label>
//                   {checklist.map((check, index) => (
//                     <div key={index} className="flex items-center gap-2 mb-2">
//                       {/* Checkbox bajarilgan/bajarilmagan */}
//                       <input
//                         type="checkbox"
//                         checked={check.done}
//                         onChange={() => toggleCheckDone(index)}
//                       />
//                       {/* Matn */}
//                       <Input
//                         value={check.text}
//                         onChange={(e) => updateCheckText(index, e.target.value)}
//                         className="flex-1"
//                       />
//                       <FiTrash
//                         className="text-gray-500 cursor-pointer hover:text-red-500"
//                         onClick={() =>
//                           setChecklist((prev) =>
//                             prev.filter((_, i) => i !== index)
//                           )
//                         }
//                       />
//                     </div>
//                   ))}
//                   <button
//                     onClick={addCheckItem}
//                     className="text-blue-600 text-[14px] font-bold"
//                   >
//                     + add new check
//                   </button>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-center gap-5 pt-10 md:pt-65">
//                   <Button
//                     onClick={handleCancel}
//                     style={{
//                       width: "140px", // bir xil width
//                       height: "48px", // bir xil height
//                       fontSize: "17px",
//                       fontWeight: "600",
//                       borderRadius: "14px",
//                       border: "none",
//                       transition: "all 0.3s ease",
//                       boxShadow: "0 4px 12px rgba(217, 217, 217, 0.5)",
//                       color: "#595959", // oddiy text rangi
//                       backgroundColor: "#fff",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.borderColor = "#d9d9d9"; // borderColor hoverda o‘zgarmasin
//                       e.currentTarget.style.color = "#595959"; // text rangi hoverda ham kulrang qoladi
//                       e.currentTarget.style.backgroundColor = "#f5f5f5"; // biroz engil fon
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.borderColor = "transparent";
//                       e.currentTarget.style.color = "#595959"; // normal holatda ham kulrang
//                       e.currentTarget.style.backgroundColor = "#fff";
//                     }}
//                   >
//                     Cancel
//                   </Button>

//                   <Button
//                     onClick={handleSave}
//                     type="primary"
//                     style={{
//                       width: "140px", // bir xil width
//                       height: "48px", // bir xil height
//                       fontSize: "17px",
//                       fontWeight: "600",
//                       borderRadius: "14px",
//                       boxShadow: "0 4px 12px rgba(24, 144, 255, 0.5)",
//                       transition: "box-shadow 0.3s ease",
//                     }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.boxShadow =
//                         "0 6px 20px rgba(24, 144, 255, 0.8)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.boxShadow =
//                         "0 4px 12px rgba(24, 144, 255, 0.5)")
//                     }
//                   >
//                     Save
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Modal>
//       </div>

//       <div className="w-full">
//         <div className="w-full pb-4 relative">
//           <Kanban cards={cards} setCards={setCards} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskDetails;
