import { AiOutlineClose, AiOutlineRight } from "react-icons/ai";
import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import EmployeeStatusModal from "./EmployeeStatusModal";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import { Image, Pagination, Skeleton } from 'antd';
// Constants
const DROPDOWN_HEIGHT = 120;

// Utility functions
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned.replace(/\+/g, '');
    }
    return cleaned;
};

const calculateDropdownPosition = (buttonRect, tableRect, dropdownHeight = DROPDOWN_HEIGHT) => {
    const spaceBelow = tableRect.bottom - buttonRect.bottom;
    const spaceAbove = buttonRect.top - tableRect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        return spaceAbove >= dropdownHeight ? "top" : "bottom";
    }
    return "bottom";
};

// Skeleton Loading Components
const EmployeeRowSkeleton = memo(({ isMobile = false }) => {
    if (isMobile) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow p-4 lg:hidden">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                        <Skeleton.Avatar size={48} />
                        <div className="flex-1">
                            <Skeleton.Input active size="small" style={{ width: 120, height: 16, marginBottom: 6 }} />
                            <div className="flex items-center gap-2">
                                <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
                                <Skeleton.Button active size="small" style={{ width: 60, height: 20 }} />
                            </div>
                        </div>
                    </div>
                    <div className="w-[18px] h-[18px] bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-4 hidden lg:grid grid-cols-17 items-center gap-3">
            {/* Member Info */}
            <div className="col-span-5 flex items-center gap-3">
                <Skeleton.Avatar size={50} />
                <div className="min-w-0 flex-1">
                    <Skeleton.Input active size="small" style={{ width: 140, height: 16, marginBottom: 4 }} />
                    <div className="flex items-center gap-2">
                        <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
                        <Skeleton.Button active size="small" style={{ width: 50, height: 18 }} />
                    </div>
                </div>
            </div>
            
            {/* Department */}
            <div className="col-span-3 text-center">
                <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
            </div>
            
            {/* Phone */}
            <div className="col-span-4 text-center">
                <Skeleton.Input active size="small" style={{ width: 100, height: 14 }} />
            </div>
            
            {/* Projects */}
            <div className="col-span-2 text-center">
                <Skeleton.Input active size="small" style={{ width: 20, height: 14 }} />
            </div>
            
            {/* Status */}
            <div className="col-span-2 flex justify-center">
                <Skeleton.Button active size="small" style={{ width: 90, height: 24 }} />
            </div>
            
            {/* Actions */}
            <div className="text-right">
                <div className="w-[20px] h-[20px] bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
        </div>
    );
});
EmployeeRowSkeleton.displayName = 'EmployeeRowSkeleton';

