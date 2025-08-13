import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { getUserProjects } from "../../../../api/services/userProjectsService"; // backend API

// ✅ ProjectCard endi prop qabul qiladi
const ProjectCard = ({ project }) => {
  return (
    <div className="shadow bg-white rounded-[24px] p-[24px] flex flex-col md:flex-row items-start md:items-center gap-6 w-full min-h-[150px]">
      {/* Project Info */}
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-4">
          <img
            className="rounded-[14px] w-[48px] h-[48px] object-cover"
            src={project.image || "https://www.10wallpaper.com/wallpaper/1366x768/1703/Green_tree_alone-2017_High_Quality_Wallpaper_1366x768.jpg"}
            alt={project.title}
          />
          <h3 className="text-[#0A1629] font-bold text-[18px]">{project.title}</h3>
        </div>
        <div className="text-[#7D8592] text-[14px] font-semibold flex items-center gap-2">
          <CalendarDays size={16} />
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block mx-6 h-[100px] w-[2px] bg-[#E4E6E8]" />

      {/* Project Data */}
      <div className="flex flex-col gap-3 flex-1">
        <h3 className="text-[#0A1629] font-bold text-[18px]">Project Data</h3>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">All tasks</p>
            <p className="text-center">{project.allTasks || 0}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">Active tasks</p>
            <p className="text-center">{project.activeTasks || 0}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#7D8592] text-[14px] font-semibold">
              Assignees ({project.assignees?.length || 0})
            </p>
            <div className="flex items-center -space-x-2">
              {project.assignees?.map((src, index) => (
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
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getUserProjects();

        // data array bo‘lgani uchun to‘g‘ridan-to‘g‘ri flatMap ishlatamiz
        const formatted = data.flatMap(user =>
          (user.projects || []).map(p => ({
            id: p.id,
            title: p.name,
            image: p.image,
            createdAt: p.created_at,
            allTasks: p.all_tasks,
            activeTasks: p.active_tasks,
            assignees: (p.assigned || []).map(a => a.image)
          }))
        );

        setProjects(formatted);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const visibleProjects = projects.slice(
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
              projects.length
            )} of ${projects.length}`}
          </span>

          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`transition-all ${
              page === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#0061fe]"
            }`}
          >
            <ArrowLeft />
          </button>

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