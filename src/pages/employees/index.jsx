import {
  Funnel,
  Plus,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronUp,
  ChevronDown,
  Paperclip,
} from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Activity from "./activity";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { getEmployees, createEmployees, getEmployeeById } from "../../api/services/employeeService";
import avatarImage from "../../assets/default-avatar.png"
import { deleteUser } from "../../api/services/userService";

const InnerCircle = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("innerCircleTab") || "list";
  });

  const [searchParams] = useSearchParams();
  const pageNum = parseInt(searchParams.get("page_num") || "1", 10);
  const itemsPerPage = 10;
  const [dropdownPosition, setDropdownPosition] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password1: "",
    role: "",
    department: "",
    profession: "",
    phone_number: "",
    tg_username: "",
    level: "",
    birth_date: "",
    address: "",
    avatarFile: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parolni tekshirish
    if (formData.password !== formData.password1) {
      alert("Parollar mos kelmadi!");
      return;
    }

    // Majburiy maydonlarni tekshirish
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password ||
      !formData.password1
    ) {
      alert("Majburiy maydonlarni to'ldiring!");
      return;
    }

    try {
      // FormData obyektini yaratish
      const form = new FormData();
      form.append("first_name", formData.first_name);
      form.append("last_name", formData.last_name);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("password1", formData.password1);
      form.append("role", formData.role);
      form.append("birth_date", formData.birth_date);
      form.append("phone_number", formData.phone_number);
      form.append("tg_username", formData.tg_username);
      form.append("department[name]", formData.department);
      form.append("department[department_id]", formData.department); // id yuborish

      // Agar avatar fayl tanlangan bo'lsa
      if (avatarFile) {
        form.append("profile_picture", avatarFile);
      }

      console.log("Yuborilayotgan ma'lumot (FormData):", [...form.entries()]);

      // createEmployees API chaqirishi
      await createEmployees(form); // Bu funksiya FormData bilan ishlashiga ishonch hosil qil
      setIsAddModalOpen(false);

      // Yangi xodimlar ro'yxatini yangilash
      getEmployees().then((res) =>
        setEmployees(res.data.results || [])
      );
    } catch (err) {
      console.error("Xodim qo'shishda xato:", err);
      if (err.response) {
        console.error("Server javobi:", err.response.data);
      }

      getEmployeeById().then((res) =>
        setEmployees(res.data.results || []));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file)); // preview
      setAvatarFile(file); // backendga yuborish uchun
    }
  };

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchEmployees();
}, []);

  const fetchEmployees = () => {
    setLoading(true);
    getEmployees()
      .then((res) => {
        const employeesData = Array.isArray(res) ? res : res?.results || [];
        setEmployees(employeesData); // API’dan kelgan ma’lumot
      })
      .catch((err) => {
        console.error("Xatolik:", err);
        setEmployees([]); // Xato bo'lsa bo'sh array
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    console.log("O‘chirilayotgan user ID:", id); // 🖨 Console’da ko‘rsatish
    if (confirm("Haqiqatan ham ushbu xodimni o‘chirib tashlamoqchimisiz?")) {
      try {
        await deleteUser(id);
        alert("Xodim o‘chirildi ✅");
        fetchEmployees(); // qayta yuklash
      } catch (err) {
        console.error(err);
        alert("Xodimni o‘chirishda xatolik yuz berdi ❌");
      }
    }
  };


  // Pagination uchun hisoblashlar
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (pageNum - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = employees.slice(startIndex, endIndex);

  const toggleDropdown = (id, e) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    const position =
      spaceBelow < 300 && spaceAbove > spaceBelow ? "top" : "bottom";

    setDropdownPosition((prev) => ({ ...prev, [id]: position }));
    setOpenDropdown(id);
  };


  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("innerCircleTab", tab);
  };

  const navigate = useNavigate();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const modalRef = useRef(null);

  // Modal tashqarisiga bosilganda yopish uchun effect
  useEffect(() => {
    const savedFilterModalState = localStorage.getItem("filterModalOpen");
    if (savedFilterModalState === "true") {
      setIsFilterModalOpen(true);
    }
  }, []);

  // 2. Har safar modal ochilishi/yopilishi bilan localStorage'ga yozish
  useEffect(() => {
    localStorage.setItem("filterModalOpen", isFilterModalOpen);
  }, [isFilterModalOpen]);

  // 3. Tashqariga bosilganda modal yopilsin
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const [showAllDepartments, setShowAllDepartments] = useState(false);

  const allDepartments = [
    { name: "M Tech Department", icon: "💼" },
    { name: "M Sales Department", icon: "💲" },
    { name: "Marketing Department", icon: "📢" },
    { name: "M Academy Department", icon: "🎓" },
    { name: "Human Resources", icon: "🧑‍💼" },
    { name: "Customer Support", icon: "🎧" },
    { name: "Legal Department", icon: "⚖️" },
  ];

  const visibleDepartments = showAllDepartments
    ? allDepartments
    : allDepartments.slice(0, 4);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // 1. Brauzer yangilansa, localStorage'dan o'qib olish
  useEffect(() => {
    const savedState = localStorage.getItem("addModalOpen");
    if (savedState === "true") {
      setIsAddModalOpen(true);
    }
  }, []);

  // 2. Holat o'zgarsa, localStorage'ga yozish
  useEffect(() => {
    localStorage.setItem("addModalOpen", isAddModalOpen);
  }, [isAddModalOpen]);

  // 3. Modal tashqarisiga bosilganda yopish + localStorage'ni yangilash
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <span className="loader"></span>
      </div>
    );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-7 md:mt-1 mb-6 gap-4">
        <h1 className="text-[#1F2937] font-bold text-3xl sm:text-xl  xl:text-4xl">
          Inner Circle ({employees.length})
        </h1>

        <div className="flex items-center bg-[#DBDBDB] xl:p-[3px] rounded-4xl w-full m-auto md:w-[250px] xl:w-[350px]">
          <button
            onClick={() => handleTabClick("list")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${activeTab === "list"
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
              }`}
          >
            List
          </button>

          <button
            onClick={() => handleTabClick("activity")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] md:text-[14px] lg:text-[16px] font-bold transition-all duration-200 ${activeTab === "activity"
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
              }`}
          >
            Activity
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => setIsFilterModalOpen(true)}
            className="hidden md:flex w-10 h-10 xl:w-12 xl:h-12 bg-white shadow rounded-xl xl:rounded-2xl items-center justify-center cursor-pointer"
          >
            <Funnel className="!text-[18px] !xl:text-[24px] text-[#1F2937]" />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden md:flex bg-[#0061fe] text-white text-sm lg:text-base rounded-2xl items-center gap-1 py-2 px-3 xl:py-3 xl:px-5"
          >
            <Plus /> Add Employee
          </button>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-gray-50 rounded-2xl shadow p-4">
          {/* Desktop Table */}
          <div className="overflow-x-auto">
            <div className="w-full">
              {/* Header - faqat lg dan katta ekranlarda */}
              <div className="hidden lg:grid grid-cols-17 text-gray-500 text-md font-bold py-3 px-4 border-b border-b-gray-200 mb-7 pb-5">
                <div className="col-span-5">Employees</div>
                <div className="col-span-3 text-center">Department</div>
                <div className="col-span-4 text-center">Phone number</div>
                <div className="col-span-2 text-center">Projects</div>
                <div className="col-span-2 text-center">Status</div>
                <div></div>
              </div>

              {/* Rows */}
              <div className="space-y-3 mt-2">
                {currentPageItems.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-4 grid grid-cols-1 gap-4 lg:grid-cols-17 lg:items-center"
                  >
                    {/* Employee info */}
                    <div className="flex items-center gap-3 col-span-5">
                      <img
                        src={emp.profile_picture}
                        alt={emp.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[#1F2937] font-semibold truncate max-w-[180px]">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm font-medium truncate">{emp.role}</span>
                          <span
                            className={`px-3 py-[3px] rounded-md text-xs font-medium border capitalize border-gray-300 text-gray-600 bg-gray-100`}
                          >
                            {emp.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="lg:col-span-3 text-center">
                      <span className="lg:hidden font-medium text-gray-600">Department: </span>
                      {emp.department}
                    </div>

                    {/* Phone */}
                    <div className="lg:col-span-4 text-center text-gray-600">
                      {emp.phone_number}
                    </div>

                    {/* Projects */}
                    <div className="lg:col-span-2 text-center text-gray-600">
                      {emp.project_count}
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2 flex justify-center">
                      <span
                        className={`flex px-2 w-[84px] py-[6px] rounded-lg text-xs font-medium capitalize items-center gap-1 justify-center
                              ${emp.status === "free"
                            ? "text-green-600 bg-green-100"
                            : emp.status === "overload"
                              ? "text-red-600 bg-red-100"
                              : emp.status === "working"
                                ? "text-blue-600 bg-blue-100"
                                : emp.status === "sick"
                                  ? "text-yellow-600 bg-yellow-100"
                                  : "text-gray-600 bg-gray-200"
                          }`}

                      >
                        <div
                          className={`w-[5px] h-[5px] rounded-full
                            ${emp.status === "free"
                              ? "bg-green-500"
                              : emp.status === "overload"
                                ? "bg-red-500"
                                : emp.status === "working"
                                  ? "bg-blue-500"
                                  : emp.status === "sick"
                                    ? "bg-yellow-500"
                                    : "bg-gray-400"
                            }`}
                        ></div>
                        <span className="ml-2 capitalize">{emp.status}</span>

                      </span>
                    </div>

                    <div className="text-right relative dropdown-container inline-block">
                      <button
                        className="cursor-pointer"
                        onClick={(event) => toggleDropdown(emp.id, event)}
                        ref={openDropdown === emp.id ? dropdownRef : null}
                      >
                        <MoreVertical size={20} className="text-[#1F2937]" />
                      </button>

                      {openDropdown === emp.id && (
                        <div
                          className={`absolute z-10 w-40 bg-white rounded-lg shadow border border-gray-300
        ${dropdownPosition[emp.id] === "top" ? "bottom-full mb-2" : "mt-2"}`}
                          style={{
                            right: 0,
                          }}
                          onClick={(e) => e.stopPropagation()} // dropdown ichida click bubble bo‘lmasin
                        >
                          {["founder", "manager"].includes(emp.role) ? (
                            <>
                              <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-green-500 cursor-pointer">
                                Edit status
                              </button>
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  navigate(`/profile/${emp.id}`);
                                  setTimeout(() => setOpenDropdown(null), 0);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-yellow-500 cursor-pointer"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id)}
                                className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-red-500 cursor-pointer">
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${emp.id}`);
                                setTimeout(() => setOpenDropdown(null), 0);
                              }}
                              className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-yellow-500 cursor-pointer"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {currentPageItems.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-xl shadow p-4 cursor-pointer"
                onClick={() => toggleDropdown(emp.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={emp.profile_picture}
                      alt={emp.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#1F2937] font-semibold">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-gray-500 text-sm">{emp.role}</p>
                    </div>
                  </div>
                  {openDropdown === emp.id ? (
                    <FaChevronUp className="text-[#1F2937]" />
                  ) : (
                    <FaChevronDown className="text-[#1F2937]" />
                  )}
                </div>

                {openDropdown === emp.id && (
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-[#1F2937] font-medium">{emp.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Projects</p>
                      <p className="text-[#1F2937] font-medium">{emp.project_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Department</p>
                      <p className="text-[#1F2937] font-medium">{emp.department}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Status</p>
                      <span
                        className={`inline-block px-3 py-[3px] rounded-lg text-xs font-medium border ${emp.status === "Free"
                            ? "border-green-400 text-green-600"
                            : "border-yellow-400 text-yellow-600"
                          }`}
                      >
                        {emp.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <button
                        className="bg-[#0061fe] text-white px-6 py-2 rounded-2xl font-bold block m-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${emp.id}`);
                        }}
                      >
                        More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center md:justify-end">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl text-sm text-[#1F2937] shadow-sm">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => navigate(`/employees/?page_num=${index + 1}`)}
                  className={`px-3 py-1 rounded ${pageNum === index + 1 ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => pageNum > 1 && navigate(`/employees/?page_num=${pageNum - 1}`)}
                disabled={pageNum === 1}
                className={`px-2 py-1 rounded-full ${pageNum === 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-200"
                  }`}
              >
                <ArrowLeft />
              </button>
              <button
                onClick={() => pageNum < totalPages && navigate(`/employees/?page_num=${pageNum + 1}`)}
                disabled={pageNum === totalPages}
                className={`px-2 py-1 rounded-full ${pageNum === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-200"
                  }`}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && <Activity />}

      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button
          className="w-14 h-14 bg-[#1F2937] text-white rounded-full flex items-center justify-center shadow-lg"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={28} />
        </button>
      </div>

      {isFilterModalOpen && (
        <div className="fixed top-5 bottom-5 inset-0 z-50 bg-gray bg-opacity-30 flex items-center justify-end">
          <div
            ref={modalRef}
            className="bg-white h-full w-[380px] max-w-full p-6 rounded-[24px] shadow-xl overflow-y-auto relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute top-6 right-6 text-[#0A1629] hover:text-gray-800 bg-[#DBDBDB] rounded-[14px] p-[10px]"
            >
              <X size={22} />
            </button>

            {/* Title */}
            <h2 className="text-[22px] font-bold text-[#0A1629] mb-6 border-b border-[#DBDBDB] pb-5">
              Filters
            </h2>

            {/* Inputs */}
            <div className="space-y-6 text-[#0A1629]">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Allayorov Boburjon"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+998991234567"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {/* Departments */}
              <div>
                <label className="text-sm font-medium block mb-3">
                  Departments
                </label>
                <div className="space-y-3">
                  {visibleDepartments.map((dept, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`dept-${index}`}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={`dept-${index}`}
                        className="flex items-center gap-2"
                      >
                        <span>{dept.icon}</span> <span>{dept.name}</span>
                      </label>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowAllDepartments(!showAllDepartments)}
                    className="text-[#3F8CFF] font-semibold text-[16px] mt-1"
                  >
                    {showAllDepartments ? (
                      <div className="flex items-center gap-2">
                        View less <ChevronUp size={16} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        View more <ChevronDown size={16} />
                      </div>
                    )}{" "}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-700">
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-[#DBDBDB] pt-5 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">ℹ️</span>
                <span>10 matches found</span>
              </div>
              <button className="bg-[#0A1629] text-white text-sm font-semibold px-4 py-2 rounded-lg">
                Save Filters (3)
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 py-10 px-4 overflow-y-auto">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-[934px] rounded-2xl shadow-xl p-6 md:p-[50px]"
          >
            {/* Header: Title + Close Button */}
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-semibold text-[#1F2937]">
                Add Employee
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#0A1629] hover:text-gray-800 bg-[#DBDBDB] rounded-[14px] p-[10px]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex  flex-col lg:flex-row gap-[50px]">
              {/* LEFT SIDE */}
              <div className="flex-1 space-y-[19px] max-w-[464px] w-full">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="password1"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                    placeholder="Confirm Password"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  >
                    <option value="">Select role to this employee</option>
                    <option value="founder">Founder</option>
                    <option value="manager">Manager</option>
                    <option value="heads">Heads</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  >
                    <option value="">Select department to this employee</option>
                    <option value="tech">M Tech Department</option>
                    <option value="sales">M Sales Department</option>
                    <option value="marketing">Marketing Department</option>
                  </select>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    value={formData.profession}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      name="tg_username"
                      placeholder="@username"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      value={formData.tg_username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 space-y-5 max-w-[320px] w-full">
                {/* Avatar */}
                <div className="flex flex-col items-center justify-center border border-gray-300 rounded-[24px] p-6 h-[300px]">
                {/* Avatar Image Preview */}
                <div className="w-[180px] h-[180px] bg-[#DBDBDB] rounded-full overflow-hidden flex justify-center items-center">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={avatarImage} alt="" />
                    )}
                  </div>

                {/* Upload Button */}
                <label
                    htmlFor="avatarUpload"
                    className="cursor-pointer w-full mt-7 text-[18px] font-bold flex items-center gap-8 justify-between"
                  >
                    Upload Avatar
                    <div className="w-[48px] h-[48px] bg-[#DBDBDB] rounded-[14px] text-[#1F2937] justify-center flex items-center">
                      <Paperclip size={24} />
                    </div>
                  </label>
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    className="w-full border border-[#D8E0F0] rounded-[14px] px-3 py-2 mt-1"
                    placeholder="Select Date"
                    value={formData.birth_date}
                    onChange={handleChange}
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select level</option>
                    <option value="junior">junior</option>
                    <option value="middle">middle</option>
                    <option value="senior">senior</option>
                    <option value="none">none</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>
            </form>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#0061FE] hover:bg-[#111827] text-white px-[40px] py-[13px] rounded-[14px] cursor-pointer shadow-md shadow-blue-300"
                onClick={handleSubmit}
              >
                Save Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InnerCircle;