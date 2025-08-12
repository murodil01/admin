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
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Activity from "./activity";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import { getEmployees, createEmployees } from "../../api/services/employeeService";

const itemsPerPage = 10;

const InnerCircle = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("innerCircleTab") || "list";
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    password: "",
    password1: "",
    email: "",
    // status: "",
    // level: "",
    role: "",
    // profession: "",
    birth_date: "",
    phone_number: "",
    tg_username: "",
    // department: "",
    // passportSerial: "",
    // pinfl: "",
  });

  // const [avatar, setAvatar] = useState(null);
  // const [passportFile, setPassportFile] = useState(null);
  // const [passportName, setPassportName] = useState("Upload passport");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parolni tekshirish
    if (formData.password !== formData.password1) {
      alert("Parollar mos kelmadi!");
      return;
    }

    // Boshqa zarur maydonlarni tekshirish
    if (!formData.first_name || !formData.email) {
      alert("Majburiy maydonlarni to'ldiring!");
      return;
    }
    try {
      // FormData o'rniga oddiy object yuboramiz
      const requestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password1: formData.password1,
        role: formData.role,
        birth_date: formData.birth_date,
        phone_number: formData.phone_number,
        tg_username: formData.tg_username,
        department: {
          name: "Department Name", // Bu qiymatni formdan olishingiz kerak
          department_id: "uuid-string" // Haqiqiy department ID
        }
      };

      console.log("Yuborilayotgan ma'lumot:", requestData);

      await createEmployees(requestData);
      setIsAddModalOpen(false);
      // Yangi xodim qo'shilgandan so'ng ro'yxatni yangilash
      getEmployees().then(res => setEmployees(res.data.results || []));
    } catch (err) {
      console.error("Xodim qo'shishda xato:", err);
      if (err.response) {
        console.error("Server javobi:", err.response.data);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees()
      .then((res) => {
        const employeesData = Array.isArray(res) ? res : res?.results || [];
        setEmployees(employeesData); // API’dan kelgan ma’lumot
      })
      .catch((err) => {
        console.error("Xatolik:", err);
        setEmployees([]); // Xato bo'lsa bo'sh array qilib qo'yish
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = Array.isArray(employees || []) ? employees.slice(
    startIndex,
    startIndex + itemsPerPage
  ) : [];

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
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
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsFilterModalOpen(false);
      }
    };

    if (isFilterModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterModalOpen]);

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
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsAddModalOpen(false);
        localStorage.setItem("addModalOpen", "false");
      }
    };

    if (isAddModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddModalOpen]);

  // const [avatar, setAvatar] = useState(null);

  // const handleAvatarUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setAvatar(URL.createObjectURL(file));
  //   }
  // };

  // const [passportName, setPassportName] = useState("Upload Passport");

  // const handlePassportUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setPassportName(file.name);
  //   }
  // };

  if (loading) return <p>Yuklanmoqda...</p>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-7 md:mt-1 mb-6 gap-4">
        <h1 className="text-[#1F2937] font-bold text-3xl sm:text-xl  xl:text-4xl">
          Inner Circle ({employees.length})
        </h1>

        <div className="flex items-center bg-[#DBDBDB] xl:p-[3px] rounded-4xl w-full m-auto md:w-[250px] xl:w-[350px]">
          <button
            onClick={() => handleTabClick("list")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${
              activeTab === "list"
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
            }`}
          >
            List
          </button>

          <button
            onClick={() => handleTabClick("activity")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] md:text-[14px] lg:text-[16px] font-bold transition-all duration-200 ${
              activeTab === "activity"
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
        <>
          <div className="space-y-4">
            {currentEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-3xl lg:rounded-3xl shadow p-4 flex flex-col gap-4"
              >
                {/* Desktop Layout */}
                {/* <div
                  className={`hidden lg:grid items-center transition-all duration-300 ${
                    collapsed
                      ? "grid-cols-[1fr_1fr_1fr_0.5fr_0.8fr_40px] gap-10"
                      : "grid-cols-[270px_290px_150px_100px_120px_40px] gap-10"
                  }`}
                > */}
                <div
                  className={`hidden lg:grid grid-cols-[2fr_1.8fr_1fr_1fr_0.5fr_0.2fr] items-center transition-all duration-300 rounded-2xl`}
                >
                  <div className="flex items-center gap-4 lg:gap-2">
                    <img
                      src={emp.profile_picture}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#1F2937] font-semibold text-base truncate max-w-[180px]">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-500 text-sm truncate">
                          {emp.role}
                        </div>
                        <div
                          className={`mt-1 inline-block px-3 py-[3px] rounded-md text-xs font-medium border ${
                            emp.positionLevel === "Junior"
                              ? "border-blue-500 text-blue-600"
                              : emp.positionLevel === "Middle"
                              ? "border-yellow-500 text-yellow-600"
                              : emp.positionLevel === "Senior"
                              ? "border-green-500 text-green-600"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {emp.level}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Phone number
                    </span>
                    {emp.phone_number}
                  </div>
                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Department
                    </span>
                    {emp.department}
                  </div>
                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Projects
                    </span>
                    {emp.project_count}
                  </div>
                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Status
                    </span>
                    <span
                      className={`inline-block py-[3px] rounded-lg text-xs font-medium border ${
                        emp.status === "Free"
                          ? "border-green-400 text-green-600"
                          : "border-yellow-400 text-yellow-600"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="relative flex justify-end">
                    <button onClick={() => toggleDropdown(emp.id)}>
                      <MoreVertical size={20} className="text-[#1F2937]" />
                    </button>
                    {openDropdown === emp.id && (
                      <div className="absolute z-10 top-full mt-2 right-0 w-36 bg-white border-none rounded shadow">
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                          Edit
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                          Delete
                        </button>
                        <button
                          onClick={() => navigate(`/profile/${emp.id}`)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-500"
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div
                  className="flex flex-col lg:hidden gap-3 cursor-pointer"
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
                        <p className="text-[#1F2937] font-semibold text-base">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-gray-500 text-sm">{emp.role}</p>
                      </div>
                    </div>
                    {/* Faqat vizual icon uchun */}
                    <div>
                      {openDropdown === emp.id ? (
                        <FaChevronUp className="text-[#1F2937]" />
                      ) : (
                        <FaChevronDown className="text-[#1F2937]" />
                      )}
                    </div>
                  </div>

                  {openDropdown === emp.id && (
                    <div className="grid grid-cols-2 gap-y-5 gap-x-14 text-sm px-2 border-t border-gray-200 pt-2">
                      <div>
                        <p className="text-gray-400">Phone number:</p>
                        <p className="text-[#1F2937] font-medium">
                          {emp.phone_number}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Projects</p>
                        <p className="text-[#1F2937] font-medium">
                          {emp.project_count}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Department</p>
                        <p className="text-[#1F2937] font-medium mt-[6px]">
                          {emp.department}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Status</p>
                        <span
                          className={`inline-block mt-1 text-xs font-medium px-4 py-[3px] rounded-lg border ${
                            emp.status === "Free"
                              ? "border-green-400 text-green-600"
                              : "border-yellow-400 text-yellow-600"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </div>

                      <div className="col-span-2 mt-3">
                        <button
                          className="bg-[#0061fe] text-white px-10 py-2 rounded-2xl text-[16px] text-sm font-bold block m-auto"
                          onClick={(e) => {
                            e.stopPropagation(); // dropdown yopilib ketmasligi uchun
                            navigate(`/profile/${emp.id}`);
                          }}
                        >
                          More
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center md:justify-end">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl text-sm text-[#1F2937] shadow-sm">
              <span>
                {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, employees.length)} of{" "}
                {employees.length}
              </span>

              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-full ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                <ArrowLeft />
              </button>

              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded-full ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </>
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
            <form className="flex  flex-col lg:flex-row gap-[50px]">
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

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select role</option>
                  </select>
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select department</option>
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    value={formData.role}
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
                {/* <div className="flex flex-col items-center justify-center border border-gray-300 rounded-[24px] p-6 h-[230px]"> */}
                  {/* Avatar Image Preview */}
                  {/* <div className="w-28 h-28 bg-[#DBDBDB] rounded-full overflow-hidden flex justify-center items-center">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-gray-400">👤</span>
                    )}
                  </div> */}

                  {/* Upload Button */}
                  {/* <label
                    htmlFor="avatarUpload"
                    className="cursor-pointer w-full mt-3 text-[18px] font-bold flex items-center gap-8 justify-between"
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
                </div> */}

                {/* Passport */}
                {/* <div>
                  <label
                    htmlFor="passportUpload"
                    className="cursor-pointer mt-3 w-full h-[68px] border border-[#CED5E0] rounded-[24px] px-7 py-2 text-[18px] font-bold flex items-center justify-between"
                  >
                    {passportName.length > 25
                      ? `${passportName.slice(0, 22)}...`
                      : passportName}

                    <div className="w-[48px] h-[48px] bg-[#DBDBDB] rounded-[14px] text-[#1F2937] justify-center flex items-center">
                      <Paperclip size={24} />
                    </div>
                  </label>

                  <input
                    type="file"
                    id="passportUpload"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handlePassportUpload}
                  />
                </div> */}

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
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select level</option>
                  </select>
                </div> */}

                {/* Passport Serial Number */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Passport Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="AD1234567"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  />
                </div> */}

                {/* PINFL */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PINFL
                  </label>
                  <input
                    type="text"
                    placeholder="12345678901234"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  />
                </div> */}
              </div>
            </form>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#1F2937] hover:bg-[#111827] text-white px-[40px] py-[13px] rounded-[14px] cursor-pointer"
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
