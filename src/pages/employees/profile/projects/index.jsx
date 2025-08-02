import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

const projectsData = [
  {
    id: 1,
    title: "Medical App (iOS native)",
    created: "2020-09-12",
    allTasks: 34,
    activeTasks: 13,
    assignees: [
      "https://randomuser.me/api/portraits/men/1.jpg",
      "https://randomuser.me/api/portraits/women/2.jpg",
      "https://randomuser.me/api/portraits/men/3.jpg",
    ],
  },
  {
    id: 2,
    title: "E-commerce Dashboard",
    created: "2021-03-08",
    allTasks: 22,
    activeTasks: 6,
    assignees: [
      "https://randomuser.me/api/portraits/women/4.jpg",
      "https://randomuser.me/api/portraits/men/5.jpg",
    ],
  },
  {
    id: 3,
    title: "AI Chatbot Platform",
    created: "2023-06-20",
    allTasks: 48,
    activeTasks: 20,
    assignees: [
      "https://randomuser.me/api/portraits/men/6.jpg",
      "https://randomuser.me/api/portraits/women/7.jpg",
      "https://randomuser.me/api/portraits/men/8.jpg",
      "https://randomuser.me/api/portraits/men/9.jpg",
    ],
  },
  {
    id: 4,
    title: "Logistics CRM Tool",
    created: "2024-01-15",
    allTasks: 12,
    activeTasks: 4,
    assignees: ["https://randomuser.me/api/portraits/women/10.jpg"],
  },
];

const ProjectCard = ({ project }) => {
  return (
    <div className="shadow bg-white rounded-[24px] p-[24px] flex flex-col md:flex-row items-start md:items-center gap-6 w-full min-h-[150px]">
      {/* Project Info */}
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-4">
          <img
            className="rounded-[14px] w-[48px] h-[48px] object-cover"
            src="https://www.10wallpaper.com/wallpaper/1366x768/1703/Green_tree_alone-2017_High_Quality_Wallpaper_1366x768.jpg"
            // src={project.image}
            alt="Project"
          />
          <h3 className="text-[#0A1629] font-bold text-[18px]">
            Medical App (iOS native)
          </h3>
        </div>
        <div className="text-[#7D8592] text-[14px] font-semibold flex items-center gap-2">
          <CalendarDays size={16} />
          Created {new Date(project.created).toLocaleDateString()}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block mx-6 h-[100px] w-[2px] bg-[#E4E6E8]" />

      {/* Project Data */}
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-[#0A1629] font-bold text-[18px]">Project Data</h3>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">
              All tasks
            </p>
            <p>{project.allTasks}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">
              Active tasks
            </p>
            <p>{project.activeTasks}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">
              Assignees ({project.assignees.length})
            </p>
            <div className="flex items-center -space-x-2">
              {project.assignees.map((src, index) => (
                <img
                  key={index}
                  className="w-[28px] h-[28px] rounded-full border border-white"
                  src={src}
                  alt={`User ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(projectsData.length / itemsPerPage);
  const visibleProjects = projectsData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {visibleProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      {/* Pagination */}
      <div className="flex justify-center md:justify-end mt-4">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full text-sm text-[#7D8592] font-medium shadow-sm">
          <span>
            {`${(page - 1) * itemsPerPage + 1}–${Math.min(
              page * itemsPerPage,
              projectsData.length
            )} of ${projectsData.length}`}
          </span>

          {/* Left Arrow */}
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`transition-all ${
              page === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#0061fe]"
            }`}
          >
            <ArrowLeft />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`transition-all ${
              page === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#0061fe]"
            }`}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;
