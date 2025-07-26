import { DatePicker, Form, Input, Upload } from "antd";
import {
  Funnel,
  Download as DownloadIcon,
  Calendar,
  ChevronUp,
  ChevronDown,
  Filter,
  ChevronDown as DropdownArrow,
} from "lucide-react";
import { useState } from "react";

const mockProjects = [
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

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Projects");

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "Low") return <ChevronDown className="w-4 h-4" />;
    return <ChevronUp className="w-4 h-4" />;
  };

  return (
    <div>
      <h1 className="text-[#0A1629] font-bold text-[36px] text-left">
        Employee's Profile
      </h1>

      <div className="flex flex-wrap gap-4 sm:gap-5 md:gap-6 lg:gap-8 mt-4 justify-center">
        <div className="w-[264px] bg-white shadow-md rounded-[24px] p-4 space-y-6">
          {/* Profile Header */}
          <div className="border-b border-[#E5E5E5] pb-4 text-center">
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
            />
            <h3 className="text-lg font-semibold text-[#1F2937]">
              Allen Perkins
            </h3>
            <p className="text-sm text-gray-500">UI/UX Designer</p>
          </div>

          {/* Main Info */}
          <div>
            <h3 className="text-[#1F2937] text-base font-semibold mb-2">
              Main Info
            </h3>
            <Form layout="vertical">
              {[
                {
                  label: "Department",
                  name: "department",
                  placeholder: "M Technologies",
                },
                { label: "Status", name: "status", placeholder: "Working" },
                {
                  label: "Join Date",
                  name: "joindate",
                  placeholder: "May 01, 2025",
                },
              ].map((field) => (
                <Form.Item
                  key={field.name}
                  label={
                    <span className="text-sm font-medium text-[#4B5563]">
                      {field.label}
                    </span>
                  }
                  name={field.name}
                  rules={[
                    {
                      required: true,
                      message: `Iltimos, ${field.label} kiriting!`,
                    },
                  ]}
                >
                  <Input
                    placeholder={field.placeholder}
                    className="text-[#1F2937] h-[48px] px-4"
                    style={{ borderRadius: "14px" }}
                  />
                </Form.Item>
              ))}
              <Form.Item
                label={
                  <span className="text-sm font-medium text-[#4B5563]">
                    Birthday Date
                  </span>
                }
                name="birthDate"
                rules={[
                  {
                    required: true,
                    message: "Iltimos, tug‘ilgan sanani tanlang!",
                  },
                ]}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  placeholder="May 19, 1996"
                  className="text-[#1F2937] h-[48px] px-4 w-full"
                  style={{ borderRadius: "14px" }}
                />
              </Form.Item>
            </Form>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-[#1F2937] text-base font-semibold mb-2">
              Contact Info
            </h3>
            <Form layout="vertical">
              {[
                {
                  label: "Email",
                  name: "email",
                  placeholder: "evanyates@gmail.com",
                },
                {
                  label: "Mobile Number",
                  name: "mobile",
                  placeholder: "+998 94 123 45-67",
                },
                {
                  label: "Telegram username",
                  name: "username",
                  placeholder: "@boburallayorov",
                },
              ].map((field) => (
                <Form.Item
                  key={field.name}
                  label={
                    <span className="text-sm font-medium text-[#4B5563]">
                      {field.label}
                    </span>
                  }
                  name={field.name}
                  rules={[
                    {
                      required: true,
                      message: `Iltimos, ${field.label} kiriting!`,
                    },
                  ]}
                >
                  <Input
                    placeholder={field.placeholder}
                    className="text-[#1F2937] h-[48px] px-4"
                    style={{ borderRadius: "14px" }}
                  />
                </Form.Item>
              ))}
            </Form>
          </div>

          {/* Passport Detail */}
          <div>
            <h3 className="text-[#1F2937] text-base font-semibold mb-2">
              Passport Detail
            </h3>
            <Form layout="vertical">
              {[
                {
                  label: "Serial Number",
                  name: "serialNumber",
                  placeholder: "AD 1114567",
                },
                {
                  label: "PINFL",
                  name: "pinfl",
                  placeholder: "45245875495734",
                },
              ].map((field) => (
                <Form.Item
                  key={field.name}
                  label={
                    <span className="text-sm font-medium text-[#4B5563]">
                      {field.label}
                    </span>
                  }
                  name={field.name}
                  rules={[
                    {
                      required: true,
                      message: `Iltimos, ${field.label} kiriting!`,
                    },
                  ]}
                >
                  <Input
                    placeholder={field.placeholder}
                    className="text-[#1F2937] h-[48px] px-4"
                    style={{ borderRadius: "14px" }}
                  />
                </Form.Item>
              ))}
              <Form.Item
                label={
                  <span className="text-sm font-medium text-[#4B5563]">
                    Photo / File
                  </span>
                }
                name="file"
                rules={[
                  { required: true, message: "Iltimos, faylni yuklang!" },
                ]}
              >
                <Upload
                  name="file"
                  showUploadList={false}
                  beforeUpload={() => false}
                  className="w-full"
                  style={{ width: "100%" }}
                >
                  <div className="w-full">
                    <button
                      type="button"
                      className="w-full h-[48px] bg-[#1F2937] text-white text-sm font-medium px-6 rounded-[14px] hover:bg-[#111827] transition-all flex items-center justify-center gap-2"
                    >
                      <DownloadIcon size={18} />
                      <span>Upload File</span>
                    </button>
                  </div>
                </Upload>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex-1 w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
            <div className="flex bg-gray-200 rounded-full p-1">
              {["Projects", "Team", "Notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gray-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 bg-white px-4 py-[10px] rounded-[14px] border border-gray-200 hover:border-gray-300 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  Current Projects
                </span>
                <DropdownArrow className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${project.iconBg} flex items-center justify-center text-lg`}
                    >
                      {project.icon}
                    </div>

                    {/* Project Info */}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {project.number}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Created {project.createdDate}</span>
                      </div>
                    </div>

                    {/* Priority */}
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full ${getPriorityColor(
                        project.priority
                      )}`}
                    >
                      {getPriorityIcon(project.priority)}
                      <span className="text-sm font-medium">
                        {project.priority}
                      </span>
                    </div>
                  </div>

                  {/* Right Section - Project Data */}
                  <div className="bg-gray-50 rounded-lg p-4 w-full md:w-[300px]">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Project Data
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          All tasks
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {project.allTasks}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Active tasks
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {project.activeTasks}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-2">
                          Assignees
                        </div>
                        <div className="flex -space-x-2">
                          {project.assignees.map((a, idx) => (
                            <div
                              key={a.id}
                              className={`w-8 h-8 rounded-full ${a.color} border-2 border-white flex items-center justify-center text-white text-xs font-medium hover:scale-110 transition-transform cursor-pointer`}
                              title={a.name}
                              style={{ zIndex: project.assignees.length - idx }}
                            >
                              {a.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
