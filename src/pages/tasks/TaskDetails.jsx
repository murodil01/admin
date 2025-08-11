import { AiOutlinePaperClip } from "react-icons/ai";
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
import { getTasks, createTask } from "../../api/services/taskService"; // Updated imports
import dayjs from "dayjs"; // Added for date formatting

const { TextArea } = Input;

const tagOptions = [
  "service work",
  "training",
  "learning",
  "recruitment",
  "client support",
  "design",
  "planning",
  "event/PR",
  "maintenance",
  "blureaucracy",
  "R&D/Innovation",
  "internal systems",
  "marketing & sales",
];

const assignees = [
  { label: "Jasurbek", value: "jasurbek" },
  { label: "Sardor", value: "sardor" },
  { label: "Malika", value: "malika" },
  { label: "Nodir", value: "nodir" },
];

const TaskDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notification, setNotification] = useState("Off");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [files, setFiles] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [cards, setCards] = useState([]);
  const [type, setType] = useState("assigned");
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Please log in to access tasks");
      // Optionally redirect to login page
      // window.location.href = "/login";
      return;
    }

    // Fetch tasks
    getTasks()
      .then((response) => setCards(mapTasksToCards(response.data)))
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        if (err.response?.status === 401) {
          message.error("Session expired. Please log in again.");
          // Optionally redirect to login
          // window.location.href = "/login";
        } else {
          message.error("Failed to fetch tasks");
        }
      });
  }, []);

  // Helper to map API tasks to card format
  const mapTasksToCards = (tasks) => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.name,
      time: task.deadline
        ? new Date(task.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No due date",
      description: task.description,
      assignee: {
        name: task.assigned?.length > 0 ? task.assigned[0] : "Unknown",
        avatar: "bg-blue-500",
      },
      tags: task.tags,
      checklistProgress: "0/0", // Adjust if checklist is supported
      column: task.tasks_type,
      files: [], // Adjust if files are supported
    }));
  };

  const addCheckItem = () => {
    setChecklist((prev) => [...prev, { text: "", done: false }]);
  };

  const toggleCheckDone = (index) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  const updateCheckText = (index, value) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text: value } : item))
    );
  };

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setIsModalOpen(false);
    // Reset form
    setTitle("");
    setType("acknowledged");
    setNotification("Off");
    setDate(null);
    setSelectedAssignee(null);
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
      // Optionally redirect to login
      // window.location.href = "/login";
      return;
    }

    // Prepare task data for API
    const taskData = {
      name: title,
      description,
      tasks_type: type,
      deadline: date ? dayjs(date).format("YYYY-MM-DD") : null,
      tags,
      project: "5c112bdb-be91-4e09-a062-bf244691892b", // Replace with dynamic project ID
      assigned: selectedAssignee ? [selectedAssignee] : [], // Match API's assigned field
    };

    try {
      // Call createTask API
      const response = await createTask(taskData);
      const newTask = response.data;

      // Map the new task to card format
      const completedChecks = checklist.filter(
        (item) => item.text.trim() !== ""
      ).length;
      const totalChecks = checklist.length;

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
          name: selectedAssignee || "Unknown",
          avatar: "bg-blue-500",
        },
        tags: newTask.tags,
        checklistProgress: `${completedChecks}/${totalChecks || 0}`,
        column: newTask.tasks_type,
        files, // Store files locally or handle separately
      };

      // Update cards state
      setCards((prev) => [...prev, newCard]);
      message.success("Task created successfully!");

      // Reset form
      handleCancel();
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please log in again.");
        // Optionally redirect to login
        // window.location.href = "/login";
      } else {
        message.error(error.response?.data?.message || "Failed to create task");
      }
    }
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setTags((prev) => [...prev, tag]);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          Project name
        </h3>
        <button
          onClick={showModal}
          className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
        >
          <span className="text-[22px]">+</span>
          <span>Add Column</span>
        </button>

        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
          width={1000}
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
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
              {/* LEFT SIDE */}
              <div className="xl:col-span-3 space-y-6">
                <div>
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    <span className="text-bold">Column title</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="name-1"
                    style={{
                      borderRadius: "14px",
                      height: "54px",
                      color: "#0A1629",
                      fontWeight: "regular",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    Type
                  </label>
                  <Select
                    className="custom-select w-full"
                    value={type}
                    onChange={setType}
                    options={[
                      { value: "acknowledged", label: "Acknowledged" },
                      { value: "assigned", label: "Assigned" },
                      { value: "inProgress", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                      { value: "inReview", label: "In Review" },
                      { value: "rework", label: "Rework" },
                      { value: "dropped", label: "Dropped" },
                      { value: "approved", label: "Approved" },
                    ]}
                  />
                </div>

                <div className="flex justify-between items-center gap-[20px] flex-wrap">
                  <div>
                    <label className="block font-bold text-[14px] text-[#7D8592] mt-4 mb-2">
                      Due time
                    </label>
                    <DatePicker
                      className="w-full"
                      onChange={(_, dateStr) => setDate(dateStr)}
                      style={{
                        borderRadius: "14px",
                        height: "54px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                      Notification
                    </label>
                    <Select
                      style={{ borderRadius: "14px" }}
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
                    <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                      Assignee
                    </label>
                    <div className="relative">
                      <Select
                        showSearch
                        placeholder="Change assignee"
                        optionFilterProp="label"
                        value={selectedAssignee}
                        onChange={setSelectedAssignee}
                        options={assignees}
                        className="custom-assigne"
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
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

                <div>
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

                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-bold">
                    Task tags
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {tagOptions.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
                      >
                        <input
                          type="checkbox"
                          checked={tags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="xl:col-span-2 space-y-6">
                <div>
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    Image
                  </label>
                  <Upload
                    style={{ width: "100%" }}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        message.error("Only image files are allowed!");
                        return false;
                      }
                      setImage(file);
                      return false;
                    }}
                  >
                    <Button
                      style={{ height: "54px", borderRadius: "14px" }}
                      className="w-full flex items-center justify-between border border-gray-300"
                    >
                      <span>Change image</span>
                      <AiOutlinePaperClip className="text-lg" />
                    </Button>
                  </Upload>
                  {image && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={image.name} disabled className="flex-1" />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() => setImage(null)}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    Files
                  </label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input
                        value={file.name}
                        disabled
                        className="flex-1"
                        style={{ height: "54px" }}
                      />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, i) => i !== index))
                        }
                      />
                    </div>
                  ))}
                  <Upload
                    className="w-full"
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setFiles((prev) => [...prev, file]);
                      return false;
                    }}
                  >
                    <button className="text-blue-600 text-[14px] font-bold">
                      + add file
                    </button>
                  </Upload>
                </div>

                <div>
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    Check list
                  </label>
                  {checklist.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={check.done}
                        onChange={() => toggleCheckDone(index)}
                      />
                      <Input
                        value={check.text}
                        onChange={(e) => updateCheckText(index, e.target.value)}
                        className="flex-1"
                      />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() =>
                          setChecklist((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      />
                    </div>
                  ))}
                  <button
                    onClick={addCheckItem}
                    className="text-blue-600 text-[14px] font-bold"
                  >
                    + add new check
                  </button>
                </div>

                <div className="flex justify-center gap-5 pt-10 md:pt-65">
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
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className="w-full">
        <div className="w-full pb-4 relative">
          <Kanban cards={cards} setCards={setCards} />
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