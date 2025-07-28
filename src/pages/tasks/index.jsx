import { BiLink } from "react-icons/bi"; 
import { AiOutlinePaperClip } from "react-icons/ai";
import { useState } from "react";
import { Button, Modal, Select, DatePicker } from 'antd';

const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  // const handleOk = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    // Here you can collect form data, validate, and send it
    console.log("Saving project...");
    setIsModalOpen(false); // Close modal after saving
  };

  // function parseTimeToHours(timeStr) {
  //   if (!timeStr) return 0;

  //   const dayMatch = timeStr.match(/(\d+)\s*d/);
  //   const hourMatch = timeStr.match(/(\d+)\s*h/);

  //   const days = dayMatch ? parseInt(dayMatch[1]) : 0;
  //   const hours = hourMatch ? parseInt(hourMatch[1]) : 0;

  //   return days * 24 + hours;
  // }

  const [selectedProject, setSelectedProject] = useState(
    "Medical App (iOS native)"
  );
  // const [currentProjectsOpen, setCurrentProjectsOpen] = useState(false);

  const projects = [
    { id: "PN0001265", name: "Medical App (iOS native)", status: "active" },
    { id: "PN0001246", name: "Food Delivery Service", status: "inactive" },
    { id: "PN0001245", name: "Fortune website", status: "inactive" },
    { id: "PN0001243", name: "Planner App", status: "inactive" },
    {
      id: "PN0001241",
      name: "Time tracker - personal account",
      status: "inactive",
    },
    { id: "PN0001240", name: "Internal Project", status: "inactive" },
  ];

  // const taskColumns = [
  //   { id: "todo", title: "To Do", color: "bg-gray-200" },
  //   { id: "progress", title: "In Progress", color: "bg-blue-100" },
  //   { id: "review", title: "In Review", color: "bg-yellow-100" },
  //   { id: "done", title: "Done", color: "bg-green-100" },
  // ];

  // const activeTasks = [
  //   {
  //     id: "TS0001245",
  //     title: "UX sketches",
  //     time: "4d",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "todo",
  //   },
  //   {
  //     id: "TS0001245",
  //     title: "Mind Map",
  //     time: "2d 4h",
  //     assignee: { name: "Mike", avatar: "bg-gray-800" },
  //     column: "progress",
  //   },
  //   {
  //     id: "research-reports",
  //     title: "Research reports",
  //     time: "2d",
  //     assignee: { name: "Sarah", avatar: "bg-yellow-600" },
  //     column: "review",
  //   },
  //   {
  //     id: "research",
  //     title: "Research",
  //     time: "4d",
  //     assignee: { name: "Emma", avatar: "bg-red-500" },
  //     column: "done",
  //   },
  //   {
  //     id: "ux-login",
  //     title: "UX Login + Registration",
  //     time: "2d",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "todo",
  //   },
  //   {
  //     id: "presentation",
  //     title: "Research reports (presentation for client)",
  //     time: "6h",
  //     assignee: { name: "Lisa", avatar: "bg-pink-500" },
  //     column: "review",
  //   },
  //   {
  //     id: "ui-login",
  //     title: "UI Login + Registration (+ other screens)",
  //     time: "1d 6h",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "todo",
  //   },
  // ];

  // const backlogTasks = [
  //   {
  //     id: "animation-buttons",
  //     title: "Animation for buttons",
  //     time: "8h",
  //     priority: "low",
  //     assignee: { name: "Alex", avatar: "bg-blue-500" },
  //   },
  //   {
  //     id: "preloader",
  //     title: "Preloader",
  //     time: "6h",
  //     priority: "low",
  //     assignee: { name: "Mike", avatar: "bg-gray-800" },
  //   },
  //   {
  //     id: "animation-landing",
  //     title: "Animation for Landing page",
  //     time: "8h",
  //     priority: "low",
  //     assignee: { name: "Sarah", avatar: "bg-yellow-600" },
  //   },
  // ];

  // const getTasksByColumn = (columnId) => {
  //   return activeTasks.filter((task) => task.column === columnId);
  // };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-[28px]">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold text-center sm:text-left">
          Tasks
        </h3>
        <button
          onClick={showModal}
          className="capitalize w-full sm:max-w-[182px] py-[13px] px-[22px] bg-[#1F2937] rounded-2xl text-white gap-[10px] flex items-center justify-center cursor-pointer shadow shadow-blue-300"
        >
          <span className="flex items-center text-xl">+</span>
          <span className="">Add Project</span>
        </button>

        <Modal
          title={<h2 className="px-10 text-2xl font-semibold text-[#1F2937]">Add Project</h2>}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
          width={1000}
          bodyStyle={{ padding: 0 }}
          wrapClassName="custom-modal-wrapper"
        >
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">

              {/* LEFT SIDE - FORM */}
              <div className="xl:col-span-[3] space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="Project Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Starts</label>
                    <DatePicker className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Deadline</label>
                    <DatePicker className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Priority</label>
                  <Select
                    defaultValue="Medium"
                    options={[
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                    ]}
                    className="w-full"
                    popupClassName="rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Brief summary of the project..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* RIGHT SIDE - IMAGE SELECTOR */}
              <div className="border border-gray-200 rounded-2xl p-6 col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Select image</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Select or upload an avatar for the project (available formats: jpg, png)
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {[...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-lg border border-gray-300 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition cursor-pointer"
                    >
                      <img
                        src={`/img/avatar-${i + 1}.png`}
                        alt={`avatar-${i + 1}`}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  ))}
                </div>
                {/* Upload */}
                  <div className="mt-5 flex gap-3">
                    {/* Upload from Computer */}
                    <label className="flex items-center gap-2 p-[10px] bg-[#e3ebf8] text-white text-sm font-medium rounded-lg hover:opacity-80 transition cursor-pointer">
                      <AiOutlinePaperClip color="#6D5DD3" size={24} />
                      <input
                        type="file"
                        accept=".jpg, .jpeg, .png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const imageUrl = URL.createObjectURL(file);
                            console.log('Uploaded file image URL:', imageUrl);
                            // Use the URL in your app state
                          }
                        }}
                      />
                    </label>

                    {/* Upload from Link */}
                    <button
                      type="button"
                      className="flex items-center gap-2 p-[10px] bg-[#e3ebf8] text-gray-800 text-sm font-medium rounded-lg hover:opacity-80 transition cursor-pointer"
                      onClick={() => {
                        const url = prompt("Enter image URL:");
                        if (url) {
                          console.log('Image URL entered:', url);
                          // Use the URL in your app state
                        }
                      }}
                    >
                      <BiLink color="#15C0E6" size={24} />
                    </button>
                  </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end pt-10">
              <Button
                type="primary"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg"
              >
                Save Project
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 min-h-screen">
        {/* Sidebar */}
        <div className="w-full sm:w-64 bg-white flex flex-col rounded-[24px]">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 text-center">
              All Projects
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.name)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedProject === project.name
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">{project.id}</div>
                  <div className="text-sm font-medium">{project.name}</div>
                  {selectedProject === project.name && (
                    <div className="mt-2 text-xs text-gray-300 flex items-center cursor-pointer hover:text-white">
                      View details <span className="ml-1">›</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