const EmployeeListSkeleton = memo(({ count = 6 }) => {
    return (
        <div className="bg-gray-50 rounded-2xl shadow">
            <div className="overflow-x-auto p-3">
                <div className="w-full">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-17 text-gray-500 text-md font-bold py-3 px-4 border-b border-b-gray-200 mb-7 pb-5">
                        <div className="col-span-5">Members</div>
                        <div className="col-span-3 text-center">Department</div>
                        <div className="col-span-4 text-center">Phone number</div>
                        <div className="col-span-2 text-center">Projects</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div></div>
                    </div>

                    {/* Skeleton Rows */}
                    <div className="space-y-3 mt-2" role="list" aria-label="Loading employees">
                        {/* Mobile skeletons */}
                        <div className="lg:hidden space-y-3">
                            {Array.from({ length: count }).map((_, index) => (
                                <EmployeeRowSkeleton key={`mobile-skeleton-${index}`} isMobile />
                            ))}
                        </div>
                        
                        {/* Desktop skeletons */}
                        <div className="hidden lg:block space-y-3">
                            {Array.from({ length: count }).map((_, index) => (
                                <EmployeeRowSkeleton key={`desktop-skeleton-${index}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading indicator */}
            <div className="flex justify-center items-center py-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-600 text-sm"></span>
                </div>
            </div>
        </div>
    );
});
EmployeeListSkeleton.displayName = 'EmployeeListSkeleton';

// Enhanced StatusBadge component with loading state
const StatusBadge = memo(({ status, loading = false }) => {
    if (loading) {
        return <Skeleton.Button active size="small" style={{ width: 90, height: 24 }} />;
    }

    const statusConfig = useMemo(() => {
        const configs = {
            free: { color: "text-green-600 bg-green-100", dot: "bg-green-500" },
            overload: { color: "text-red-600 bg-red-100", dot: "bg-red-500" },
            working: { color: "text-blue-600 bg-blue-100", dot: "bg-blue-500" },
            sick: { color: "text-yellow-600 bg-yellow-100", dot: "bg-yellow-500" },
            on_leave: { color: "text-gray-600 bg-gray-200", dot: "bg-gray-500" },
            default: { color: "text-gray-600 bg-gray-200", dot: "bg-gray-400" }
        };
        return configs[status] || configs.default;
    }, [status]);

    const formattedStatus = useMemo(() => 
        status?.toLowerCase() === "on_leave" ? "On Leave" : status,
        [status]
    );

    return (
        <span 
            className={`flex px-2 w-[90px] py-[6px] rounded-lg text-xs font-medium capitalize items-center gap-1 justify-center ${statusConfig.color}`}
            role="status"
            aria-label={`Employee status: ${formattedStatus}`}
        >
            <div className={`w-[5px] h-[5px] rounded-full ${statusConfig.dot}`}></div>
            <span className="ml-2">{formattedStatus}</span>
        </span>
    );
});
StatusBadge.displayName = 'StatusBadge';

// Memoized EmployeeDropdownMenu component
const EmployeeDropdownMenu = memo(({
    emp,
    dropdownPosition,
    setIsStatusModalOpen,
    onDelete,
    setOpenDropdown,
    handleNavigateToProfile
}) => {
    const position = useMemo(() => {
        const pos = dropdownPosition[emp.id] || "bottom";
        return pos === "top" 
            ? { bottom: '100%', marginBottom: '8px' } 
            : { top: '100%', marginTop: '8px' };
    }, [dropdownPosition, emp.id]);

    const handleEditStatus = useCallback((e) => {
        e.stopPropagation();
        setIsStatusModalOpen(true);
        setOpenDropdown(null);
    }, [setIsStatusModalOpen, setOpenDropdown]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(emp.id);
        setOpenDropdown(null);
    }, [onDelete, emp.id, setOpenDropdown]);

    const handleDetails = useCallback((e) => {
        e.stopPropagation();
        handleNavigateToProfile(emp.id);
        setOpenDropdown(null);
    }, [handleNavigateToProfile, emp.id, setOpenDropdown]);

    return (
        <div
            className={`fixed z-[9999] w-40 bg-white rounded-lg shadow border border-gray-300 dropdown-menu ${
                dropdownPosition[emp.id] === "top" ? "bottom-full mb-" : "mt-2"
            }`}
            style={{ right: 0, ...position }}
            onClick={(e) => e.stopPropagation()}
            role="menu"
        >
            <div className="py-1">
                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS, ROLES.DEP_MANAGER]}>
                    <button
                        onClick={handleEditStatus}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-green-500 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
                        role="menuitem"
                        aria-label={`Edit status for ${emp.first_name} ${emp.last_name}`}
                    >
                        Edit status
                    </button>
                </Permission>

                <button
                    type="button"
                    onClick={handleDetails}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-yellow-500 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:bg-blue-50"
                    role="menuitem"
                    aria-label={`View details for ${emp.first_name} ${emp.last_name}`}
                >
                    Details
                </button>

                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                    <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-red-500 cursor-pointer focus:ring-2 focus:ring-red-500 focus:bg-red-50"
                        role="menuitem"
                        aria-label={`Delete ${emp.first_name} ${emp.last_name}`}
                    >
                        Delete
                    </button>
                </Permission>
            </div>
        </div>
    );
});
EmployeeDropdownMenu.displayName = 'EmployeeDropdownMenu';

// Enhanced MobileModal component
const MobileModal = memo(({
    emp,
    isOpen,
    onClose,
    openDropdown,
    toggleDropdown,
    handleEditStatus,
    onDelete,
    handleNavigateToProfile
}) => {
    const formattedPhone = useMemo(() => formatPhoneNumber(emp.phone_number), [emp.phone_number]);

    const handleModalNavigate = useCallback(() => {
        handleNavigateToProfile(emp.id);
        onClose();
    }, [handleNavigateToProfile, emp.id, onClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal */}
            <div 
                className="fixed top-40 left-0 right-0 z-50 lg:hidden pl-3 pr-5"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div
                    className="bg-white rounded-2xl shadow-lg w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-4 pb-0">
                        <h3 id="modal-title" className="text-lg font-semibold">
                            Employee Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-2 -mr-2 rounded focus:ring-2 focus:ring-blue-500"
                            aria-label="Close modal"
                        >
                            <AiOutlineClose size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <Image.PreviewGroup
                                    items={emp.profile_picture ? [emp.profile_picture] : []}
                                >
                                    <Image
                                        width={50}
                                        height={50}
                                        className="rounded-full object-cover"
                                        src={emp.profile_picture}
                                        alt={`${emp.first_name} ${emp.last_name} profile picture`}
                                        loading="lazy"
                                    />
                                </Image.PreviewGroup>
                                <div>
                                    <p className="text-lg font-semibold">
                                        <span className="capitalize">{emp.first_name}</span> <span className="capitalize">{emp.last_name}</span>
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        {emp.profession}
                                        {emp.level && emp.level !== "none" && (
                                            <span className="px-3 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100 capitalize">
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
                                    className="text-gray-500 hover:text-gray-700 p-2 more-vertical-button rounded focus:ring-2 focus:ring-blue-500"
                                    aria-label="More options"
                                    aria-haspopup="true"
                                    aria-expanded={openDropdown === emp.id}
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {openDropdown === emp.id && (
                                    <div
                                        className="absolute right-0 mt-2 z-50 w-40 bg-white rounded-lg shadow-lg border border-gray-200 dropdown-menu"
                                        onClick={(e) => e.stopPropagation()}
                                        role="menu"
                                    >
                                        <button
                                            onClick={handleEditStatus}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
                                            role="menuitem"
                                        >
                                            Edit status
                                        </button>
                                        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(emp.id);
                                                }}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-red-500"
                                                role="menuitem"
                                            >
                                                Delete
                                            </button>
                                        </Permission>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact and Status Info */}
                        <div className="grid grid-cols-2 border-t border-t-gray-300 pt-5 px-4">
                            <div className="flex flex-col items-start gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                                    {emp.phone_number ? (
                                        <a
                                            href={`tel:${formattedPhone}`}
                                            className="text-sm font-medium text-black hover:underline focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {emp.phone_number}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
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
                    <div className="py-5 flex justify-center border-t border-gray-100">
                        <button
                            onClick={handleModalNavigate}
                            className="py-1.5 px-10 bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-md shadow-blue-300 transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            More Details
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
});
MobileModal.displayName = 'MobileModal';

// Enhanced EmployeeRow component
const EmployeeRow = memo(({
    emp,
    openDropdown,
    dropdownPosition,
    toggleDropdown,
    onDelete,
    navigate,
    onStatusUpdate,
    setOpenDropdown,
    loading = false
}) => {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

    const formattedPhone = useMemo(() => formatPhoneNumber(emp.phone_number), [emp.phone_number]);

    const handleNavigateToProfile = useCallback((employeeId) => {
        if (!employeeId || employeeId === null || employeeId === undefined) {
            console.error('Invalid member ID:', employeeId);
            alert('Error: Invalid member ID');
            return;
        }
        navigate(`/profile/${String(employeeId)}`);
    }, [navigate]);

    const handleEditStatus = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMobileModalOpen(false);
        setTimeout(() => {
            setIsStatusModalOpen(true);
        }, 100);
        setOpenDropdown(null);
    }, [setOpenDropdown]);

    const handleMobileModalOpen = useCallback((e) => {
        e.stopPropagation();
        setIsMobileModalOpen(true);
    }, []);

    const handleMobileModalClose = useCallback(() => {
        setIsMobileModalOpen(false);
    }, []);

    const handleStatusModalClose = useCallback(() => {
        setIsStatusModalOpen(false);
    }, []);

    const handleStatusUpdate = useCallback((newStatus) => {
        onStatusUpdate(emp.id, newStatus);
        setIsStatusModalOpen(false);
    }, [onStatusUpdate, emp.id]);

    if (loading) {
        return <EmployeeRowSkeleton />;
    }

    return (
        <article 
            className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition p-4 grid grid-cols-1 gap-3 lg:grid-cols-17 lg:items-center"
            role="listitem"
        >
            {/* Mobile View - Top Section */}
            <div
                onClick={handleMobileModalOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMobileModalOpen(e);
                    }
                }}
                className="flex justify-between items-center lg:hidden cursor-pointer focus:ring-2 focus:ring-blue-500 rounded p-2 -m-2"
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${emp.first_name} ${emp.last_name}`}
            >
                <div className="flex items-center gap-3">
                    <img
                        className="w-12 h-12 rounded-full object-cover"
                        src={emp.profile_picture}
                        alt={`${emp.first_name} ${emp.last_name} profile picture`}
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                    <div>
                        <p className="text-[#1F2937] font-semibold">
                            <span className="capitalize">{emp.first_name}</span> <span className="capitalize">{emp.last_name}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">{emp.profession}</span>
                            {emp.level && emp.level !== "none" && (
                                <span className="px-2 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100 capitalize">
                                    {emp.level}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <AiOutlineRight size={18} className="text-blue-500" aria-hidden="true" />
            </div>

            <MobileModal
                emp={emp}
                isOpen={isMobileModalOpen}
                onClose={handleMobileModalClose}
                openDropdown={openDropdown}
                toggleDropdown={toggleDropdown}
                handleEditStatus={handleEditStatus}
                onDelete={onDelete}
                handleNavigateToProfile={handleNavigateToProfile}
            />

            {/* Desktop View */}
            <div className="hidden lg:flex items-center gap-3 col-span-5">
                <Image.PreviewGroup
                    items={emp.profile_picture ? [emp.profile_picture] : []}
                >
                    <Image
                        width={50}
                        height={50}
                        src={emp.profile_picture}
                        className="rounded-full object-cover"
                        loading="lazy"
                        alt={`${emp.first_name} ${emp.last_name} profile picture`}
                    />
                </Image.PreviewGroup>

                <div className="min-w-0">
                    <p className="text-[#1F2937] font-semibold truncate max-w-[180px] overflow-hidden">
                        <span className="capitalize">{emp.first_name}</span> <span className="capitalize">{emp.last_name}</span>
                    </p>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-500 text-sm font-medium truncate overflow-hidden max-w-[120px]">
                            {emp.profession}
                        </span>
                        {emp.level && emp.level !== "none" && (
                            <span className="px-3 py-[3px] rounded-md text-xs font-medium border border-gray-300 text-gray-600 bg-gray-100 truncate overflow-hidden max-w-[80px] capitalize">
                                {emp.level}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden lg:block lg:col-span-3 text-center">
                {emp.department}
            </div>

            <div className="hidden lg:block lg:col-span-4 text-center">
                {emp.phone_number ? (
                    <a
                        href={`tel:${formattedPhone}`}
                        className="hover:underline text-black focus:ring-2 focus:ring-blue-500 rounded"
                    >
                        {emp.phone_number}
                    </a>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </div>

            <div className="hidden lg:block lg:col-span-2 text-center text-gray-600">
                {emp.project_count || 0}
            </div>

            <div className="hidden lg:flex lg:col-span-2 justify-center">
                <StatusBadge status={emp.status} loading={loading} />
            </div>

            <div className="hidden lg:block text-right relative dropdown-container">
                <button
                    className="cursor-pointer more-vertical-button p-2 hover:bg-gray-100 rounded focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(emp.id, e);
                    }}
                    aria-label={`More options for ${emp.first_name} ${emp.last_name}`}
                    aria-haspopup="true"
                    aria-expanded={openDropdown === emp.id}
                >
                    <MoreVertical size={20} className="text-[#1F2937]" />
                </button>

                {openDropdown === emp.id && (
                    <EmployeeDropdownMenu
                        emp={emp}
                        dropdownPosition={dropdownPosition}
                        setIsStatusModalOpen={setIsStatusModalOpen}
                        onDelete={onDelete}
                        setOpenDropdown={setOpenDropdown}
                        handleNavigateToProfile={handleNavigateToProfile}
                    />
                )}
            </div>

            <EmployeeStatusModal
                employeeId={emp.id}
                currentStatus={emp.status}
                visible={isStatusModalOpen}
                onClose={handleStatusModalClose}
                onSuccess={handleStatusUpdate}
            />
        </article>
    );
});
EmployeeRow.displayName = 'EmployeeRow';

// Main EmployeeList component with loading states
const EmployeeList = ({
    employees,
    onDelete,
    onStatusUpdate,
    currentPage,
    totalEmployees,
    itemsPerPage,
    onPageChange,
    loading = false,
    error = null
}) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({});
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();

    const toggleDropdown = useCallback((id, e) => {
        e.stopPropagation();

        if (openDropdown === id) {
            setOpenDropdown(null);
            return;
        }

        const tableRect = e.currentTarget.getBoundingClientRect();
        const buttonRect = e.currentTarget.getBoundingClientRect();

        const position = calculateDropdownPosition(buttonRect, tableRect);

        setDropdownPosition(prev => ({ ...prev, [id]: position }));
        setOpenDropdown(id);
    }, [openDropdown]);

    // Memoized event handlers
    const handleDocumentClick = useCallback((event) => {
        const isMoreVerticalButton = event.target.closest('.more-vertical-button');
        const isDropdownMenu = event.target.closest('.dropdown-menu');
        if (!isMoreVerticalButton && !isDropdownMenu) {
            setOpenDropdown(null);
        }
    }, []);

    const showPagination = useMemo(() => totalEmployees > itemsPerPage, [totalEmployees, itemsPerPage]);

    // Close dropdown when clicking outside
    useEffect(() => {
        document.addEventListener('click', handleDocumentClick);
        return () => document.removeEventListener('click', handleDocumentClick);
    }, [handleDocumentClick]);

    // Keyboard navigation
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Loading state
    if (loading) {
        return <EmployeeListSkeleton count={itemsPerPage || 6} />;
    }

    // Error state
    if (error) {
        return (
            <div className="bg-gray-50 rounded-2xl shadow p-8 text-center" role="alert">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-red-700 mb-2">Error loading employees</h3>
                    <p className="text-red-600">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Authentication check
    if (!isAuthenticated) {
        return (
            <div
                className="flex justify-center items-center h-40 text-gray-500"
                role="alert"
                aria-live="polite"
            >
                <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p>Please login to view employees</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (employees.length === 0) {
        return (
            <div
                className="bg-gray-50 rounded-2xl shadow p-8 text-center"
                role="region"
                aria-label="No employees found"
            >
                <div className="text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                    <p>Try adjusting your search filters to find employees.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-gray-50 rounded-2xl shadow"
            role="region"
            aria-label="Employee list"
        >
            <div className="overflow-x-auto p-3">
                <div className="w-full">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-17 text-gray-500 text-md font-bold py-3 px-4 border-b border-b-gray-200 mb-7 pb-5">
                        <div className="col-span-5">Members</div>
                        <div className="col-span-3 text-center">Department</div>
                        <div className="col-span-4 text-center">Phone number</div>
                        <div className="col-span-2 text-center">Projects</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="text-center">Actions</div>
                    </div>

                    {/* Employee Rows */}
                    <div
                        className="space-y-3 mt-2"
                        role="list"
                        aria-label={`${employees.length} employees`}
                        aria-live="polite"
                    >
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
                                loading={loading}
                            />
                        ))}
                    </div>
                </div>
            </div>

           {/* Pagination */}
            {showPagination && (

            <div className="flex flex-col items-center py-6 border-t border-gray-200">
                <Pagination
                current={currentPage}
                total={totalEmployees}
                pageSize={itemsPerPage}
                onChange={onPageChange}
                showSizeChanger={false}
                showQuickJumper={false}
                showTitle={false}
                aria-label="Employee list pagination"
                />
                <div className="mt-2 text-gray-600 text-sm">
                {`${(currentPage - 1) * itemsPerPage + 1}-${
                    Math.min(currentPage * itemsPerPage, totalEmployees)
                } of ${totalEmployees}`}
                </div>
            </div>
            )}

        
        </div>
    );
};

export default memo(EmployeeList);