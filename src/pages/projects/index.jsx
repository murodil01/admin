import { useState } from "react";
import {
  Filter,
  ChevronDown,
  ArrowDown,
} from "lucide-react";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(
    "Medical App (iOS native)"
  );
  const [currentProjectsOpen, setCurrentProjectsOpen] = useState(false);

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

  const taskColumns = [
    { id: "todo", title: "To Do", color: "bg-gray-200" },
    { id: "progress", title: "In Progress", color: "bg-blue-100" },
    { id: "review", title: "In Review", color: "bg-yellow-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ];

  const activeTasks = [
    {
      id: "TS0001245",
      title: "UX sketches",
      time: "4d",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
    {
      id: "TS0001245",
      title: "Mind Map",
      time: "2d 4h",
      assignee: { name: "Mike", avatar: "bg-gray-800" },
      column: "progress",
    },
    {
      id: "research-reports",
      title: "Research reports",
      time: "2d",
      assignee: { name: "Sarah", avatar: "bg-yellow-600" },
      column: "review",
    },
    {
      id: "research",
      title: "Research",
      time: "4d",
      assignee: { name: "Emma", avatar: "bg-red-500" },
      column: "done",
    },
    {
      id: "ux-login",
      title: "UX Login + Registration",
      time: "2d",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
    {
      id: "presentation",
      title: "Research reports (presentation for client)",
      time: "6h",
      assignee: { name: "Lisa", avatar: "bg-pink-500" },
      column: "review",
    },
    {
      id: "ui-login",
      title: "UI Login + Registration (+ other screens)",
      time: "1d 6h",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
  ];

  const backlogTasks = [
    {
      id: "animation-buttons",
      title: "Animation for buttons",
      time: "8h",
      priority: "low",
      assignee: { name: "Alex", avatar: "bg-blue-500" },
    },
    {
      id: "preloader",
      title: "Preloader",
      time: "6h",
      priority: "low",
      assignee: { name: "Mike", avatar: "bg-gray-800" },
    },
    {
      id: "animation-landing",
      title: "Animation for Landing page",
      time: "8h",
      priority: "low",
      assignee: { name: "Sarah", avatar: "bg-yellow-600" },
    },
  ];

  const getTasksByColumn = (columnId) => {
    return activeTasks.filter((task) => task.column === columnId);
  };

  return (
    <div>
      <h3 className="text-[#0A1629] text-[36px] font-bold mb-[28px]">Projects</h3>
      <div className="flex flex-col sm:flex-row gap-5 min-h-screen">
        {/* Sidebar */}
        <div className="w-full sm:w-64 bg-white flex flex-col rounded-[24px]">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              Projects
            </h1>
            <div className="relative">
              <button
                onClick={() => setCurrentProjectsOpen(!currentProjectsOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  Current Projects
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    currentProjectsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>           
              </div>
            </div>
          </div>

          {/* Task Board */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {taskColumns.map((column) => (
                <div
                  key={column.id}
                  className={`${column.color} rounded-[24px] p-4 text-center`}
                >
                  <h3 className="font-medium text-gray-800">{column.title}</h3>
                </div>
              ))}
            </div>

            {/* Active Tasks */}
            <div className="mb-8">
              <button className="text-sm font-semibold text-gray-900 mb-4 w-full bg-[#E7E7E7] py-[9px] rounded-4xl">
                Active Tasks
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {taskColumns.map((column) => (
                  <div key={column.id} className="space-y-3">
                    {getTasksByColumn(column.id).map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          {task.id}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-3">
                          {task.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {task.time}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full ${task.assignee.avatar} flex items-center justify-center text-white text-xs font-medium`}
                          >
                            {task.assignee.name[0]}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Backlog */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Backlog
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {backlogTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="text-xs text-gray-500 mb-2">{task.id}</div>
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      {task.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {task.time}
                        </span>
                        <ArrowDown className="w-3 h-3 text-green-500" />
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full ${task.assignee.avatar} flex items-center justify-center text-white text-xs font-medium`}
                      >
                        {task.assignee.name[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
