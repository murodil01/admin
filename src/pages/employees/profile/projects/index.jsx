import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { getUserProjectsById } from "../../../../api/services/userProjectsService";

const ProjectCard = ({ project }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Create initials or use default icon colors
  const getProjectIcon = (name) => {
    const colors = [
      "bg-yellow-400",
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    const colorIndex = name.length % colors.length;
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div
        className={`w-12 h-12 rounded-lg ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Section - Project Info */}
        <div className="flex items-center gap-4 flex-1">
          {project.image ? (
            <img
              className="w-12 h-12 rounded-lg object-cover"
              src={project.image}
              alt={project.name}
            />
          ) : (
            getProjectIcon(project.name)
          )}

          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
              <CalendarDays size={14} className="sm:w-4 sm:h-4" />
              <span>Created {formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Project Data */}
        <div className="sm:ml-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
            Project Data
          </h4>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 sm:gap-8 justify-center">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                All tasks
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {project.all_tasks || 0}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Active tasks
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {project.active_tasks || 0}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                Dropped
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {project.dropped_count || 0}
              </div>
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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 7;
  const { id: userId } = useParams();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) throw new Error("User ID is required");

        const userData = await getUserProjectsById(userId);

        if (userData && userData.projects) {
          setProjects(userData.projects);
          setTotalCount(userData.projects.length || 0);
        } else {
          setProjects([]);
          setError("Invalid response from server");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch projects");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProjects();
    else {
      setError("No user ID provided");
      setLoading(false);
    }
  }, [userId]);

  // Client-side pagination
  const paginatedProjects = projects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">
              Loading projects...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-base sm:text-lg font-semibold mb-2">
              Error
            </div>
            <div className="text-gray-600 text-sm sm:text-base">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              This user doesn't have any projects yet.
            </p>
          </div>
        ) : (
          <>
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
                <div className="flex items-center gap-3 sm:gap-4 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border border-gray-200 text-xs sm:text-sm">
                  <span className="text-gray-600 font-medium">
                    {`${(page - 1) * itemsPerPage + 1}–${Math.min(
                      page * itemsPerPage,
                      totalCount
                    )} of ${totalCount}`}
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`p-1 sm:p-2 rounded-full transition-all ${page === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className={`p-1 sm:p-2 rounded-full transition-all ${page === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;