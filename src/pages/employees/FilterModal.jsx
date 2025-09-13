// src/components/FilterModal.jsx
import { useEffect, useState, useCallback } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { createPortal } from "react-dom";
import { getDepartments } from "../../api/services/departmentService";

const FilterModal = ({ onFilter, onClearFilters, currentFilters, showTaskFilters = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        selectedDepartments: [],
        selectedRoles: [],
        status: '',
        taskFilters: {
            activeMin: '',
            activeMax: '',
            reviewMin: '',
            reviewMax: '',
            completedMin: '',
            completedMax: ''
        }
    });
    const [showAllDepartments, setShowAllDepartments] = useState(false);

    const visibleDepartments = showAllDepartments
        ? departments
        : departments.slice(0, 3);

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
                status: currentFilters.status || '',
                taskFilters: currentFilters.taskFilters || {
                    activeMin: '',
                    activeMax: '',
                    reviewMin: '',
                    reviewMax: '',
                    completedMin: '',
                    completedMax: ''
                }
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

    const handleStatusChange = useCallback((value) => {
        setFilters(prev => ({
            ...prev,
            status: value
        }));
    }, []);

    const handleTaskFilterChange = useCallback((filterType, value) => {
        setFilters(prev => ({
            ...prev,
            taskFilters: {
                ...prev.taskFilters,
                [filterType]: value
            }
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
            status: '',
            taskFilters: {
                activeMin: '',
                activeMax: '',
                reviewMin: '',
                reviewMax: '',
                completedMin: '',
                completedMax: ''
            }
        };
        setFilters(clearedFilters);
        onClearFilters?.();
    };

    const hasActiveFilters = () => {
        const hasBasicFilters = filters.selectedDepartments.length > 0 ||
            filters.selectedRoles.length > 0 ||
            filters.status;

        const hasTaskFilters = showTaskFilters && Object.values(filters.taskFilters).some(val => val !== '');

        return hasBasicFilters || hasTaskFilters;
    };

    const getActiveFilterCount = () => {
        let count = filters.selectedDepartments.length +
            filters.selectedRoles.length +
            (filters.status ? 1 : 0);

        if (showTaskFilters) {
            count += Object.values(filters.taskFilters).filter(val => val !== '').length;
        }

        return count;
    };

    // Modal Component
    const Modal = () =>
        createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Departments Filter - Using index-based approach */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                Departments
                            </label>
                            <div className={`space-y-2 transition-all duration-300 ease-in-out ${showAllDepartments ? 'max-h-60' : 'max-h-40'} overflow-y-auto`}>
                                {visibleDepartments.map((dept, index) => {
                                    // Use index + 1 as department identifier (1, 2, 3...)
                                    const deptIndex = index + 1;
                                    const isSelected = filters.selectedDepartments.includes(deptIndex);
                                    return (
                                        <label
                                            key={dept.id}
                                            className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200 border ${isSelected
                                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleDepartmentToggle(deptIndex)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <div className="flex items-center space-x-3 flex-1">
                                                <img
                                                    src={dept.photo}
                                                    alt={dept.name}
                                                    className="w-8 h-8 rounded-full shadow-md object-cover ring-2 ring-white"
                                                    onError={(e) => {
                                                        e.target.src = '/default-department.png';
                                                    }}
                                                />
                                                <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {dept.name}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Show More/Less Button */}
                            {departments.length > 3 && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200 transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                        onClick={() => setShowAllDepartments(!showAllDepartments)}
                                        aria-expanded={showAllDepartments}
                                    >
                                        {showAllDepartments ? (
                                            <>
                                                <span>Show Less</span>
                                                <svg className="w-4 h-4 transition-transform duration-200 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                <span>Show {departments.length - 3} More</span>
                                                <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        {!showTaskFilters && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm appearance-none cursor-pointer font-medium text-gray-700"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task Filters - Only show if showTaskFilters is true */}
                        {showTaskFilters && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Task Count Filters
                                </label>
                                <div className="space-y-4">
                                    {/* Active Tasks Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Active Tasks
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.taskFilters.activeMin}
                                                onChange={(e) => handleTaskFilterChange('activeMin', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.taskFilters.activeMax}
                                                onChange={(e) => handleTaskFilterChange('activeMax', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Review Tasks Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Review Tasks
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.taskFilters.reviewMin}
                                                onChange={(e) => handleTaskFilterChange('reviewMin', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.taskFilters.reviewMax}
                                                onChange={(e) => handleTaskFilterChange('reviewMax', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Completed Tasks Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-2">
                                            Approved Tasks
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.taskFilters.completedMin}
                                                onChange={(e) => handleTaskFilterChange('completedMin', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.taskFilters.completedMax}
                                                onChange={(e) => handleTaskFilterChange('completedMax', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 space-y-3 sticky bottom-0 bg-white">
                        <div className="flex space-x-3">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex-1 py-3 px-4 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={applyFilters}
                                className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                            >
                                Apply Filters ({getActiveFilterCount()})
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
                className={`lg:hidden fixed z-[999] bottom-6 left-5 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasActiveFilters() ? 'bg-blue-500' : 'bg-blue-600'
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