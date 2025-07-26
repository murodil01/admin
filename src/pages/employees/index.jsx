/*import {
  Funnel,
  Plus,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const itemsPerPage = 5;

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
  const { collapsed } = useSidebar();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = employees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "activity") {
      navigate("/activity");
    }
    else if(tab === "list") {  
      navigate("/list");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-[#1F2937] font-bold text-3xl sm:text-4xl">
          Employees ({employees.length})
        </h1>

        <div className="flex items-center bg-[#DBDBDB] p-[3px] rounded-4xl w-full m-auto md:w-[350px]">
          <button
            onClick={() => handleTabClick("list")}
            className={`py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${
              activeTab === "list"
                ? "bg-[#1F2937] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
            }`}
          >
            List
          </button>

          <button
            onClick={() => handleTabClick("activity")}
            className={`py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${
              activeTab === "activity"
                ? "bg-[#1F2937] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
            }`}
          >
            Activity
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 bg-white shadow rounded-2xl items-center justify-center">
            <Funnel className="text-[24px] text-[#1F2937]" />
          </div>
          <button className="hidden md:flex bg-[#1F2937] text-white text-[16px] rounded-2xl items-center gap-2 py-3 px-5">
            <Plus /> Add Employee
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-3xl lg:rounded-2xl shadow p-4 flex flex-col gap-4"
          >
            <div
              className={`hidden lg:grid items-center transition-all duration-300 ${
                collapsed
                  ? "grid-cols-[1fr_1fr_1fr_0.5fr_0.8fr_40px] gap-10"
                  : "grid-cols-[270px_290px_150px_100px_120px_40px] gap-10"
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={emp.image}
                  alt={emp.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-[#1F2937] font-semibold text-base truncate max-w-[180px]">
                    {emp.name} {emp.surname}
                  </p>
                  <p className="text-gray-500 text-sm truncate">{emp.phone}</p>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Role</span>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[#1F2937] font-medium truncate">
                    {emp.role}
                  </div>
                  <div
                    className={`min-w-[70px] h-[26px] flex items-center justify-center rounded-md px-3 text-xs font-medium ${
                      emp.positionLevel === "Junior"
                        ? "border border-blue-500 text-blue-600"
                        : emp.positionLevel === "Middle"
                        ? "border border-yellow-500 text-yellow-600"
                        : emp.positionLevel === "Senior"
                        ? "border border-green-500 text-green-600"
                        : "border border-gray-300 text-gray-600"
                    }`}
                  >
                    {emp.positionLevel}
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Department</span>
                <span className="text-[#1F2937] font-medium truncate ">
                  {emp.department}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Tasks</span>
                <span className="text-[#1F2937] font-medium">
                  {emp.taskCount}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-1">Status</span>
                <span
                  className={`text-xs font-medium px-4 py-[3px] rounded-lg border w-fit ${
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
                  <div className="absolute z-10 top-full mt-2 right-0 w-36 bg-white border rounded shadow">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Edit
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:hidden gap-3">
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
                <button onClick={() => toggleDropdown(emp.id)}>
                  {openDropdown === emp.id ? (
                    <FaChevronUp className="text-[#1F2937]" />
                  ) : (
                    <FaChevronDown className="text-[#1F2937]" />
                  )}
                </button>
              </div>

              {openDropdown === emp.id && (
                <div className="grid grid-cols-2 gap-y-5 gap-x-14 text-sm px-2 border-t border-gray-200 pt-2">
                  <div>
                    <p className="text-gray-400">Phone number:</p>
                    <p className="text-[#1F2937] font-medium">{emp.phone}</p>
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
                    <button className="bg-[#1F2937] text-white px-10 py-2 rounded-2xl text-[16px] text-sm font-bold block m-auto">
                      More
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center md:justify-end">
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl text-sm text-[#1F2937] shadow-sm">
          <span>
            {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, employees.length)} of{" "}
            {employees.length}
          </span>

          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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

      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <button
          className="w-14 h-14 bg-[#1F2937] text-white rounded-full flex items-center justify-center shadow-lg"
          onClick={() => console.log("Add Employee clicked")}
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};

export default Employees;*/

import {
  Funnel,
  Plus,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "../../context";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Activity from "./activity";
import { useNavigate } from "react-router-dom";

const itemsPerPage = 5;

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
  const { collapsed } = useSidebar();
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

  return (
    <div className="pl-3 pr-2">
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
          <div className="hidden md:flex w-10 h-10 xl:w-12 xl:h-12 bg-white shadow rounded-xl xl:rounded-2xl items-center justify-center">
            <Funnel className="!text-[18px] !xl:text-[24px] text-[#1F2937]" />
          </div>
          <button className="hidden md:flex bg-[#1F2937] text-white text-sm lg:text-base rounded-2xl items-center gap-2 py-2 px-3 xl:py-3 xl:px-5">
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
                className="bg-white rounded-3xl lg:rounded-2xl shadow p-4 flex flex-col gap-4"
              >
                {/* Desktop Layout */}
                <div
                  className={`hidden lg:grid items-center transition-all duration-300 ${
                    collapsed
                      ? "grid-cols-[1fr_1fr_1fr_0.5fr_0.8fr_40px] gap-10"
                      : "grid-cols-[270px_290px_150px_100px_120px_40px] gap-10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={emp.image}
                      alt={emp.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#1F2937] font-semibold text-base truncate max-w-[180px]">
                        {emp.name} {emp.surname}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {emp.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm mb-1">Role</span>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[#1F2937] font-medium truncate">
                        {emp.role}
                      </div>
                      <div
                        className={`min-w-[70px] h-[26px] flex items-center justify-center rounded-md px-3 text-xs font-medium ${
                          emp.positionLevel === "Junior"
                            ? "border border-blue-500 text-blue-600"
                            : emp.positionLevel === "Mid"
                            ? "border border-yellow-500 text-yellow-600"
                            : emp.positionLevel === "Senior"
                            ? "border border-green-500 text-green-600"
                            : "border border-gray-300 text-gray-600"
                        }`}
                      >
                        {emp.positionLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm mb-1">
                      Department
                    </span>
                    <span className="text-[#1F2937] font-medium truncate ">
                      {emp.department}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm mb-1">Tasks</span>
                    <span className="text-[#1F2937] font-medium">
                      {emp.taskCount}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm mb-1">Status</span>
                    <span
                      className={`text-xs font-medium px-4 py-[3px] rounded-lg border w-fit ${
                        emp.status === "Free"
                          ? "border-green-400 text-green-600"
                          : "border-yellow-400 text-yellow-600"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-sm mb-1">Status</span>
                    <span
                      className={`text-xs font-medium px-4 py-[3px] rounded-lg border w-fit ${
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
                <div className="flex flex-col lg:hidden gap-3">
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
                    <button onClick={() => toggleDropdown(emp.id)}>
                      {openDropdown === emp.id ? (
                        <FaChevronUp className="text-[#1F2937]" />
                      ) : (
                        <FaChevronDown className="text-[#1F2937]" />
                      )}
                    </button>
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
                        <button className="bg-[#1F2937] text-white px-10 py-2 rounded-2xl text-[16px] text-sm font-bold block m-auto">
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
    </div>
  );
};

export default Employees;
