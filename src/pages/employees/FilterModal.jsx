// src/components/FilterModal.jsx
import { useEffect, useState, useCallback } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { createPortal } from "react-dom";
import { getDepartments } from "../../api/services/departmentService";

const FilterModal = ({ onFilter, onClearFilters, currentFilters }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        selectedDepartments: [],
        selectedRoles: [],
        status: ''
    });
    const [showAllDepartments, setShowAllDepartments] = useState(false);
    const [showAllRoles, setShowAllRoles] = useState(false);

    const visibleDepartments = showAllDepartments
        ? departments
        : departments.slice(0, 3);

    // Role options
    const roleOptions = [
        { value: 'manager', label: 'Manager' },
        { value: 'heads', label: 'Chief Officer' },
        { value: 'employee', label: 'Member' },
    ];

    const visibleRoles = showAllRoles
        ? roleOptions
        : roleOptions.slice(0, 3);

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'free', label: 'Free' },
        { value: 'working', label: 'Working' },
        { value: 'overload', label: 'Overload' },
        { value: 'sick', label: 'Sick' },
        { value: 'on_leave', label: 'On Leave' }
    ];

    // Initialize filters from props when modal opens
    useEffect(() => {
        if (isModalOpen && currentFilters) {
            setFilters({
                selectedDepartments: currentFilters.selectedDepartments || [],
                selectedRoles: currentFilters.selectedRoles || [],
                status: currentFilters.status || ''
            });
        }
    }, [isModalOpen, currentFilters]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await getDepartments();
                let departmentList = [];

                if (Array.isArray(res)) {
                    departmentList = res;
                } else if (Array.isArray(res?.data)) {
                    departmentList = res.data;
                } else if (Array.isArray(res?.results)) {
                    departmentList = res.results;
                }

                const normalizedDepartments = departmentList.map(dept => ({
                    id: dept.id || dept.value || Math.random().toString(36).substr(2, 9),
                    name: dept.name || 'Unnamed Department',
                    photo: dept.photo || '/default-department.png'
                }));

                setDepartments(normalizedDepartments);
            } catch (err) {
                console.error("Error fetching departments:", err);
            }
        };
        fetchDepartments();
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isModalOpen]);

    const handleDepartmentToggle = useCallback((deptIndex) => {
        setFilters(prev => ({
            ...prev,
            selectedDepartments: prev.selectedDepartments.includes(deptIndex)
                ? prev.selectedDepartments.filter(i => i !== deptIndex)
                : [...prev.selectedDepartments, deptIndex]
        }));
    }, []);

    const handleRoleToggle = useCallback((roleValue) => {
        setFilters(prev => ({
            ...prev,
            selectedRoles: prev.selectedRoles.includes(roleValue)
                ? prev.selectedRoles.filter(role => role !== roleValue)
                : [...prev.selectedRoles, roleValue]
        }));
    }, []);

    const handleStatusChange = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            status: value
        }));
    }, []);

    const applyFilters = () => {
        onFilter?.(filters);
        setIsModalOpen(false);
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            selectedDepartments: [],
            selectedRoles: [],
            status: ''
        };
        setFilters(clearedFilters);
        onClearFilters?.();
    };

    const hasActiveFilters = () => {
        return filters.selectedDepartments.length > 0 ||
            filters.selectedRoles.length > 0 ||
            filters.status;
    };

    const getActiveFilterCount = () => {
        return filters.selectedDepartments.length +
            filters.selectedRoles.length +
            (filters.status ? 1 : 0);
    };

    // Modal Component
    const Modal = () =>
        createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close filters modal"
                />

                {/* Modal Content */}
                <div className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Close filters modal"
                        >
                            <AiOutlineClose size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Departments Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Departments
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {visibleDepartments.map((dept, index) => {
                                    const deptIndex = index + 1; // start from 1
                                    const isSelected = filters.selectedDepartments.includes(deptIndex);
                                    return (
                                        <label
                                            key={dept.id}
                                            className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded transition-colors text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleDepartmentToggle(deptIndex)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <img
                                                    src={dept.photo}
                                                    alt={dept.name}
                                                    className="w-[30px] h-[30px] rounded-full shadow-lg object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/default-department.png';
                                                    }}
                                                />
                                                <span className="text-gray-700">{dept.name}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {departments.length > 3 && (
                                <button
                                    className="text-blue-500 text-xs mt-1 hover:text-blue-600 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
                                    onClick={() => setShowAllDepartments(!showAllDepartments)}
                                    aria-expanded={showAllDepartments}
                                >
                                    {showAllDepartments ? 'Show less' : `View more (${departments.length - 3})`}
                                    <svg className={`w-3 h-3 ml-1 transition-transform ${showAllDepartments ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Roles Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Roles
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {visibleRoles.map((role) => {
                                    const isSelected = filters.selectedRoles.includes(role.value);
                                    return (
                                        <label
                                            key={role.value}
                                            className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded transition-colors text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleRoleToggle(role.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700">{role.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {roleOptions.length > 3 && (
                                <button
                                    className="text-blue-500 text-xs mt-1 hover:text-blue-600 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
                                    onClick={() => setShowAllRoles(!showAllRoles)}
                                    aria-expanded={showAllRoles}
                                >
                                    {showAllRoles ? 'Show less' : `View more (${roleOptions.length - 3})`}
                                    <svg className={`w-3 h-3 ml-1 transition-transform ${showAllRoles ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm appearance-none cursor-pointer"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 space-y-3 sticky bottom-0 bg-white">
                        <div className="flex space-x-2">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex-1 py-2 px-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={applyFilters}
                                className="flex-1 p-3 rounded-lg font-medium transition-colors text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-500"
                            >
                                Save Filters ({getActiveFilterCount()})
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            {/* Desktop Filter Button */}
            <div className="hidden lg:block">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`p-3 bg-white rounded-lg shadow-md flex items-center gap-1.5 transition-all duration-200 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasActiveFilters()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                    aria-label={`Open filters ${hasActiveFilters() ? `(${getActiveFilterCount()} active)` : ''}`}
                >
                    <HiOutlineFilter size={24} />
                    {hasActiveFilters() && (
                        <span className="ml-0.5 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full min-w-[16px] text-center">
                            {getActiveFilterCount()}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className={`lg:hidden fixed bottom-6 left-5 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasActiveFilters() ? 'bg-blue-500' : 'bg-blue-600'
                    }`}
                aria-label={`Open filters ${hasActiveFilters() ? `(${getActiveFilterCount()} active)` : ''}`}
            >
                <HiOutlineFilter size={18} />
                {hasActiveFilters() && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {getActiveFilterCount()}
                    </span>
                )}
            </button>

            {/* Render modal */}
            {isModalOpen && <Modal />}
        </>
    );
};

export default FilterModal;