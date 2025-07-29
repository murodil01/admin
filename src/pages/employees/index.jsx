import {
  Funnel,
  Plus,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Activity from "./activity";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";

const itemsPerPage = 7;

const employees = [
  {
    id: 1,
    name: "Murodil",
    surname: "Nurmamatov",
    phone: "+998 90 123 45 67",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "Frontend Developer",
    positionLevel: "Junior",
    department: "M Technology",
    taskCount: 5,
    status: "Busy",
  },
  {
    id: 2,
    name: "Bobur",
    surname: "Allayorov",
    phone: "+998 90 094 00 83",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    role: "Backend Developer",
    positionLevel: "Junior",
    department: "M Technology",
    taskCount: 10,
    status: "Busy",
  },
  {
    id: 3,
    name: "Ziyoda",
    surname: "Karimova",
    phone: "+998 91 555 55 55",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    role: "UI/UX Designer",
    positionLevel: "Mid",
    department: "Design Team",
    taskCount: 4,
    status: "Free",
  },
  {
    id: 4,
    name: "Jasur",
    surname: "Qodirov",
    phone: "+998 93 777 77 77",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    role: "DevOps Engineer",
    positionLevel: "Senior",
    department: "Infrastructure",
    taskCount: 12,
    status: "Busy",
  },
  {
    id: 5,
    name: "Dilnoza",
    surname: "To'xtayeva",
    phone: "+998 90 888 88 88",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    role: "QA Engineer",
    positionLevel: "Junior",
    department: "QA Team",
    taskCount: 3,
    status: "Free",
  },
  {
    id: 6,
    name: "Aziz",
    surname: "Sattorov",
    phone: "+998 94 666 66 66",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    role: "Project Manager",
    positionLevel: "Mid",
    department: "Management",
    taskCount: 8,
    status: "Busy",
  },
  {
    id: 7,
    name: "Malika",
    surname: "Soliyeva",
    phone: "+998 97 222 22 22",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    role: "Frontend Developer",
    positionLevel: "Mid",
    department: "M Technology",
    taskCount: 6,
    status: "Free",
  },
  {
    id: 8,
    name: "Sherzod",
    surname: "Sattorov",
    phone: "+998 93 333 33 33",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    role: "Fullstack Developer",
    positionLevel: "Senior",
    department: "M Technology",
    taskCount: 15,
    status: "Busy",
  },
  {
    id: 9,
    name: "Nodira",
    surname: "Ortiqova",
    phone: "+998 95 444 44 44",
    image: "https://randomuser.me/api/portraits/women/9.jpg",
    role: "Product Owner",
    positionLevel: "Senior",
    department: "Management",
    taskCount: 7,
    status: "Free",
  },
  {
    id: 10,
    name: "Ulug‘bek",
    surname: "Maxmudov",
    phone: "+998 90 999 99 99",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
    role: "Security Analyst",
    positionLevel: "Mid",
    department: "Security",
    taskCount: 2,
    status: "Busy",
  },
];

const Employees = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "list";
  });

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = employees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
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

  const [avatar, setAvatar] = useState(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const [passportName, setPassportName] = useState("Upload Passport");

  const handlePassportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPassportName(file.name);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-[#1F2937] font-bold text-3xl sm:text-xl  xl:text-4xl">
          Employees ({employees.length})
        </h1>

        <div className="flex items-center bg-[#DBDBDB] xl:p-[3px] rounded-4xl w-full m-auto md:w-[250px] xl:w-[350px]">
          <button
            onClick={() => handleTabClick("list")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${
              activeTab === "list"
                ? "bg-[#1F2937] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
            }`}
          >
            List
          </button>

          <button
            onClick={() => handleTabClick("activity")}
            className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] md:text-[14px] lg:text-[16px] font-bold transition-all duration-200 ${
              activeTab === "activity"
                ? "bg-[#1F2937] text-white"
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
            className="hidden md:flex bg-[#1F2937] text-white text-sm lg:text-base rounded-2xl items-center gap-2 py-2 px-3 xl:py-3 xl:px-5"
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
                      src={emp.image}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#1F2937] font-semibold text-base truncate max-w-[180px]">
                        {emp.name} {emp.surname}
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
                          {emp.positionLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Phone number
                    </span>
                    {emp.phone}
                  </div>
                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Department
                    </span>
                    {emp.department}
                  </div>
                  <div className="text-[#1F2937] font-medium truncate flex flex-col text-center md:text-[13px] xl:text-base">
                    <span className="text-gray-500 text-sm truncate">
                      Tasks
                    </span>
                    {emp.taskCount}
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
                        src={emp.image}
                        alt={emp.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[#1F2937] font-semibold text-base">
                          {emp.surname} {emp.name}
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
                          {emp.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400">Tasks</p>
                        <p className="text-[#1F2937] font-medium">
                          {emp.taskCount}
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
                          className="bg-[#1F2937] text-white px-10 py-2 rounded-2xl text-[16px] text-sm font-bold block m-auto"
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
          onClick={() => console.log("Add Employee clicked")}
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
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      placeholder="First Name"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    placeholder="Email"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                    placeholder="Password"
                  />
                  <Eye
                    className="absolute right-3 top-[43px] text-gray-400"
                    size={20}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                    placeholder="Confirm Password"
                  />
                  <Eye
                    className="absolute right-3 top-[43px] text-gray-400"
                    size={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select role</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select department</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <input
                    type="text"
                    defaultValue="Backend Developer"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue="+998991234567"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      defaultValue="@username"
                      className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex-1 space-y-5 max-w-[320px] w-full">
                {/* Avatar */}
                <div className="flex flex-col items-center justify-center border border-gray-300 rounded-[24px] p-6 h-[230px]">
                  {/* Avatar Image Preview */}
                  <div className="w-28 h-28 bg-[#DBDBDB] rounded-full overflow-hidden flex justify-center items-center">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-gray-400">👤</span>
                    )}
                  </div>

                  {/* Upload Button */}
                  <label
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
                </div>

                {/* Passport */}
                <div>
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
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    className="w-full border border-[#D8E0F0] rounded-[14px] px-3 py-2 mt-1"
                    placeholder="Select Date"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1">
                    <option>Select level</option>
                  </select>
                </div>

                {/* Passport Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Passport Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="AD1234567"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  />
                </div>

                {/* PINFL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PINFL
                  </label>
                  <input
                    type="text"
                    placeholder="12345678901234"
                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                  />
                </div>
              </div>
            </form>

            {/* Save Button */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#1F2937] hover:bg-[#111827] text-white px-[40px] py-[13px] rounded-[14px]"
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

export default Employees;
