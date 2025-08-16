import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import EmployeeStatusModal from "./EmployeeStatusModal";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const EmployeeList = ({ employees, onDelete, onStatusUpdate }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [dropdownPosition, setDropdownPosition] = useState({});

    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <div>Please login</div>;

    const toggleDropdown = (id, e) => {
        e.stopPropagation(); // Prevent event bubbling

        if (openDropdown === id) {
            setOpenDropdown(null);
            return;
        }

        const buttonRect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        const position = spaceBelow < 300 && spaceAbove > spaceBelow ? "top" : "bottom";
        setDropdownPosition((prev) => ({ ...prev, [id]: position }));
        setOpenDropdown(id);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleDocClick = (event) => {
            const isMoreVerticalButton = event.target.closest('.more-vertical-button');
            const isDropdownMenu = event.target.closest('.dropdown-menu');
            if (!isMoreVerticalButton && !isDropdownMenu) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('click', handleDocClick);
        return () => document.removeEventListener('click', handleDocClick);
    }, []);

    return (
        <div className="bg-gray-50 rounded-2xl shadow">
            <div className="overflow-x-auto p-1">
                <div className="w-full">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-17 text-gray-500 text-md font-bold py-3 px-4 border-b border-b-gray-200 mb-7 pb-5">
                        <div className="col-span-5">Employees</div>
                        <div className="col-span-3 text-center">Department</div>
                        <div className="col-span-4 text-center">Phone number</div>
                        <div className="col-span-2 text-center">Projects</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div></div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-3 mt-2">
                        {employees.map((emp) => (
                            <EmployeeRow
                                key={emp.id}
                                emp={emp}
                                openDropdown={openDropdown}
                                dropdownPosition={dropdownPosition}
                                dropdownRef={dropdownRef}
                                toggleDropdown={toggleDropdown}
                                onDelete={onDelete}
                                navigate={navigate}
                                onStatusUpdate={onStatusUpdate}
                                setOpenDropdown={setOpenDropdown}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmployeeRow = ({ emp, openDropdown, dropdownPosition, toggleDropdown, onDelete, navigate, onStatusUpdate, setOpenDropdown }) => {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false); // Yangi state

    const handleEditStatus = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMobileModalOpen(false); // Mobil modalni yopamiz
        setTimeout(() => {
            setIsStatusModalOpen(true); // Keyin status modalni ochamiz
        }, 100);
        setOpenDropdown(null);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-4 grid grid-cols-1 gap-3 lg:grid-cols-17 lg:items-center">
            {/* Mobile View - Top Section */}
            <div className="flex justify-between items-center lg:hidden">
                <div className="flex items-center gap-3">
                    <img
                        src={emp.profile_picture}
                        alt={emp.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-[#1F2937] font-semibold">
                            {emp.first_name} {emp.last_name}
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">{emp.profession}</span>
                            {emp.level && emp.level !== "none" && (
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100`}>
                                    {emp.level}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    className="cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileModalOpen(true); // Modalni ochish
                    }}
                >
                    <AiOutlineRight size={18} className="text-blue-500" />
                </button>
            </div>

            {isMobileModalOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                        onClick={() => setIsMobileModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="fixed top-40 left-0 right-0 z-50 lg:hidden pl-3 pr-5">
                        <div
                            className="bg-white rounded-2xl shadow-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-4 pb-0">
                                <h3 className="text-lg font-semibold">Details</h3>
                                <button
                                    onClick={() => setIsMobileModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2 -mr-2"
                                >
                                    <AiOutlineClose size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={emp.profile_picture}
                                            alt={emp.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-lg font-semibold">
                                                {emp.first_name} {emp.last_name}
                                            </p>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                {emp.profession}
                                                {emp.level && emp.level !== "none" && (
                                                    <span className={`px-3 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100`}>
                                                        {emp.level}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDropdown(emp.id, e);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 p-2 more-vertical-button"
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {openDropdown === emp.id && (
                                            <div
                                                className="absolute right-0 mt-2 z-50 w-40 bg-white rounded-lg shadow-lg border border-gray-200 dropdown-menu"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={handleEditStatus}
                                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    Edit status
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(emp.id); // <- onDelete(emp.id) deb to'g'rilang
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact and Status Info */}
                                <div className="grid grid-cols-2 border-t border-t-gray-300 pt-5 px-4">
                                    <div className="flex flex-col items-start gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                                            <p className="text-sm font-medium">
                                                {emp.phone_number || <span className="text-gray-400">-</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Projects</p>
                                            <p className="text-sm font-medium">
                                                {emp.project_count || <span className="text-gray-400">0</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Department</p>
                                            <p className="text-sm font-medium">
                                                {emp.department || <span className="text-gray-400">-</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Status</p>
                                            <div className="text-sm font-medium">
                                                {emp.status ? (
                                                    <StatusBadge status={emp.status} mobile />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="py-5 flex justify-center">
                                <button
                                    onClick={() => {
                                        navigate(`/profile/${emp.id}`);
                                        setIsMobileModalOpen(false);
                                    }}
                                    className="py-1.5 px-10 bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-md shadow-blue-300 transition duration-200"
                                >
                                    More
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Desktop View - Remains Unchanged */}
            <div className="hidden lg:flex items-center gap-3 col-span-5">
                <img
                    src={emp.profile_picture}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="min-w-0"> {/* truncate ishlashi uchun */}
                    <p className="text-[#1F2937] font-semibold truncate max-w-[180px] overflow-hidden">
                        {emp.first_name} {emp.last_name}
                    </p>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-500 text-sm font-medium truncate overflow-hidden max-w-[120px]">
                            {emp.profession}
                        </span>
                        {emp.level && emp.level !== "none" && (
                            <span className="px-3 py-[3px] rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100 truncate overflow-hidden max-w-[80px]">
                                {emp.level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block lg:col-span-3 text-center">
                {emp.department}
            </div>

            <div className="hidden lg:block lg:col-span-4 text-center text-gray-600">
                {emp.phone_number}
            </div>

            <div className="hidden lg:block lg:col-span-2 text-center text-gray-600">
                {emp.project_count}
            </div>

            <div className="hidden lg:flex lg:col-span-2 justify-center">
                <StatusBadge status={emp.status} />
            </div>

            <div className="hidden lg:block text-right relative dropdown-container">
                <button
                    className="cursor-pointer more-vertical-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(emp.id, e);
                    }}
                >
                    <MoreVertical size={20} className="text-[#1F2937]" />
                </button>

                {openDropdown === emp.id && (
                    <EmployeeDropdownMenu
                        emp={emp}
                        dropdownPosition={dropdownPosition}
                        setIsStatusModalOpen={setIsStatusModalOpen}
                        onDelete={onDelete}
                        navigate={navigate}
                        setOpenDropdown={setOpenDropdown}
                    />
                )}
            </div>

            <EmployeeStatusModal
                employeeId={emp.id}
                currentStatus={emp.status}
                visible={isStatusModalOpen}
                onClose={() => {
                    setIsStatusModalOpen(false);
                }}
                onSuccess={(newStatus) => {
                    onStatusUpdate(emp.id, newStatus);
                    setIsStatusModalOpen(false);
                }}
            />
        </div>
    );
};

const StatusBadge = ({ status }) => (
    <span className={`flex px-2 w-[84px] py-[6px] rounded-lg text-xs font-medium capitalize items-center gap-1 justify-center
    ${status === "free" ? "text-green-600 bg-green-100" :
            status === "overload" ? "text-red-600 bg-red-100" :
                status === "working" ? "text-blue-600 bg-blue-100" :
                    status === "sick" ? "text-yellow-600 bg-yellow-100" :
                        "text-gray-600 bg-gray-200"
        }`}
    >
        <div className={`w-[5px] h-[5px] rounded-full
      ${status === "free" ? "bg-green-500" :
                status === "overload" ? "bg-red-500" :
                    status === "working" ? "bg-blue-500" :
                        status === "sick" ? "bg-yellow-500" :
                            "bg-gray-400"
            }`}
        ></div>
        <span className="ml-2 capitalize">{status}</span>
    </span>
);

const EmployeeDropdownMenu = ({ emp, dropdownPosition, setIsStatusModalOpen, onDelete, navigate, setOpenDropdown }) => (
    <div
        className={`absolute z-10 w-40 bg-white rounded-lg shadow border border-gray-300 dropdown-menu
            ${dropdownPosition[emp.id] === "top" ? "bottom-full mb-2" : "mt-2"}`}
        style={{ right: 0 }}
        onClick={(e) => e.stopPropagation()}
    >
        <>
            <div className="py-1">
                {/* Always visible button */}
                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${emp.id}`);
                        setTimeout(() => setOpenDropdown(null), 0);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-yellow-500 cursor-pointer"
                >
                    Details
                </button>

                {/* Founder/Manager only buttons */}
                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStatusModalOpen(true);
                                setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-green-500 cursor-pointer"
                        >
                            Edit status
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(emp.id);
                                setOpenDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-red-500 cursor-pointer"
                        >
                            Delete
                        </button>
                    </>
                </Permission>
            </div>
        </>
    </div>
);

export default EmployeeList;