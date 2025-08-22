import { useState, useEffect, useRef, useMemo } from "react";
import { message } from "antd";
import { MoreVertical, Paperclip, Search } from "lucide-react";
import { Modal, Input, Dropdown } from "antd";
import pencil from "../../assets/icons/pencil.svg";
import info from "../../assets/icons/info.svg";
import trash from "../../assets/icons/trash.svg";
import { useNavigate } from "react-router-dom";
import DepartmentsSelector from "../../components/calendar/DepartmentsSelector";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../api/services/projectService";
import { getUsers } from "../../api/services/userService";
import { useSidebar } from "../../context";

const Projects = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [taskName, setTaskName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();
  const { collapsed } = useSidebar();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [deadline, setDeadline] = useState("");
  
  // ✅ Avval search state
  const [searchTerm, setSearchTerm] = useState('');

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allDepartmentsSelected, setAllDepartmentsSelected] = useState(false);
  
  const [deptModalFilteredUsers, setDeptModalFilteredUsers] = useState([]);

    const filteredUsersBySearch = useMemo(() => {
    if (!searchTerm.trim()) return deptModalFilteredUsers;
    
    return deptModalFilteredUsers.filter(user => 
      `${user.first_name || ''} ${user.last_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [deptModalFilteredUsers, searchTerm]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const justifyClass =
    collapsed && !isSmallScreen ? "justify-start" : "justify-start";

  const [loading, setLoading] = useState(true);  
  // Users uchun state'lar

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setAllUsers(response.data || response.results || response);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Department modal ichidagi userlarni filter qilish
  // YANGI KOD (yuqoridagi o'rniga qo'ying):
  useEffect(() => {
    if (selectedDepartments.length > 0 && allUsers.length > 0) {
      if (selectedDepartments.includes("none")) {
        setDeptModalFilteredUsers([]);
        return;
      }
  
      // ✅ "All" tanlanganda hamma userlar
      if (selectedDepartments.includes("all")) {
        setDeptModalFilteredUsers(allUsers);
        return;
      }
  
      const filtered = allUsers.filter(
        (user) =>
          user.department?.id &&
          selectedDepartments.includes(user.department.id)
      );
      setDeptModalFilteredUsers(filtered);
    } else {
      setDeptModalFilteredUsers([]);
    }
  }, [selectedDepartments, allUsers]);


  useEffect(() => {
    if (selectedDepartments.length > 0 && allUsers.length > 0) {
      if (selectedDepartments.includes("none")) {
        setFilteredUsers([]);
        return;
      }
  
      // ✅ Agar "all" tanlangan bo'lsa - hamma userlarni ko'rsatish
      if (selectedDepartments.includes("all")) {
        setFilteredUsers(allUsers);
        return;
      }
  
      const filtered = allUsers.filter(
        (user) =>
          user.department?.id &&
          selectedDepartments.includes(user.department.id)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [selectedDepartments, allUsers]);
const handleSelectAllUsers = () => {
  if (deptModalFilteredUsers.length > 0) {
    const allFilteredUserIds = deptModalFilteredUsers.map(user => user.id);
    const allSelected = allFilteredUserIds.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      // Deselect all filtered users
      setSelectedUsers(prev => prev.filter(id => !allFilteredUserIds.includes(id)));
    } else {
      // Select all filtered users
      setSelectedUsers(prev => [...new Set([...prev, ...allFilteredUserIds])]);
    }
  }
};
  // ✅ Edit modal'da assigned userlarni ko'r satish uchun useEffect qo'shing
  useEffect(() => {
    // Edit modal ochilganda, mavjud assigned userlarni filteredUsers ga qo'shish
    if (modalType === "edit" && selectedTask?.assigned && allUsers.length > 0) {
      const currentAssignedUsers = selectedTask.assigned
        .map((user) =>
          typeof user === "object" ? user : allUsers.find((u) => u.id === user)
        )
        .filter(Boolean);

      // Agar assigned userlar boshqa departmentdan bo'lsa, ularni ham ko'rsatish
      const currentFilteredUsers = [...filteredUsers];
      currentAssignedUsers.forEach((user) => {
        if (!currentFilteredUsers.find((u) => u.id === user.id)) {
          currentFilteredUsers.push(user);
        }
      });

      // Bu yerda filteredUsers ni yangilamaslik kerak, chunki u department bo'yicha filtrlanadi
      // Lekin assigned userlarni alohida track qilish kerak
    }
  }, [modalType, selectedTask, allUsers, filteredUsers]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data.results);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <span className="loader"></span>
      </div>
    );

  const handleAddOpen = () => setIsAddModalOpen(true);

  const handleAddClose = () => {
    setIsAddModalOpen(false);
    // Form ni tozalash
    setTaskName("");
    setDescription("");
    setDeadline(""); // ✅ Bo'sh qilish
    setSelectedDepartments([]);
    setSelectedUsers([]);
    setImageFile(null);
    setSelectedImage(null);
  };

  // ✅ handleActionOpen funksiyasini yangilang
  const handleActionOpen = (task, type) => {
    setSelectedTask(task);
    setModalType(type);
    setIsActionModalOpen(true);
    setOpenDropdownId(null);
  
    if (type === "edit") {
      setTaskName(task.name);
      setDescription(task.description || "");
      setSelectedImage(task.image || null);
      
      // ✅ Deadline mavjud bo'lsa, uni set qilish
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        setDeadline(formattedDeadline);
      } else {
        setDeadline(""); // Agar deadline yo'q bo'lsa bo'sh qoldirish
      }
      
      const deptIds = task.departments?.map(dept => dept.id) || [];
      setSelectedDepartments(deptIds);
      
      const assignedUserIds = task.assigned?.map(user => user.id || user) || [];
      setSelectedUsers(assignedUserIds);
    }
  };

  const handleActionClose = () => {
    setIsActionModalOpen(false);
    setSelectedTask(null);
    setModalType(null);
    // Edit mode dan chiqayotganda formni tozalash
    setTaskName("");
    setDescription("");
    setDeadline(""); // ✅ Bo'sh qilish
    setSelectedDepartments([]);
    setSelectedUsers([]);
    setImageFile(null);
    setSelectedImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  
  
  // ✅ Edit modal'da tanlangan userlarni ko'rsatish uchun component qo'shing
  const renderAssignedUsers = () => {
    if (modalType !== "edit" || !selectedTask?.assigned) return null;

    return (
      <div className="mb-4">
        <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
          Currently Assigned Users
        </label>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-[14px] min-h-[50px]">
          {selectedTask.assigned.length > 0 ? (
            selectedTask.assigned.map((user, index) => {
              const userObj =
                typeof user === "object"
                  ? user
                  : allUsers.find((u) => u.id === user);
              if (!userObj) return null;

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border"
                >
                  {userObj.profile_picture ? (
                    <img
                      src={userObj.profile_picture}
                      alt={`${userObj.first_name} ${userObj.last_name}`}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {userObj.first_name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                  <span className="text-sm">
                    {userObj.first_name} {userObj.last_name}
                  </span>
                  <button
                    onClick={() => {
                      const newAssigned = selectedTask.assigned.filter(
                        (_, i) => i !== index
                      );
                      setSelectedTask({
                        ...selectedTask,
                        assigned: newAssigned,
                      });
                      // selectedUsers dan ham olib tashlash
                      setSelectedUsers((prev) =>
                        prev.filter((id) => id !== userObj.id)
                      );
                    }}
                    className="text-red-500 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">No users assigned</span>
          )}
        </div>
      </div>
    );
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

    if (deadline) {
      formData.append("deadline", deadline);
    }

    // ✅ YANGILANGAN MANTIQ: "All" tugmasi bosilgan YOKI barcha departmentlar qo'lda tanlangan
    const isAllDepartmentsSelected = selectedDepartments.includes("all") || 
      (selectedDepartments.length === allDepartments.length && !selectedDepartments.includes("none"));
    
    formData.append("is_all_departments", isAllDepartmentsSelected);

    if (selectedDepartments.includes("all")) {
      allDepartments.forEach((dept) => {
        formData.append("department_ids", dept.id);
      });
    } else if (!selectedDepartments.includes("none")) {
      selectedDepartments.forEach((id) => {
        if (id !== "none" && id !== "all") {
          formData.append("department_ids", id);
        }
      });
    }

    selectedUsers.forEach((id) => formData.append("assigned", id));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await createProject(formData);
    message.success("✅ Task created successfully");

    await loadProjects();
    handleAddClose();
  } catch (error) {
    console.error("❌ Task yaratishda xatolik:", error);
    message.error("Failed to create task");
  }
};

const handleEditTask = async () => {
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

    if (deadline) {
      formData.append("deadline", deadline);
    }

    // ✅ YANGILANGAN MANTIQ: "All" tugmasi bosilgan YOKI barcha departmentlar qo'lda tanlangan
    const isAllDepartmentsSelected = selectedDepartments.includes("all") || 
      (selectedDepartments.length === allDepartments.length && !selectedDepartments.includes("none"));
    
    formData.append("is_all_departments", isAllDepartmentsSelected);

    if (selectedDepartments.includes("all")) {
      allDepartments.forEach((dept) => {
        formData.append("department_ids", dept.id);
      });
    } else if (!selectedDepartments.includes("none")) {
      selectedDepartments.forEach((id) => {
        if (id !== "none" && id !== "all") {
          formData.append("department_ids", id);
        }
      });
    }

    const allSelectedUserIds = [...new Set([...selectedUsers])];
    allSelectedUserIds.forEach((id) => formData.append("assigned", id));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    await updateProject(selectedTask.id, formData);
    message.success("✅ Task updated successfully");

    await loadProjects();
    handleActionClose();
  } catch (error) {
    console.error("❌ Task yangilashda xatolik:", error);
    message.error("Failed to update task");
  }
};

  const handleDeleteTask = async () => {
    try {
      await deleteProject(selectedTask.id);
      message.success("✅ Task deleted successfully");

      await loadProjects();
      handleActionClose();
    } catch (error) {
      console.error("❌ Task o'chirishda xatolik:", error);
      message.error("Failed to delete task");
    }
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

  const formatDate2 = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
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
                  id="editImageInput"
                />

                <label
                  htmlFor="editImageInput"
                  className="mt-1 w-full h-[54px] block cursor-pointer border border-dashed border-gray-400 rounded-[14px] px-3 py-[15px] text-blue-600 hover:border-blue-500 transition"
                >
                  Change image
                </label>

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
                    return dept ? (
                      <img
                        key={id}
                        src={dept.avatar}
                        alt={dept.name}
                        className="w-8 h-8 rounded-full bg-white p-1 border border-blue-300"
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

              {/* ✅ Currently Assigned Users */}
              {renderAssignedUsers()}

              {/* Users ro'yxati - faqat departmentlar tanlanganida ko'rsatiladi */}
              {selectedDepartments.length > 0 && filteredUsers.length > 0 && (
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Add More Users from Departments
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-[14px] p-3">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <div className="flex items-center gap-2">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {user.first_name?.[0] || "U"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592]">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split("T")[0]} // Bugungi kundan oldingi sanalarni taqiqlash
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-[14px] px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case "info":
        return (
          <div className="flex flex-col gap-5 text-sm text-gray-700">
            <h1 className="text-[#0A1629] text-[22px] font-bold mb-3">
              Task Details
            </h1>
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
          {selectedTask.deadline 
            ? formatDate(selectedTask.deadline) 
            : 'No deadline set'}
        </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Department</p>
              <div className="w-21 h-10">
                <div className="flex gap-1 w-full  col-span-2">
                  {selectedTask.departments?.map((dept) => (
                    <div key={dept.id} className=" w-full  flex flex-col items-center">
                      {dept.photo ? (
                        <img
                          src={dept.photo}
                          alt={`Department ${dept.id}`}
                          className=" w-14 h-10 border border-blue-300 rounded-full object-cover hover:opacity-80 transition cursor-pointer"
                        />
                      ) : (
                        <div className="bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">D</span>
                        </div>
                      )}
                    </div>
                  )) || "-"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Assigned Users</p>
              <div className="col-span-2">
                {selectedTask.assigned?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assigned.map((user, index) => {
                      const userObj =
                        typeof user === "object"
                          ? user
                          : allUsers.find((u) => u.id === user);
                      return userObj ? (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                        >
                          {userObj.profile_picture ? (
                            <img
                              src={userObj.profile_picture}
                              alt={userObj.first_name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs">
                                {userObj.first_name?.[0]}
                              </span>
                            </div>
                          )}
                          <span className="text-sm">
                            {userObj.first_name} {userObj.last_name}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500">No users assigned</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Description</p>
              <p className="text-gray-700 leading-relaxed col-span-2">
                {selectedTask.description || "No description provided."}
              </p>
            </div>
          </div>
        );

      case "delete":
        return (
          <div className="py-5">
            <p className="text-sm text-center text-gray-600">
              Are you sure you want to delete "
              <strong>{selectedTask.name}</strong>"?
            </p>
            <p className="text-sm text-center text-red-500 mt-2">
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
      // case "info":
      //   return "Task Details";
      case "delete":
        return "Delete Task";
      default:
        return "";
    }
  };

  const getModalFooter = () => {
    switch (modalType) {
      case "edit":
        return [
          <button
            key="cancel"
            onClick={handleActionClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-[15px] text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleEditTask}
            className="bg-[#0061fe] hover:bg-[#3b77d7] text-white rounded-[15px] px-[20px] py-[12px] text-base font-bold transition"
          >
            Save Changes
          </button>,
        ];
      case "delete":
        return [
          <button
            key="cancel"
            onClick={handleActionClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-[15px] text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>,
          <button
            key="delete"
            onClick={handleDeleteTask}
            className="bg-red-500 hover:bg-red-600 text-white rounded-[15px] px-[20px] py-[12px] text-base font-bold transition"
          >
            Delete
          </button>,
        ];
      case "info":
        return [
          <button
            key="close"
            onClick={handleActionClose}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-[15px] px-[20px] py-[12px] text-base font-bold transition"
          >
            Close
          </button>,
        ];
      default:
        return [];
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          Project
        </h3>
        <button
          onClick={handleAddOpen}
          className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
        >
          <span className="text-[22px]">+</span>
          <span>Add Project</span>
        </button>
      </div>

      {/* Tasks Grid */}
      <div className={`flex flex-wrap gap-x-5 gap-y-5 ${justifyClass}`}>
        {projects.map((project) => (
          <div
            key={project.id}
            className="max-w-[290px] w-full border-2 border-[#EFEFEF] rounded-[14px] p-3 bg-white relative group flex flex-col gap-3 cursor-pointer"
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
  {project?.assigned?.length > 0 ? (
    <div className="flex items-center">
      {/* Agar "All Departments" tanlangan bo'lsa */}
      {project.is_all_departments ? (
        <img
          src="/M.png"
          alt="All departments project"
          className="w-[24px] h-[24px] rounded-full border-2 border-white shadow-sm"
        />
      ) : (
        /* Aks holda odatiy ko'rsatish */
        <>
          {/* Birinchi 2 ta assigned user'ni ko'rsatish */}
          {project.assigned.slice(0, 2).map((user, index) => {
            const userObj = typeof user === "object" ? user : allUsers.find(u => u.id === user);
            return userObj ? (
              <div
                key={userObj.id || index}
                className="relative"
                style={{ marginLeft: index > 0 ? "-8px" : "0" }}
              >
                {userObj.profile_picture ? (
                  <img
                    src={userObj.profile_picture}
                    alt={`${userObj.first_name} ${userObj.last_name}`}
                    className="w-[24px] h-[24px] rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="bg-gray-300 rounded-full flex items-center justify-center w-[24px] h-[24px] border-2 border-white shadow-sm">
                    <span className="text-xs font-medium">
                      {userObj.first_name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </div>
            ) : null;
          })}
          
          {/* 3 yoki undan ko'p assigned user bo'lsa */}
          {project.assigned.length >= 3 && (
            <div
              className="relative"
              style={{ marginLeft: "-8px" }}
            >
              <div className="w-[24px] h-[24px] bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-medium">
                +{project.assigned.length - 2}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  ) : (
    <span className="text-gray-400 text-xs">No users</span>
  )}
</div>
                <button
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  className="font-bold text-lg cursor-pointer troncate max-w-[180px]"
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
                // placeholder="M Tech"
                className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image */}
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
              className="mt-1 h-[50px] flex items-center justify-between w-full border border-gray-300 rounded-[14px] px-3 py-2 cursor-pointer hover:border-blue-500 transition"
            >
              <span className="text-gray-400">
                {selectedImage ? "Upload image" : "Upload image"}
              </span>
              <Paperclip />
            </label>

            {imageFile && selectedImage && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={selectedImage}
                  alt={imageFile.name}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div>
                  <div className="font-medium">{imageFile.name}</div>
                  <div className="text-sm text-gray-500">
                    {(imageFile.size / 1024).toFixed(1)} KB • {imageFile.type}
                  </div>
                  <div className="mt-2">
                    <button
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
                      onClick={() => { 
                        setImageFile(null);
                        setSelectedImage(null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
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
                  return dept ? (
                    <img
                      key={id}
                      src={dept.avatar}
                      alt={dept.name}
                      className="w-8 h-8 rounded-full bg-white p-1 border border-blue-300"
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

            {/* Users ro'yxati - faqat departmentlar tanlanganida ko'rsatiladi */}
            {selectedDepartments.length > 0 && filteredUsers.length > 0 && (
              <div>
                <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                  Select Users from Departments
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-[14px] p-3">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <div className="flex items-center gap-2">
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {user.first_name?.[0] || "U"}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            <div>
              <label className="block text-[14px] font-bold text-[#7D8592]">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
  
                  {/* Department tanlash modal - YANGILANGAN */}
              {/* Department tanlash modal - YANGILANGAN */}
         {/* Department tanlash modal - YANGILANGAN */}
        <Modal
          open={isDeptModalOpen}
           onCancel={() => {
        setIsDeptModalOpen(false);
        setSearchTerm(""); // Modal yopilganda qidiruvni tozalash
      }}
      onOk={() => {
        setIsDeptModalOpen(false);
        setSearchTerm(""); // Modal yopilganda qidiruvni tozalash
      }}
          okText="Done"
          className="custom-modal"
          width={800}
        >
          <div className="space-y-6">
            {/* Department selector */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold">Select Departments</h4>
              </div>
              <DepartmentsSelector
                selectedIds={selectedDepartments}
                onChange={(ids) => setSelectedDepartments(ids)}
                onDataLoaded={(data) => setAllDepartments(data)}
              />
            </div>

    {/* Users ro'yxati - Department modal ichida */}
    {selectedDepartments.length > 0 &&
      deptModalFilteredUsers.length > 0 && (
        <div>
             
          <div className="flex justify-between items-center mb-3">
           <div className="flex max-sm:-mr-4">
                      <div className="relative w-full max-w-md bg-white rounded-xl max-md:border max-md:border-gray-300 max-sm:border-0 flex max-sm:flex-row-reverse items-center">
                        {/* Search icon */}
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none max-sm:hidden">
                          <Search className="w-5 h-5 text-[#0A1629]" />
                        </span>
                        <span className="hidden max-sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
                          <Search className="w-5 h-5 text-[#0A1629]" />
                        </span>
              
                        {/* Input */}
                        <input
                          type="text"
                          placeholder="Search..."
                             value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full py-[7px] bg-[#F2F2F2] pr-4 pl-10 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:py-1
                               max-sm:pl-3 max-sm:placeholder-transparent"
                        />
                          {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center max-sm:right-8"
                >
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
                      </div>
                    </div>
            <h4 className="text-lg font-semibold">
              
                   {searchTerm && (
                  <span className=" mr-1 text-[14px]">
                    
                  </span>
                )}
            </h4>
            <button 
              onClick={handleSelectAllUsers}
              className="h-[38px]  px-4 cursor-pointer flex items-center justify-center rounded-xl text-white bg-[#1677FF]"
            >
              {deptModalFilteredUsers.every(user => selectedUsers.includes(user.id)) 
                ? "Deselect All Users" 
                : "Select All Users"}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-[14px] p-4">
            <div className="grid grid-cols-1 gap-3">
              {filteredUsersBySearch.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div className="flex items-center gap-3">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.first_name?.[0] || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.department?.name || "No Department"}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tanlangan userlar soni */}
          <div className="mt-3 text-sm text-gray-600">
            (Showing {filteredUsersBySearch.length} of {deptModalFilteredUsers.length} users)
            Selected: {selectedUsers.length} user
            {selectedUsers.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

    {/* Agar department tanlangan bo'lsa lekin userlar yo'q bo'lsa */}
  {selectedDepartments.length > 0 &&
          deptModalFilteredUsers.length === 0 &&
          !selectedDepartments.includes("none") && (
            <div className="text-center py-8 text-gray-500">
              <p>No users found in selected departments</p>
            </div>
          )}
  </div>
</Modal>

      {/* Action Modal (Edit / Info / Delete) */}
      <Modal
        open={isActionModalOpen}
        onCancel={handleActionClose}
        width={modalType === "edit" ? 550 : 814}
        title={getModalTitle()}
        footer={getModalFooter()}
        className="custom-modal"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Projects;