import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ArrowRight, ArrowLeft } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EmployeeStatusModal from "./EmployeeStatusModal";

const EmployeeList = ({ employees, onDelete, onStatusUpdate }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [dropdownPosition, setDropdownPosition] = useState({});

    const toggleDropdown = (id, e) => {
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

    return (
        <div className="bg-gray-50 rounded-2xl shadow p-4">
            <div className="overflow-x-auto">
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
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmployeeRow = ({ emp, openDropdown, dropdownPosition, dropdownRef, toggleDropdown, onDelete, navigate, onStatusUpdate }) => {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-4 grid grid-cols-1 gap-4 lg:grid-cols-17 lg:items-center">
            {/* Employee info */}
            <div className="flex items-center gap-3 col-span-5">
                <img
                    src={emp.profile_picture}
                    alt={emp.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <p className="text-[#1F2937] font-semibold truncate max-w-[180px]">
                        {emp.first_name} {emp.last_name}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm font-medium truncate">{emp.role}</span>
                        <span className={`px-3 py-[3px] rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100`}>
                            {emp.level}
                        </span>
                    </div>
                </div>
            </div>

            {/* Department */}
            <div className="lg:col-span-3 text-center">
                <span className="lg:hidden font-medium text-gray-600">Department: </span>
                {emp.department}
            </div>

            {/* Phone */}
            <div className="lg:col-span-4 text-center text-gray-600">
                {emp.phone_number}
            </div>

            {/* Projects */}
            <div className="lg:col-span-2 text-center text-gray-600">
                {emp.project_count}
            </div>

            {/* Status */}
            <div className="lg:col-span-2 flex justify-center">
                <StatusBadge status={emp.status} />
            </div>

            {/* Actions */}
            <div className="text-right relative dropdown-container inline-block">
                <button
                    className="cursor-pointer"
                    onClick={(event) => toggleDropdown(emp.id, event)}
                    ref={openDropdown === emp.id ? dropdownRef : null}
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
                    />
                )}
            </div>

            <EmployeeStatusModal
                employeeId={emp.id}
                currentStatus={emp.status}
                visible={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onSuccess={onStatusUpdate}
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
        {["founder", "manager"].includes(emp.role) ? (
            <>
                <button
                    onClick={() => setIsStatusModalOpen(true)}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setTimeout(() => setOpenDropdown(null), 0);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-green-500 cursor-pointer"
                >
                    Edit status
                </button>
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
                <button
                    onClick={() => onDelete(emp.id)}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-red-500 cursor-pointer">
                    Delete
                </button>
            </>
        ) : (
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
        )}
    </div>
);

export default EmployeeList;