import { useState, useEffect, useRef, useMemo } from "react";
import { message } from "antd";
import { Archive, MoreVertical, Paperclip, Search } from "lucide-react";
import { Modal, Input, Dropdown, Pagination } from "antd";
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
import { getDepartments } from "../../api/services/departmentService";
import { FaArchive } from "react-icons/fa";
import { getUsers } from "../../api/services/userService";
import { useSidebar } from "../../context";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

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
  const allDepartmentsIcon = '/M2.png';
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const isLoading = authLoading || dataLoading;

  const [searchTerm, setSearchTerm] = useState('');

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [projectsData, setProjectsData] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  // const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  // const [allDepartmentsSelected, setAllDepartmentsSelected] = useState(false);
  const [totalDepartmentsCount, setTotalDepartmentsCount] = useState(0);
  const [deptModalFilteredUsers, setDeptModalFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalDepartments = async () => {
      try {
        const response = await getDepartments();
        setTotalDepartmentsCount(response.length);
        console.log('Total departments from API:', response.length);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setTotalDepartmentsCount(4);
      }
    };


    fetchTotalDepartments();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      await loadProjects(1);
      await loadUsers();
      setDataLoading(false);
    };
    fetchInitialData();
  }, []);

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

  useEffect(() => {
    if (selectedDepartments.length > 0 && allUsers.length > 0) {
      if (selectedDepartments.includes("none")) {
        setDeptModalFilteredUsers([]);
        return;
      }

      if (selectedDepartments.includes("all")) {
        setDeptModalFilteredUsers(allUsers);
        return;
      }

      const filtered = allUsers.filter(
        (user) =>
          user.department_id &&
          selectedDepartments.includes(user.department_id)
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

      if (selectedDepartments.includes("all")) {
        setFilteredUsers(allUsers);
        return;
      }

      const filtered = allUsers.filter(
        (user) =>
          user.department_id &&
          selectedDepartments.includes(user.department_id)
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
        setSelectedUsers(prev => prev.filter(id => !allFilteredUserIds.includes(id)));
      } else {
        setSelectedUsers(prev => [...new Set([...prev, ...allFilteredUserIds])]);
      }
    }
  };

  useEffect(() => {
    if (modalType === "edit" && selectedTask?.assigned && allUsers.length > 0) {
      const currentAssignedUsers = selectedTask.assigned
        .map((user) =>
          typeof user === "object" ? user : allUsers.find((u) => u.id === user)
        )
        .filter(Boolean);

      const currentFilteredUsers = [...filteredUsers];
      currentAssignedUsers.forEach((user) => {
        if (!currentFilteredUsers.find((u) => u.id === user.id)) {
          currentFilteredUsers.push(user);
        }
      });
    }
  }, [modalType, selectedTask, allUsers, filteredUsers]);

  const loadProjects = async (page = 1) => {
    setLoading(true);
    try {
      console.log(`Loading page ${page} with pageSize ${pageSize}`);
      const data = await getProjects(page, pageSize);
      console.log("Received data:", data);

      // Make sure we're getting the expected number of results
      if (data.results && data.results.length > 0) {
        setProjectsData(data);
        setCurrentPage(page);
      } else if (page > 1) {
        // If we requested a page with no results, go back to previous page
        await loadProjects(page - 1);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      message.error("Loyihalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <span className="loader"></span>
      </div>
    );

  const handleAddOpen = () => setIsAddModalOpen(true);

  const handleAddClose = () => {
    setIsAddModalOpen(false);
    setTaskName("");
    setDescription("");
    setDeadline("");
    setSelectedDepartments([]);
    setSelectedUsers([]);
    setImageFile(null);
    setSelectedImage(null);
  };

  const handleActionOpen = (task, type) => {
    setSelectedTask(task);
    setModalType(type);
    setIsActionModalOpen(true);
    setOpenDropdownId(null);

    if (type === "edit") {
      setTaskName(task.name);
      setDescription(task.description || "");
      setSelectedImage(task.image || null);

      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0];
        setDeadline(formattedDeadline);
      } else {
        setDeadline("");
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
    setTaskName("");
    setDescription("");
    setDeadline("");
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

      // Calculate if we need to change page
      const totalPages = Math.ceil((projectsData.count + 1) / pageSize);
      if (currentPage < totalPages) {
        await loadProjects(currentPage);
      } else {
        await loadProjects(totalPages);
      }

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

      await loadProjects(currentPage); // joriy sahifani yangilash
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

      await loadProjects(currentPage); // joriy sahifani yangilash
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
        <Permission anyOf={[ROLES.FOUNDER, ROLES.DEP_MANAGER, ROLES.MANAGER, ROLES.HEADS]}>
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
      key: "Archive",
      label: (
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button className="flex items-center gap-2 text-sm text-gray-800 w-full text-left px-2 py-1 cursor-pointer">
            <FaArchive className="text-black" /> <span>Archive</span>
          </button>
        </Permission>
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
                  placeholder="Edit Project name"
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
                  <>
                    <div className="flex items-baseline  gap-2">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="mt-2 w-20 h-20 object-cover rounded"

                      />
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
                  </>


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

              {renderAssignedUsers()}

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
                  min={new Date().toISOString().split("T")[0]}
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
              Project info
            </h1>
            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Project name</p>
              <p className="text-gray-900 font-medium col-span-2">
                {selectedTask.name}
              </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Project Creation Date</p>
              <p className="text-gray-900 font-medium col-span-2">
                {formatDate(selectedTask.created_at)}
              </p>
            </div>

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Project's deadline</p>
              <p className="text-gray-900 font-medium col-span-2">
                {selectedTask.deadline
                  ? formatDate(selectedTask.deadline)
                  : 'No deadline set'}
              </p>
            </div>

            <div className="grid grid-cols-3 w-full gap-4">
              <p className="text-gray-400 font-medium">Department</p>
              <div className="col-span-2">
                <div className="flex flex-wrap gap-2">
                  {selectedTask.departments?.length > 0 ? (
                    selectedTask.departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-center flex-shrink-0"
                      >
                        {dept.photo ? (
                          <img
                            src={dept.photo}
                            alt={`Department ${dept.name || dept.id}`}
                            className="w-8 h-8 border-2 border-blue-300 rounded-full object-cover hover:opacity-80 transition cursor-pointer shadow-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-xs font-medium text-gray-600">
                              {dept.name ? dept.name.charAt(0).toUpperCase() : 'D'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
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
                            {userObj.first_name}
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

            <div className="grid grid-cols-3 w-full">
              <p className="text-gray-400 font-medium">Created by</p>
              <p className="text-gray-700 leading-relaxed col-span-2">
                {selectedTask.created_by}
              </p>
            </div>
          </div>
        );

      case "delete":
        return (
          <div className="p-1">
            <p className="text-sm  text-gray-600">
              Are you sure you want to delete "
              <strong>{selectedTask.name}</strong>"?
            </p>
            <p className="text-sm  text-red-500 mt-2">
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
        return "Edit Project";
      case "delete":
        return "Delete Project";
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
            className="mr-2 px-4 py-2 border border-gray-300 cursor-pointer rounded-[15px] text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleEditTask}
            className="bg-[#0061fe] hover:bg-[#3b77d7] text-white rounded-[15px] cursor-pointer px-4 py-2 text-base font-bold transition"
          >
            Save Changes
          </button>,
        ];
      case "delete":
        return [
          <button
            key="cancel"
            onClick={handleActionClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-[15px] cursor-pointer text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>,
          <button
            key="delete"
            onClick={handleDeleteTask}
            className="bg-red-500 hover:bg-red-600 text-white rounded-[15px] px-4 py-2 cursor-pointer text-base font-bold transition"
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
    <div className=" pt-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">
          Project
        </h3>
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.DEP_MANAGER, ROLES.HEADS]}>
          <button
            onClick={handleAddOpen}
            className="capitalize w-full sm:max-w-[172px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
          >
            <span className="text-[22px]">+</span>
            <span>Add Project</span>
          </button>
        </Permission>
      </div >
      {/* Tasks Grid - Responsive Grid Layout */}

      < div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2" >
        {
          projectsData.results.map((project) => (
            <div
              key={project.id}
              className=" border-2 border-[#EFEFEF] rounded-[14px] p-3 bg-white relative group flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              {project.image ? (
                <button
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  className="cursor-pointer w-full"
                >
                  <img
                    onClick={() => navigate(`/tasks/${project.id}`)}
                    src={project.image}
                    alt="Task image"
                    className="h-[134px] w-full object-cover rounded-[14px]"
                  />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/tasks/${project.id}`)}
                  className="h-[134px] w-full rounded-[14px] mb-2 overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer"
                >
                  <span className="text-gray-500 text-sm">No Image</span>
                </button>
              )}
              <button
                onClick={() => navigate(`/tasks/${project.id}`)}
                className="flex items-center gap-1 mb-2 cursor-pointer w-full"
              >
                <span className="text-xs font-bold text-gray-600 whitespace-nowrap flex-shrink-0">
                  {project?.progress}%
                </span>
                <div className="flex-1 h-2 bg-gray-300 rounded">
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{ width: `${project?.progress}%` }}

                  ></div>
                </div>

              </button>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex items-center relative w-auto h-8 flex-shrink-0">


                    {project.departments?.length > 0 ? (
                      <div className="flex items-center -space-x-2">
                        {(() => {
                          const totalDepts = project.departments.length;

                          let isAllDepartments = false;

                          if (allDepartments && allDepartments.length > 0) {
                            const isAllSelected = totalDepts === allDepartments.length;
                            isAllDepartments = isAllSelected;
                          } else {
                            const isAllByCount = totalDepts === totalDepartmentsCount && totalDepartmentsCount > 0;
                            const hasAllFlag = project.isAllDepartments === true ||
                              project.allSelected === true ||
                              project.selectAll === true;
                            isAllDepartments = isAllByCount || hasAllFlag;
                          }

                          if (isAllDepartments) {
                            return (
                              <div className="relative">
                                <img
                                  src={allDepartmentsIcon}
                                  alt="All Departments"
                                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                                  onError={(e) => {
                                    console.log('Image load failed, using fallback');
                                    const fallbackDiv = document.createElement('div');
                                    fallbackDiv.className = 'w-7 h-7 border-2 border-white rounded-full bg-blue-500 flex items-center justify-center shadow-sm text-white font-bold text-sm';
                                    fallbackDiv.innerHTML = 'M';
                                    e.target.parentNode.replaceChild(fallbackDiv, e.target);
                                  }}
                                />
                              </div>
                            );
                          } else {
                            const maxVisible = 2;
                            const visibleDepts = project.departments.slice(0, maxVisible);
                            const remainingCount = totalDepts - maxVisible;

                            return (
                              <div className="flex items-center w-auto">
                                {visibleDepts.map((dept, index) => (
                                  <div
                                    key={dept.id}
                                    className="relative w-[25px] flex items-center"
                                    style={{
                                      marginLeft: index > 0 ? '-8px' : '0',
                                    }}
                                  >
                                    {dept.photo ? (
                                      <img
                                        src={dept.photo}
                                        alt={`Department ${dept.name || dept.id}`}
                                        className="w-7 h-7 border-2 border-white rounded-full object-cover hover:opacity-80 transition cursor-pointer shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-medium">
                                          {dept.name ? dept.name.charAt(0).toUpperCase() : 'D'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {remainingCount > 0 && (
                                  <div
                                    className="relative flex items-center bg-blue-100 border-2 border-white rounded-full w-7 h-7 shadow-sm"
                                    style={{
                                      marginLeft: '-8px',
                                      zIndex: 0
                                    }}
                                  >
                                    <span className="text-xs font-medium text-blue-600 w-full text-center">
                                      +{remainingCount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/tasks/${project.id}`)}
                    className="font-bold ml-3 text-lg cursor-pointer truncate flex-1 text-left"
                    title={project.name}
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
                  <button className="flex-shrink-0 p-1">
                    <MoreVertical className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
                  </button>
                </Dropdown>
              </div>

              <div className="flex mt-1 justify-between text-sm gap-2">
                <div className="flex-1">
                  <span className="text-gray-900 font-medium text-xs sm:text-sm">
                    {formatDate2(project?.created_at)}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <span className="text-gray-900 font-medium text-xs sm:text-sm">
                    {formatDate2(project?.deadline)}
                  </span>
                </div>
              </div>
            </div>
          ))
        }
      </div >
      {
        projectsData.count > pageSize && (
          <div className="flex justify-center mt-10 mb-10">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={projectsData.count}
              onChange={(page) => {
                console.log("Changing to page:", page);
                setCurrentPage(page);
                loadProjects(page);
              }}
              showSizeChanger={false}
              showQuickJumper={false}
              className="custom-pagination"
            />
          </div>
        )
      }
      {/* Add Task Modal */}
      <Modal
        open={isAddModalOpen}
        onCancel={handleAddClose}
        onOk={handleAddTask}
        okText="Add Task"
        cancelText="none"
        style={{
          padding: "10px",
          top: 0,
        }}
        footer={[
          <button
            key="submit"
            onClick={handleAddTask}
            className="bg-[#0061fe] hover:bg-[#3b77d7] text-white rounded-[15px] px-[20px] py-[8px] text-base font-bold transition"
          >
            Save Task
          </button>,
        ]}
        title={
          <div className="text-[22px] font-bold text-[#0A1629] mb-10">
            Add Project
          </div>
        }
        width={500}
        className="custom-modal "
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
                className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex items-center relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full h-[50px] border border-gray-300 rounded-[14px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className=" absolute right-3"></div>
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

      {/* Department tanlash modal - YANGILANGAN */}
      <Modal
        open={isDeptModalOpen}
        onCancel={() => {
          setIsDeptModalOpen(false);
          setSearchTerm("");
        }}
        onOk={() => {
          setIsDeptModalOpen(false);
          setSearchTerm("");
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
                <div className=" flex flex-col sm:flex-row  sm:items-center  mb-3">
                  <div className="  flex-2/5 flex">
                    <div className="relative  w-full max-w-md bg-white rounded-xl border border-gray-300 sm:border-0 flex items-center">
                      {/* Search icon */}
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-[#0A1629]" />
                      </span>
                      {/* Input */}
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 py-[7px]   bg-gray-100 pr-4 pl-10 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSelectAllUsers}
                    className="h-[39px]   flex-1 px-9 cursor-pointer flex items-center justify-center rounded-xl max-sm:mt-2 max-sm:py-1 text-white bg-[#1677FF] whitespace-nowrap "
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
                          className="w-5 h-5 accent-blue-600 flex-shrink-0"
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium">
                                {user.first_name?.[0] || "U"}
                              </span>

                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {user.profession || "No Profession"}
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
        width={modalType === "edit" ? 550 : 814 && modalType === "delete" ? 480 : 814}
        title={getModalTitle()}
        footer={getModalFooter()}
        className="custom-modal"
        style={modalType === "edit" ? { top: 0 } : {}}>
        {renderModalContent()}
      </Modal>
    </div >
  );
};

export default Projects;