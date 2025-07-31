import { Dropdown } from "antd";
import { BiChevronRight } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const projects = [
    { id: "PN0001265", name: "Medical App (iOS native)", status: "active" },
    { id: "PN0001246", name: "Food Delivery Service", status: "inactive" },
    { id: "PN0001245", name: "Fortune website", status: "inactive" },
    { id: "PN0001243", name: "Planner App", status: "inactive" },
    { id: "PN0001241", name: "Time tracker - personal account", status: "inactive" },
    { id: "PN0001240", name: "Internal Project", status: "inactive" },
];

const ITEMS_PER_PAGE = 5;

const TaskProjectDropdown = ({
    selectedProject,
    setSelectedProject,
    isActive,
    isHovered,
    triggerButton,
    onOpenChange
}) => {
    const [rotated, setRotated] = useState(false);
    const [open, setOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const currentProjects = projects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open); // tashqariga bildiradi
    }
  }, [open, onOpenChange]);

    const handleSelectProject = (project) => {
        setSelectedProject(project.name);
        setOpen(false);
        setTimeout(() => {
            navigate(`/tasks/${project.id}`);
        }, 0);
    };

    const content = (
        <div className="w-[300px] bg-white rounded-2xl shadow-xl p-4 max-h-[60vh] overflow-y-auto">
            <h1 className="text-lg font-semibold text-center text-gray-900 mb-4 border-b pb-3 border-gray-200">
                All Projects
            </h1>

            <div className="space-y-2">
                {currentProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => handleSelectProject(project)}
                        className={`p-3 rounded-lg cursor-pointer border border-transparent transition-all duration-200
              ${selectedProject === project.name
                                ? "bg-gray-900 text-white"
                                : "hover:bg-gray-100 text-gray-800"
                            }`}
                    >
                        <div className="text-xs text-gray-400">{project.id}</div>
                        <div className="text-sm font-medium truncate">{project.name}</div>
                        {selectedProject === project.name && (
                            <div className="mt-1 text-xs text-gray-300 flex items-center hover:text-white">
                                View details <span className="ml-1">›</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded-md transition
            ${currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:underline"
                        }`}
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded-md transition
            ${currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:underline"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );

    return (
        <Dropdown
            open={open}
            onOpenChange={(visible) => {
                setOpen(visible);
                setRotated(visible);
            }}
            popupRender={() => content}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="z-[9999]"
            overlayStyle={{ minWidth: "auto" }}
            getPopupContainer={(trigger) => trigger.parentNode}
        >
            {triggerButton ? (
                <div onClick={() => setOpen(!open)}>{triggerButton}</div>
            ) : (
                <button
                    aria-label="Open project dropdown"
                    onClick={() => setOpen(!open)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md transition
            ${isActive ? "bg-[#0061fe] text-white" : "text-[#231f20] hover:bg-[#0061fe] hover:text-white"}
          `}
                >
                </button>
            )}
        </Dropdown>
    );
};

export default TaskProjectDropdown;