import { Dropdown } from "antd";
import { BiChevronRight } from "react-icons/bi";
import { useState } from "react";
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

const TaskProjectDropdown = ({ selectedProject, setSelectedProject }) => {
    const [rotated, setRotated] = useState(false);
    const [open, setOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const currentProjects = projects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSelectProject = (project) => {
        setSelectedProject(project.name);
        setOpen(false);
        navigate(`/tasks/${project.id}`);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const content = (
        <div className="ml-[95px] w-[350px] bg-white rounded-2xl shadow-lg p-4 max-h-100 overflow-y-auto">
            <h1 className="text-lg font-semibold text-gray-900 text-center mb-4 border-b pb-5 border-gray-300">
                All Projects
            </h1>

            <div className="space-y-2">
                {currentProjects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => handleSelectProject(project)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-b border-gray-300 ${
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-300">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                        currentPage === 1
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
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded-md transition ${
                        currentPage === totalPages
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
                if (visible) setCurrentPage(1); // Reset pagination on open
            }}
            popupRender={() => content}
            trigger={["click"]}
            placement="bottomRight"
        >
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-8 h-8 rounded-md transition"
            >
                <BiChevronRight
                    className={`text-gray-700 transform transition-transform duration-300 ${
                        rotated ? "rotate-90" : "rotate-0"
                    }`}
                />
            </button>
        </Dropdown>
    );
};

export default TaskProjectDropdown;