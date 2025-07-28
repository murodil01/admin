import { useState } from "react";
import {
  Download as DownloadIcon,
  Calendar,
  ChevronUp,
  ChevronDown,
  Filter,
  ChevronDown as DropdownArrow,
  Upload as UploadIcon,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockTasks = [
  {
    id: "1",
    number: "PN0001265",
    title: "Medical App (iOS native)",
    createdDate: "Sep 12, 2020",
    priority: "Medium",
    allTasks: 34,
    activeTasks: 13,
    assignees: [
      { id: "1", name: "John Doe", avatar: "", color: "bg-red-500" },
      { id: "2", name: "Jane Smith", avatar: "", color: "bg-orange-500" },
      { id: "3", name: "Mike Johnson", avatar: "", color: "bg-gray-500" },
      { id: "4", name: "Sarah Wilson", avatar: "", color: "bg-blue-500" },
    ],
    iconBg: "bg-gradient-to-br from-yellow-400 to-pink-500",
    iconColor: "text-white",
    icon: "🏥",
  },
  {
    id: "2",
    number: "PN0001221",
    title: "Food Delivery Service",
    createdDate: "Sep 10, 2020",
    priority: "Medium",
    allTasks: 50,
    activeTasks: 24,
    assignees: [
      { id: "1", name: "Alex Brown", avatar: "", color: "bg-red-500" },
      { id: "2", name: "Emma Davis", avatar: "", color: "bg-orange-500" },
      { id: "3", name: "Chris Lee", avatar: "", color: "bg-yellow-500" },
    ],
    iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
    iconColor: "text-white",
    icon: "🍔",
  },
  {
    id: "3",
    number: "PN0001290",
    title: "Internal Project",
    createdDate: "May 28, 2020",
    priority: "Low",
    allTasks: 23,
    activeTasks: 20,
    assignees: [
      { id: "1", name: "Tom Anderson", avatar: "", color: "bg-red-500" },
      { id: "2", name: "Lisa Garcia", avatar: "", color: "bg-orange-500" },
      { id: "3", name: "David Miller", avatar: "", color: "bg-gray-500" },
      { id: "4", name: "Rachel Taylor", avatar: "", color: "bg-blue-500" },
    ],
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
    iconColor: "text-white",
    icon: "🏢",
  },
];

const SidebarInfo = [
  { label: "Department", value: "M Technologies" },
  { label: "Status", value: "Working" },
  { label: "Join Date", value: "May 01, 2025" },
  { label: "Birthday Date", value: "May 19, 1996" },
  { label: "Email", value: "evanyates@gmail.com" },
  { label: "Mobile Number", value: "+998 94 123 45-67" },
  { label: "Telegram username", value: "@boburallayorov" },
  { label: "Serial Number", value: "AD 1114567" },
  { label: "PINFL", value: "45245875495734" },
];

// Custom Upload Component
const CustomUpload = ({ fileList, onChange }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newFileList = files.map((file, index) => ({
      uid: `${Date.now()}-${index}`,
      name: file.name,
      status: "done",
      originFileObj: file,
    }));
    onChange({ fileList: [...fileList, ...newFileList] });
  };

  const removeFile = (uid) => {
    onChange({ fileList: fileList.filter((file) => file.uid !== uid) });
  };

  return (
    <div className="w-full">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="w-full h-[48px] bg-[#1F2937] text-white text-sm font-medium px-6 rounded-[14px] hover:bg-[#111827] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <UploadIcon size={18} />
        <span>Upload File</span>
      </label>

      {fileList.length > 0 && (
        <div className="mt-3 space-y-2">
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
            >
              <span className="text-sm text-gray-600 truncate flex-1">
                📄 {file.name}
              </span>
              <button
                onClick={() => removeFile(file.uid)}
                className="text-red-500 hover:text-red-700 text-sm ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Pagination Component
const CustomPagination = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`px-3 py-1 rounded text-sm ${
            current === page
              ? "bg-blue-500 text-white"
              : "border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Tasks");
  const [currentPage, setCurrentPage] = useState(1);
  const [fileList, setFileList] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const itemsPerPage = 2;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "Low") return <ChevronDown className="w-4 h-4" />;
    return <ChevronUp className="w-4 h-4" />;
  };

  const paginatedTasks = mockTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Container with responsive padding */}
      <div className="pl-3  py-4 md:py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-[#0A1629] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[36px] text-left">
              Employee's Profile
            </h1>

            {/* Back button */}
            <button
              onClick={() => navigate("/employees")}
              className="flex items-center gap-2 text-[#0A1629] hover:text-[#6b82a8] transition-colors font-semibold text-sm sm:text-base"
            >
              <ChevronLeft size={20} />
              Back
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col xl:flex-row gap-4 md:gap-6 w-full">
          {/* Sidebar */}
          <div className="w-full xl:w-[280px] 2xl:w-[320px] bg-white shadow-sm border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6">
            {/* Profile Header */}
            <div
              className="flex flex-row xl:flex-col items-center justify-between xl:justify-start gap-3 md:gap-4 cursor-pointer xl:cursor-default"
              onClick={() => {
                if (window.innerWidth < 1280) {
                  setShowDetails((prev) => !prev);
                }
              }}
            >
              {/* Profile Info */}
              <div className="flex items-center gap-3 md:gap-4 xl:flex-col xl:items-center w-full xl:border-b xl:border-gray-200 xl:pb-6">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/1.jpg"
                    alt="Profile"
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 rounded-full object-cover ring-4 ring-gray-100"
                  />
                </div>
                <div className="text-left xl:text-center flex-1 xl:flex-none">
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-[#1F2937]">
                    Allen Perkins
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    UI/UX Designer
                  </p>
                </div>
              </div>

              {/* Mobile Toggle Icon (faqat ko‘rsatish uchun) */}
              <DropdownArrow
                className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 transition-transform duration-300 xl:hidden ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Details Section */}
            <div
              className={`mt-4 md:mt-6 transition-all duration-300 ease-in-out ${
                showDetails ? "block opacity-100" : "hidden opacity-0"
              } xl:block xl:opacity-100 space-y-4 md:space-y-5`}
            >
              {/* Sidebar Info */}
              <div className="space-y-3 md:space-y-4">
                {SidebarInfo.map((item) => (
                  <div key={item.label}>
                    <div className="text-sm md:text-base font-medium text-[#4B5563] mb-2">
                      {item.label}
                    </div>
                    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl md:rounded-2xl px-3 md:px-4 h-[44px] md:h-[48px] flex items-center text-[#1F2937] text-sm md:text-base hover:border-gray-300 transition-colors">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Section */}
              <div className="w-full">
                <div className="text-sm md:text-base font-medium text-[#4B5563] mb-2">
                  Photo / File
                </div>
                <CustomUpload
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Controls Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4 lg:gap-6">
              {/* Tab Navigation */}
              <div className="flex bg-[#DBDBDB] rounded-full p-1 w-full sm:w-auto">
                {["Tasks", "Team", "Notes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 md:px-10 py-2 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-200 flex-1 sm:flex-none ${
                      activeTab === tab
                        ? "bg-gray-800 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3 md:gap-4 w-full lg:w-auto">
                <button className="p-3 md:p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl transition-colors">
                  <Filter className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </button>
                <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-200 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors flex-1 lg:flex-none">
                  <span className="text-sm md:text-base font-medium text-gray-700">
                    Current Tasks
                  </span>
                  <DropdownArrow className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-4 md:space-y-6">
              {paginatedTasks.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 lg:p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 md:gap-6">
                    {/* Project Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 flex-1 min-w-0">
                      {/* Project Icon */}
                      <div
                        className={`w-[48px] h-[48px] md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl ${project.iconBg} flex items-center justify-center text-lg md:text-xl lg:text-2xl shadow-lg`}
                      >
                        {project.icon}
                      </div>

                      {/* Project Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-[400] md:text-sm text-[#91929E] mb-1 md:mb-2">
                          {project.number}
                        </div>
                        <h3 className="text-lg text-[18px] md:text-xl lg:text-2xl font-bold text-[#0A1629] mb-2 md:mb-3 line-clamp-2">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm md:text-base text-gray-500 mb-3 md:mb-4">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                          <span>Created {project.createdDate}</span>
                        </div>

                        {/* Priority Badge - Mobile */}
                        <div className="block lg:hidden">
                          <div
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${getPriorityColor(
                              project.priority
                            )}`}
                          >
                            {getPriorityIcon(project.priority)}
                            <span className="text-sm font-medium">
                              {project.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Priority Badge - Desktop */}
                      <div className="hidden lg:block">
                        <div
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {getPriorityIcon(project.priority)}
                          <span className="text-sm font-medium">
                            {project.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className=" w-full lg:w-[360px] xl:w-[400px]">
                      <h4 className="text-sm text-[16px] md:text-base font-bold text-[#0A1629] mb-3 md:mb-4">
                        Project Data
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {/* All Tasks */}
                        <div>
                          <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                            All tasks
                          </div>
                          <div className="text-xl text-[16px] md:text-2xl lg:text-3xl font-bold text-[#0A1629]">
                            {project.allTasks}
                          </div>
                        </div>

                        {/* Active Tasks */}
                        <div>
                          <div className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                            Active tasks
                          </div>
                          <div className="text-xl text-[16px] md:text-2xl lg:text-3xl font-bold text-[#0A1629]">
                            {project.activeTasks}
                          </div>
                        </div>

                        {/* Assignees */}
                        <div className="col-span-2 lg:col-span-1">
                          <div className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                            Assignees
                          </div>
                          <div className="flex -space-x-2">
                            {project.assignees
                              .slice(0, 4)
                              .map((assignee, idx) => (
                                <div
                                  key={assignee.id}
                                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${assignee.color} border-2 md:border-3 border-white flex items-center justify-center text-white text-xs md:text-sm font-medium hover:scale-110 hover:z-10 transition-all cursor-pointer shadow-md`}
                                  title={assignee.name}
                                  style={{
                                    zIndex: project.assignees.length - idx,
                                  }}
                                >
                                  {assignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                              ))}
                            {project.assignees.length > 4 && (
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-400 border-2 md:border-3 border-white flex items-center justify-center text-white text-xs md:text-sm font-medium shadow-md">
                                +{project.assignees.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <CustomPagination
                current={currentPage}
                total={mockTasks.length}
                pageSize={itemsPerPage}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
