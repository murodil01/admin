import { useEffect, useState } from "react";
import {
  Upload as UploadIcon,
  ChevronDown as DropdownArrow,
  ArrowLeft,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Projects from "./projects";
import Notes from "./notes";
import Profiles from "./profile";
import { getEmployeeById, updateEmployees } from "../../../api/services/employeeService";
import { getDepartments } from "../../../api/services/departmentService";
import { message } from "antd";
import { Permission } from "../../../components/Permissions";
import { useAuth } from "../../../hooks/useAuth";
import { ROLES } from "../../../components/constants/roles";

const Profile = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("profileTab") || "Profile";
  });

  const [birthday, setBirthday] = useState("1996-05-19");
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const { id } = useParams();
  const [saveMessage, setSaveMessage] = useState("");

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const isAdmin = [ROLES.FOUNDER, ROLES.MANAGER].includes(user?.role);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await getDepartments();
        const departmentsData = response.results || response.data || response;

        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData);
        } else {
          message.error('Failed to load departments - invalid data format');
        }
      } catch (err) {
        message.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!id) return;
    // console.log("Employee ID:", id); // Check the ID format

    const fetchEmployee = async () => {
      try {
        const data = await getEmployeeById(id);
        setEmployee(data);
        setBirthday(data.birthday || "");
      } catch (err) {
        // console.error("Error fetching employee:", err);
        if (err.response?.status === 404) {
          message.error("Employee not found");
          navigate("/employees"); // Redirect if employee doesn't exist
        } else {
          message.error("Failed to load employee data");
        }
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!employee) return;

    try {
      const formattedBirthday = birthday
        ? new Date(birthday).toISOString().split("T")[0]
        : null;

      const formData = new FormData();

      // 1. Backend talabiga ko'ra departmentni yuborish
      // Agar backend 'department_id' talab qilsa:
      formData.append('department_id', employee.department?.id || '');
      // Yoki agar 'department' talab qilsa:
      formData.append('department', employee.department?.id || '');

      // 2. Boshqa maydonlarni qo'shamiz
      Object.entries(employee).forEach(([key, value]) => {
        if (key === 'department') return; // Departmentni allaqachon qo'shganmiz
        if (key === 'profile_picture') {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // 3. Tug'ilgan kunini qo'shamiz
      if (formattedBirthday) {
        formData.append('birth_date', formattedBirthday);
      }

      // 5. API so'rovini yuboramiz
      const updatedEmployee = await updateEmployees(employee.id, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 6. Yangilangan ma'lumotlarni saqlaymiz
      setEmployee({
        ...updatedEmployee,
        department: {
          id: updatedEmployee.department?.id || employee.department?.id,
          name: updatedEmployee.department?.name ||
                updatedEmployee.department_name ||
                employee.department?.name
        }
      });

      setIsEditing(false);
      setSaveMessage("✅ Ma'lumotlar muvaffaqiyatli saqlandi");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage(`❌ Saqlashda xatolik: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setSaveMessage(""), 5000);
    }
  };

  useEffect(() => {
    localStorage.setItem("profileTab", activeTab);
  }, [activeTab]);

    if (!isAuthenticated) return <div>Please login</div>;

  const SidebarSections = employee
    ? [
      {
        title: "Main Info",
        data: [
          {
            label: "Department",
            name: "department",
            value: employee.department?.id || "",
            displayValue: employee.department?.name || "",
            input: true,
            options: departments,
            isSelect: true
          },
          {
            label: "Status",
            name: "status",
            value: employee.status || "",
            input: true
          },
        ],
      },
      {
        title: "Contact Info",
        data: [
          {
            label: "Mobile Number",
            name: "phone_number",
            value: employee.phone_number || "",
            input: true
          },
          {
            label: "Telegram username",
            name: "tg_username",
            value: employee.tg_username || "",
            input: true
          },
        ],
      },
      {
        data: [
          {
            label: "Email",
            name: "email",
            value: employee.email || "",
            input: true
          },
          {
            label: "Join Date",
            value: new Date(employee.created_at).toLocaleDateString("en-GB"),
            input: false
          },
          {
            label: "Birthday Date",
            name: "birth_date",
            value: employee.birth_date || "",
            input: true,
            type: "date"
          },
        ],
      },
    ]
    : [];

    const availableTabs = [
      { id: "Profile", label: "Profile", visible: isAdmin },
      { id: "Projects", label: "Projects", visible: true }, // Always visible
      { id: "Notes", label: "Notes", visible: isAdmin },
    ].filter(tab => tab.visible);

    // If current tab becomes unavailable, switch to Projects
    useEffect(() => {
      if (!availableTabs.some(tab => tab.id === activeTab)) {
        setActiveTab("Projects");
      }
    }, [isAdmin, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return isAdmin ? <Profiles /> : null;
      case "Projects":
        return <Projects />; // Always visible to all roles
      case "Notes":
        return isAdmin ? <Notes /> : null;
      default:
        return null;
    }
  };

  if (!employee) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-4 md:py-6 px-4 sm:px-6">
        {/* Orqaga qaytish tugmasi */}
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/employees")}
            className="flex justify-center rounded-[14px] items-center gap-2 text-sm md:text-[16px] font-bold text-[#1F2937] hover:text-[#6b82a8] shadow bg-white w-[100px] md:w-[133px] h-[40px] md:h-[48px]"
          >
            <ArrowLeft size={16} className="md:size-5" />
            <span className="hidden sm:inline">Go Back</span>
            <span className="sm:hidden">Back</span>
          </button>

          {saveMessage && (
            <div className="text-xs md:text-sm p-2 md:p-3 rounded bg-green-100 text-green-700">
              {saveMessage}
            </div>
          )}
        </div>

        {/* Asosiy kontent */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* SIDEBAR */}
          <div className="w-full lg:w-[350px] xl:w-[430px] bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] p-4 md:p-6 shadow-sm relative">
            {/* Edit icon */}
            <div className="absolute top-4 md:top-5 right-4 md:right-5 z-10">
              <button
                id="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDropdown((prev) => !prev);
                }}
                className="p-1 md:p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {showEditDropdown && (
                <div
                  id="edit-dropdown"
                  className="absolute top-full right-0 mt-1 md:mt-2 z-20 bg-white border border-gray-200 rounded-md shadow-md w-24 md:w-28"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowEditDropdown(false);
                    }}
                    className="w-full px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm text-left hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Profile section */}
            <div
              className="flex items-center border-b border-[#E4E6E8] pb-4 md:pb-5 cursor-pointer"
              onClick={() => setShowDetails(!showDetails)}
            >
              <img
                src={employee.profile_picture}
                alt="Profile"
                className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] rounded-full object-cover ring-2 md:ring-4 ring-gray-100"
              />
              <div className="ml-3 md:ml-4 flex flex-col">
                <h3 className="text-sm sm:text-[16px] md:text-[18px] lg:text-[20px] font-bold text-[#0061fe] whitespace-nowrap">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-xs sm:text-[14px] md:text-[16px] font-medium text-[#1F2937] flex items-center gap-1 md:gap-2">
                  {employee.role}
                  <span className="text-[8px] md:text-[10px] border border-[#7D8592] px-1 py-0.5 md:px-[2px] md:py-[2px] rounded-[3px] md:rounded-[4px]">
                    {employee.level}
                  </span>
                </p>
              </div>
            </div>

            {/* Content info */}
            <div className={`mt-4 md:mt-6 space-y-6 md:space-y-8 ${showDetails ? "block" : "hidden lg:block"}`}>
              {SidebarSections.map((section, index) => (
                <div key={index}>
                  {section.title && (
                    <h4 className="text-[#0061fe] text-[16px] md:text-[18px] font-bold mb-3 md:mb-4">
                      {section.title}
                    </h4>
                  )}
                  <div className="space-y-4 md:space-y-7">
                    {section.data.map((item, idx) => (
                      <div key={idx}>
                        <div className="text-xs md:text-[14px] text-[#7D8592] font-bold mb-2 md:mb-3">
                          {item.label}
                        </div>
                        {item.input ? (
                          isEditing ? (
                            item.isSelect ? (
                              <select
                                name={item.name}
                                value={employee.department?.id || ""}
                                onChange={(e) => {
                                  const selectedDept = departments.find(d => d.id === e.target.value);
                                  setEmployee(prev => ({
                                    ...prev,
                                    department: selectedDept ? {
                                      id: selectedDept.id,
                                      name: selectedDept.name
                                    } : null
                                  }));
                                }}
                                className="w-full h-[40px] md:h-[48px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 font-normal text-xs md:text-[14px] text-[#7D8592] pr-8 md:pr-10"
                              >
                                <option value="">Select department</option>
                                {departments.map(dept => (
                                  <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="relative">
                                <input
                                  type={item.type || "text"}
                                  name={item.name}
                                  value={employee[item.name] || ""}
                                  onChange={(e) =>
                                    setEmployee((prev) => ({
                                      ...prev,
                                      [item.name]: e.target.value,
                                    }))
                                  }
                                  className="w-full h-[40px] md:h-[48px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 font-normal text-xs md:text-[14px] text-[#7D8592] pr-8 md:pr-10"
                                />
                                {item.type === "date" && (
                                  <Calendar className="absolute right-2 md:right-3 top-2 md:top-2.5 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
                                )}
                              </div>
                            )
                          ) : (
                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 text-xs md:text-[14px] font-normal text-[#7D8592] h-[40px] md:h-[48px] flex items-center">
                              {item.isSelect ?
                                employee.department?.name || "No department selected" // Show department name
                                : item.value}
                            </div>
                          )
                        ) : (
                          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg md:rounded-xl px-3 md:px-4 py-1 md:py-2 text-xs md:text-[14px] font-normal text-[#7D8592] h-[40px] md:h-[48px] flex items-center">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {isEditing && (
                <div className="mt-4 md:mt-6">
                  <button
                    onClick={handleSave}
                    className="w-full h-[40px] md:h-[48px] bg-[#0061fe] text-white py-1 md:py-2 rounded-lg md:rounded-xl text-center text-xs md:text-sm flex items-center justify-center gap-1 md:gap-2"
                  >
                    <UploadIcon size={14} className="md:size-4" />
                    <span>Save edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-2 md:gap-4">
              <div className="flex flex-wrap sm:flex-nowrap bg-[#E3EDFA] rounded-full p-0.5 md:p-1 w-full sm:w-auto">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 lg:px-[40px] xl:px-[56px] py-1 md:py-2 text-xs md:text-sm lg:text-base font-medium rounded-full transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-[#0061fe] text-white shadow-sm"
                        : "text-[#0061fe] hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;