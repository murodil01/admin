import { useState, useEffect, useRef } from "react";
import { Info, Edit2, Trash, MoreVertical, Paperclip } from "lucide-react";
import { Modal, Input, Dropdown } from "antd";
import pencil from "../../assets/icons/pencil.svg";
import info from "../../assets/icons/info.svg";
import trash from "../../assets/icons/trash.svg";
import { useNavigate } from "react-router-dom";
import DepartmentsSelector from "../../components/calendar/DepartmentsSelector";
import { getDepartments } from "../../api/services/departmentService";
// import departmentIcon from "../../assets/icons/department.svg";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../api/services/taskService";
import { getProjects } from "../../api/services/projectService";

const Projects = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState(null); // "edit" | "info" | "delete"
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data.results); // Agar API response results massiv bo‘lsa
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    getDepartments()
      .then((res) => {
        // Backenddan kelgan ma'lumotni isSelected flag bilan to'ldiramiz
        const deps = res.data.map((d) => ({
          ...d,
          isSelected: false,
          avatar: d.photo, // `avatar` uchun photo maydonidan foydalanamiz
        }));
        setDepartments(deps);
      })
      .catch((err) => console.error(err));
  }, []);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]); // faqat ID lar
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false); // department tanlash uchun modal

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  //   const handleImageChange = (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setSelectedImage(reader.result);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.results); // faqat results array
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <span className="loader"></span>
      </div>
    );

  const handleAddOpen = () => setIsAddModalOpen(true);
  const handleAddClose = () => setIsAddModalOpen(false);

  const handleActionOpen = (task, type) => {
    setSelectedTask(task);
    setModalType(type);
    setIsActionModalOpen(true);
    setOpenDropdownId(null);

    if (type === "edit") {
      setTaskName(task.name);
      setDescription(task.description || "");
      setSelectedImage(task.image || null);
    }
  };

  const handleAddTask = async () => {
    try {
      const newTask = {
        name: taskName,
        description,
        image: selectedImage,
        progress: 0,
      };
      await createTask(newTask);
      await loadTasks();
      resetForm();
      handleAddClose();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = async () => {
    try {
      await updateTask(selectedTask.id, {
        name: taskName,
        description,
        image: selectedImage,
      });
      await loadTasks();
      setIsActionModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(selectedTask.id);
      await loadTasks();
      setIsActionModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const resetForm = () => {
    setTaskName("");
    setDescription("");
    setSelectedImage(null);
    setImageFile(null);
  };

  const dropdownItems = (task) => [
    {
      key: "edit",
      label: (
        <button
          onClick={() => handleActionOpen(task, "edit")}
          className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer"
        >
          <img src={pencil} alt="" /> <span>Edit</span>
        </button>
      ),
    },
    {
      key: "info",
      label: (
        <button
          onClick={() => handleActionOpen(task, "info")}
          className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer"
        >
          <img src={info} alt="" /> <span>Info</span>
        </button>
      ),
    },
    {
      key: "delete",
      label: (
        <button
          onClick={() => handleActionOpen(task, "delete")}
          className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer"
        >
          <img src={trash} alt="" /> <span>Delete</span>
        </button>
      ),
    },
  ];

  const renderModalContent = () => {
    if (!selectedTask) return null;

    switch (modalType) {
      case "edit":
        return (
          <div>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedTask.name}
                  placeholder="Edit task name"
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageInput"
                />

                <label
                  htmlFor="imageInput"
                  className="mt-1 w-full block cursor-pointer border border-dashed border-gray-400 rounded px-3 py-2 text-blue-600 hover:border-blue-500 transition"
                >
                  Change image
                </label>

                {/* Tanlangan rasmni ko‘rsatish */}
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="imageInput"
                />

                <label
                  htmlFor="imageInput"
                  className="mt-1 w-full block cursor-pointer border border-dashed border-gray-400 rounded px-3 py-2 text-blue-600 hover:border-blue-500 transition"
                >
                  Upload
                </label>

                {/* Tanlangan rasmni ko‘rsatish */}
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  defaultValue={selectedTask.description}
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-[14px] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        );
      case "info":
        return (
          <div className="flex flex-col gap-5 text-sm text-gray-700 my-5">
            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Task name</p>
              <p className="text-gray-900 font-medium col-span-2">
                {selectedTask.name}
              </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Task Creation Date</p>
              <p className="text-gray-900 font-medium col-span-2">
                16 March, 2025
              </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Created by</p>
              <div className="w-6 h-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                  alt="User"
                  className="rounded-full col-span-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Department</p>
              <div className="w-6 h-6">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                  alt="Dept"
                  className="rounded-full col-span-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Views</p>
              <p className="text-gray-900 font-medium col-span-2">38</p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Description</p>
              <p className="text-gray-700 leading-relaxed col-span-2">
                We need to design and develop a responsive user profile page for
                the web application. This page will display key user information
                including avatar, full name, email address, phone number, and
                account status. We need to design and develop a responsive user
                profile page for the web application.
              </p>
            </div>
          </div>
        );
      case "delete":
        return (
          <div className="py-5">
            <p className="text-sm">
              This action is permanent and cannot be undone.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "edit":
        return "Edit Task";
      case "info":
        return "Task Details";
      case "delete":
        return "Are you sure you want to delete this task?";
      default:
        return "";
    }
  };

  const getOkText = () => {
    switch (modalType) {
      case "edit":
        return "Save Task";
      case "info":
        return "Got it";
      case "delete":
        return "Delete";
      default:
        return "OK";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          Tasks
        </h3>
        <button
          onClick={handleAddOpen}
          className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
        >
          <span className="text-[22px]">+</span>
          <span>Add Task</span>
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid justify-items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="max-w-[300px] w-full h-[250px] border border-[#D9D9D9] rounded-[14px] p-3 bg-white shadow relative group flex flex-col gap-3 cursor-pointer"
          >
            {project.image ? (
              <button
                onClick={() => navigate(`/tasks/${project.id}`)}
                className="cursor-pointer"
              >
                <img
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  src={project.image}
                  alt="Task"
                  className="h-[134px] w-full object-contain rounded"
                />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/tasks/${project.id}`)}
                className="h-[134px] rounded mb-2 overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                <span className="text-gray-500 text-sm">No Image</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/tasks/${project.id}`)}
              className="flex items-center gap-1 mb-2 cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                {project?.progress}%
              </span>
              <div className="w-full h-2 bg-gray-300 rounded">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{ width: `${project?.progress}%` }}
                ></div>
              </div>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex items-center relative w-12 h-5">
                  {[0, 1, 2].map((offset, index) => (
                    <img
                      key={index}
                      src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                      alt="logo"
                      className={`w-5 h-5 rounded-full absolute left-${
                        index * 3
                      } z-${10 + index * 10} border border-white`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  className="font-bold text-lg cursor-pointer"
                >
                  {project.name}
                </button>
              </div>

              <Dropdown
                menu={{ items: dropdownItems(project) }}
                trigger={["click"]}
                placement="bottomRight"
                overlayClassName="w-[260px] rounded-lg shadow-lg border border-gray-200"
              >
                <button>
                  <MoreVertical className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
                </button>
              </Dropdown>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        open={isAddModalOpen}
        onCancel={handleAddClose}
        onOk={handleAddTask}
        okText="Add Task"
        cancelText={null} // cancel tugmasi ko‘rinmaydi
        footer={[
          <button
            key="submit"
            onClick={handleAddTask}
            className="bg-white text-[#979797] border border-[#979797] rounded-[15px] px-[20px] py-[15px] text-base font-bold transition"
          >
            Save Task
          </button>,
        ]}
        title={
          <div className="text-[22px] font-bold text-[#0A1629] mb-10">
            Add Task
          </div>
        }
        width={550}
        className="custom-modal"
      >
        <div>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[14px] font-bold text-[#7D8592]"
              >
                Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="M tech"
                className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-[14px] font-bold text-[#7D8592]">
                Image
              </label>

              {/* Fayl tanlash inputi yashirilgan */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageInput"
              />

              {/* Tanlash maydoni */}
              <label
                htmlFor="imageInput"
                className="mt-1 h-[50px] flex items-center justify-between w-full border border-gray-300 rounded-[14px] px-3 py-2 cursor-pointer hover:border-blue-500 transition"
              >
                <span className="text-gray-400">
                  {selectedImage ? "Upload image" : "Upload image"}
                </span>
                <Paperclip />
              </label>

              {/* Tanlangan rasm preview */}
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-[14px] font-bold text-[#7D8592]">
                Department
              </label>
              <div className="mt-1 flex items-center border border-gray-300 rounded-[14px] px-2 py-2 space-x-2">
                {selectedDepartments.map((id) => {
                  const dept = departments.find((d) => d.id === id); // rawDepartments o'rniga departments
                  return dept ? (
                    <img
                      key={id}
                      src={dept.avatar || dept.photo} // backendda photo bo'lishi mumkin
                      alt={dept.name}
                      className="w-8 h-8 rounded-full bg-blue-500 p-1"
                    />
                  ) : null;
                })}

                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-bold text-[#7D8592]">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-[14px] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
      </Modal>

      {/* Department tanlash modal */}
      <Modal
        open={isDeptModalOpen}
        onCancel={() => setIsDeptModalOpen(false)}
        onOk={() => setIsDeptModalOpen(false)}
        title="Select Departments"
        okText="Done"
        className="custom-dept-modal"
      >
        <DepartmentsSelector
          departments={departments}
          selectedIds={selectedDepartments}
          onChange={(ids) => setSelectedDepartments(ids)}
        />
      </Modal>

      {/* Action Modal (Edit / Info / Delete) */}
      <Modal
        open={!!selectedTask && isActionModalOpen}
        onCancel={() => {
          setIsActionModalOpen(false);
          setSelectedTask(null);
        }}
        onOk={() => {
          // actionlarga qarab handle qilinadi
          if (modalType === "delete") {
            console.log("Task deleted:", selectedTask);
          } else if (modalType === "edit") {
            console.log("Task edited:", selectedTask);
          }
          setIsActionModalOpen(false);
          setSelectedTask(null);
        }}
        title={getModalTitle()}
        okText={getOkText()}
        cancelText="Cancel"
        width={600}
        footer={
          modalType === "info"
            ? [
                <button
                  key="gotIt"
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="bg-[#0061fe] text-white px-5 py-2 rounded-xl cursor-pointer"
                >
                  Got it
                </button>,
              ]
            : modalType === "edit"
            ? [
                <button
                  key="saveTask"
                  onClick={() => {
                    setTasks(
                      projects.map((t) =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              name: taskName,
                              description,
                              image: selectedImage,
                            }
                          : t
                      )
                    );
                    setIsActionModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="border border-gray-400 text-gray-500 px-5 py-2 rounded-xl font-medium cursor-pointer"
                >
                  Save Task
                </button>,
              ]
            : modalType === "delete"
            ? [
                <div className="flex items-center gap-2 justify-end">
                  <button
                    key="confirmDelete"
                    onClick={() => {
                      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
                      setIsActionModalOpen(false);
                      setSelectedTask(null);
                    }}
                    className="border border-gray-400 text-gray-500 px-5 py-2 rounded-xl font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    key="cancelDelete"
                    onClick={() => {
                      setIsActionModalOpen(false);
                      setSelectedTask(null);
                    }}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>,
              ]
            : undefined
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Projects;
