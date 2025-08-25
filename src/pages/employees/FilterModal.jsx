// src/components/FilterModal.jsx
import { useEffect, useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import { createPortal } from "react-dom";
import { getDepartments } from "../../api/services/departmentService";

const FilterModal = ({ onFilter, onClearFilters }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        fullName: '',
        phoneNumber: '',
        selectedDepartments: [],
        status: ''
    });
    const [matchCount, setMatchCount] = useState(0);
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

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await getDepartments();
                const list = Array.isArray(res) ? res : res?.data || res?.results || [];
                setDepartments(list);
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

    const handleInputChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDepartmentToggle = (deptId) => {
        setFilters(prev => ({
            ...prev,
            selectedDepartments: prev.selectedDepartments.includes(deptId)
                ? prev.selectedDepartments.filter(id => id !== deptId)
                : [...prev.selectedDepartments, deptId]
        }));
    };

    const applyFilters = () => {
        onFilter?.(filters);
        setIsModalOpen(false);
        // Calculate match count (this would typically come from your API response)
        setMatchCount(0); // You'll update this based on your actual filtering logic
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            fullName: '',
            phoneNumber: '',
            selectedDepartments: [],
            status: ''
        };
        setFilters(clearedFilters);
        onClearFilters?.();
        setMatchCount(0);
    };

    const hasActiveFilters = () => {
        return filters.fullName ||
            filters.phoneNumber ||
            filters.selectedDepartments.length > 0 ||
            filters.status;
    };

    const getActiveFilterCount = () => {
        return (filters.fullName ? 1 : 0) +
            (filters.phoneNumber ? 1 : 0) +
            filters.selectedDepartments.length +
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
                />

                {/* Modal Content */}
                <div className="relative bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <AiOutlineClose size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Full Name Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={filters.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Search by name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                            />
                        </div>

                        {/* Phone Number Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                value={filters.phoneNumber}
                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                placeholder="Search by phone"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                            />
                        </div>

                        {/* Departments Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Departments
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {visibleDepartments.map((dept) => {
                                    const isSelected = filters.selectedDepartments.includes(dept.id ?? dept.value);
                                    return (
                                        <label
                                            key={dept.id ?? dept.value ?? dept.name}
                                            className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-gray-50 rounded transition-colors text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleDepartmentToggle(dept.id ?? dept.value)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <img
                                                    src={dept.photo}
                                                    alt="department photos"
                                                    className="w-[30px] h-[30px] rounded-full shadow-lg"
                                                />
                                                <span className="text-gray-700">{dept.name}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {departments.length > 3 && (
                                <button
                                    className="text-blue-500 text-xs mt-1 hover:text-blue-600 flex items-center"
                                    onClick={() => setShowAllDepartments(!showAllDepartments)}
                                >
                                    {showAllDepartments ? 'Show less' : `View more (${departments.length - 3})`}
                                    <svg className={`w-3 h-3 ml-1 transition-transform ${showAllDepartments ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                    onChange={(e) => handleInputChange('status', e.target.value)}
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
                        {/* <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-600">
                            <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span>{matchCount} matches found</span>
                        </div> */}

                        <div className="flex space-x-2">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex-1 py-2 px-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors text-sm"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={applyFilters}
                                className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium transition-colors text-sm cursor-pointer"
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
                    className={`p-3 bg-white rounded-lg shadow-md flex items-center gap-1.5 transition-all duration-200 text-sm cursor-pointer ${hasActiveFilters() ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'
                        }`}
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
                className={`lg:hidden fixed bottom-5 right-5 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg ${hasActiveFilters() ? 'bg-blue-600' : 'bg-gray-800'
                    }`}
                aria-label="Open filters"
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