import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { MoreVertical, Paperclip } from "lucide-react";
import { Modal, Input, Dropdown } from "antd";
import pencil from "../../assets/icons/pencil.svg";
import info from "../../assets/icons/info.svg";
import trash from "../../assets/icons/trash.svg";
import { useNavigate } from "react-router-dom";
import DepartmentsSelector from "../../components/calendar/DepartmentsSelector";
import { getProjects, createProject } from "../../api/services/projectService";
import { useSidebar } from "../../context";

import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const Projects = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState(null); // "edit" | "info" | "delete"
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [taskName, setTaskName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  const { collapsed } = useSidebar();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768); // 768px = md breakpoint
    };

    handleResize(); // component mount bo‘lganida chaqiramiz

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // justify-content klassini aniqlash
  const justifyClass =
    collapsed && !isSmallScreen ? "justify-start" : "justify-start";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  // const [departmentIds, setDepartmentIds] = useState([]);
  const [description, setDescription] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false); // department tanlash uchun modal

  const [selectedDepartments, setSelectedDepartments] = useState([]); // faqat ID lar
  const [allDepartments, setAllDepartments] = useState([]); // API dan kelgan to'liq obyektlar
  const [assigned, setAssigned] = useState([]);

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

  // Rasm tanlash
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // preview
      setImageFile(file); // API ga yuborish
    }
  };

  const handleAddTask = async () => {
    if (!taskName.trim()) {
      return message.error("Task name kiritilishi kerak!");
    }

    if (selectedDepartments.length === 0) {
      return message.error("Kamida bitta department tanlang!");
    }

    try {
      const formData = new FormData();
      formData.append("name", taskName);
      formData.append("description", description);

      selectedDepartments.forEach((id) =>
        formData.append("department_ids", id)
      );
      assigned.forEach((id) => formData.append("assigned", id));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      console.log("📤 Yuborilayotgan FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await createProject(formData);
      message.success("✅ Task created successfully");

      // Formni tozalash
      setTaskName("");
      setDescription("");
      setSelectedDepartments([]);
      setAssigned([]);
      setImageFile(null);
      handleAddClose();
    } catch (error) {
      console.error("❌ Task yaratishda xatolik:", error);
      message.error("Failed to create task");
    }
  };

  // const handleAddTask = async () => {
  //   try {
  //     const newTask = {
  //       name: taskName,
  //       description,
  //       image: selectedImage,
  //       progress: 0,
  //     };
  //     await createTask(newTask);
  //     await loadTasks();
  //     resetForm();
  //     handleAddClose();
  //   } catch (error) {
  //     console.error("Error adding task:", error);
  //   }
  // };

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
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button
            onClick={() => handleActionOpen(task, "edit")}
            className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer"
          >
            <img src={pencil} alt="" /> <span>Edit</span>
          </button>
        </Permission>
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
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button
            onClick={() => handleActionOpen(task, "delete")}
            className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer"
          >
            <img src={trash} alt="" /> <span>Delete</span>
          </button>
        </Permission>
      ),
    },
  ];

  const formatDate2 = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
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
                  className="block text-[14px] font-bold text-[#7D8592]"
                >
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedTask.name}
                  placeholder="Edit task name"
                  className="mt-1 w-full h-[54px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592]">
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
                  className="mt-1 w-full h-[54px] block cursor-pointer border border-dashed border-gray-400 rounded-[14px] px-3 py-[15px] text-blue-600 hover:border-blue-500 transition"
                >
                  Change image
                </label>

                {/* Tanlangan rasmni ko‘rsatish */}
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="mt-2 w-20 h-20 object-cover rounded"
                  />
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592]">
                  Department
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
                  className="mt-1 w-full h-[54px] block rounded-[14px] cursor-pointer border border-dashed border-gray-400 px-3 py-[15px] text-blue-600 hover:border-blue-500 transition"
                >
                  Select Departments
                </label>

                {/* Tanlangan rasmni ko‘rsatish */}
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="mt-2 w-20 h-20 object-cover rounded"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592]">
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
          // det
          <div className="  flex flex-col gap-5 text-sm text-gray-700 my-5">
            <h1 className=" text-[#0A1629] text-[22px] font-bold mb-3">Task Details</h1>
            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Task name</p>
              <p className="text-gray-900 font-medium col-span-2">
                {selectedTask.name}
              </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Task Creation Date</p>
              <p className="text-gray-900 font-medium col-span-2">
                {formatDate(selectedTask.created_at)}
              </p>
            </div>
            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Task's deadline</p>
              <p className="text-gray-900 font-medium col-span-2">
                {formatDate(selectedTask.updated_at)}
              </p>
            </div>


            <div className="  grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Department</p>
              <div className="w-14 h-8 ">
                <div className="flex gap-2 col-span-2">
                  {selectedTask.departments?.map(dept => (
                    <div key={dept.id} className=" flex flex-col items-center">
                      {dept.photo ? (
                        <img
                          src={dept.photo}
                          alt={`Department ${dept.id}`}
                          className="w-10 h-10 shadow rounded-full border border-blue-100"
                        />
                      ) : (
                        <div className=" bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">D</span>
                        </div>
                      )}

                    </div>
                  )) || '-'}
                </div>
              </div>
            </div>



            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Description</p>
              <p className="text-gray-700 leading-relaxed col-span-2">
                {selectedTask.description || 'No description provided.'}
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

  if (!isAuthenticated) return <div>Please login</div>;


  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          Task
        </h3>
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button
            onClick={handleAddOpen}
            className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
          >
            <span className="text-[22px]">+</span>
            <span>Add Task</span>
          </button>
        </Permission>
      </div>

      {/* Tasks Grid */}
      <div className={`flex flex-wrap gap-x-5 gap-y-5 ${justifyClass}`}>
        {projects.map((project) => (
          <div
            key={project.id}
            className="max-w-[290px] w-full  border-2 border-[#EFEFEF]  rounded-[14px] p-3 bg-white  relative group flex flex-col gap-3 cursor-pointer"
          >

            {project.image ? (
              <button
                onClick={() => navigate(`/tasks/${project.id}`)}
                className="cursor-pointer"
              >

                <img
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  src={project.image}
                  alt="Task image"
                  className="h-[134px] w-full object-contain rounded-[14px]"
                />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/tasks/${project.id}`)}
                className="h-[134px] rounded-[14px] mb-2 overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer"
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
                  {project?.departments?.length > 0 ? (
                    <div className="flex items-center">
                      {/* Faqat birinchi 3 tasini ko'rsatish */}
                      {project.departments.slice(0, 3).map((dept, index) => (
                        <div
                          key={dept.id}
                          className="relative"
                          style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                        >
                          {dept.photo ? (
                            <img
                              src={dept.photo}
                              alt={`Department ${dept.id}`}
                              className="w-[24px] h-[24px] rounded-full border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="bg-gray-200 rounded-full flex items-center justify-center w-[24px] h-[24px] border-2 border-white shadow-sm">
                              <span className="text-xs">D</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Agar 3 tadan ko'p bo'lsa, qolganlarini ko'rsatish */}
                      {project.departments.length > 3 && (
                        <div
                          className="w-[24px] h-[24px] bg-gray-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-medium"
                          style={{ marginLeft: '-8px' }}
                        >
                          +{project.departments.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  className="font-bold text-lg cursor-pointer troncate max-w-[180px] "
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
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


            <div className="flex mt-1 justify-between text-sm">
              <div>

                <span className="text-gray-900 font-medium">
                  {formatDate2(project?.created_at)}
                </span>
              </div>
              <div>

                <span className="text-gray-900 font-medium">
                  {formatDate2(project?.deadline)}
                </span>
              </div>
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
        cancelText="none"
        footer={[
          <button
            key="submit"
            onClick={handleAddTask}
            className="bg-[#0061fe] hover:bg-[#3b77d7] text-white rounded-[15px] px-[20px] py-[12px] text-base font-bold transition"
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
                placeholder="M Tech"
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
                  className="mt-2 w-20 h-20 object-cover rounded"
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
                  const dept = allDepartments.find((d) => d.id === id);
                  // const dept = rawDepartments.find((d) => d.id === id);
                  return dept ? (
                    <img
                      key={id}
                      src={dept.avatar}
                      alt={dept.name}
                      className="w-8 h-8 rounded-full bg-white p-1 border border-blue-300 bg-red"
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
        className="custom-modal"
      >
        <DepartmentsSelector
          selectedIds={selectedDepartments}
          onChange={(ids) => setSelectedDepartments(ids)}
          onDataLoaded={(data) => setAllDepartments(data)} //  API dan kelgan to'liq data
        // onChange={(ids) => {
        //   console.log("Tanlangan department IDlar:", ids);
        // }}
        // onDataLoaded={(departments) => {
        //   console.log("Modalga kelgan departments:", departments);
        // }}
        />
      </Modal>

      {/* Action Modal (Edit / Info / Delete) */}

      <div className="">
        <Modal
          className=" "
          open={isActionModalOpen}
          onCancel={() => setIsActionModalOpen(false)}
          width={814}
          onOk={modalType === 'edit' ? handleEditProject : modalType === 'delete' ? handleDeleteProject : null}
        >
          {renderModalContent()}
        </Modal>
      </div>
    </div>
  );
};

export default Projects;