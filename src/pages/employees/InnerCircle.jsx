import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import EmployeeList from "./EmployeeList";
import Activity from "./activity";
import AddEmployeeModal from "./AddEmployeeModal";
import FilterModal from "./FilterModal";
import {
    getEmployees,
    createEmployees,
} from "../../api/services/employeeService";
import { deleteUser } from "../../api/services/userService";
import { getDepartments } from "../../api/services/departmentService";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import { message, Modal } from "antd";

// Constants
const ITEMS_PER_PAGE = 12;
const DEFAULT_FILTERS = {
    selectedDepartments: [],
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

// Memoized TabButton component
const TabButton = memo(({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`py-2 sm:py-[9px] text-sm sm:text-base font-bold w-1/2 transition-all duration-200 rounded-full cursor-pointer ${
            active
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-[#1F2937]"
        }`}
    >
        {children}
    </button>
));
TabButton.displayName = 'TabButton';

// Memoized AddButton component
const AddButton = memo(({ onClick, loading }) => (
    <>
        {/* Desktop Button */}
        <button
            onClick={onClick}
            disabled={loading}
            className="hidden lg:flex bg-[#0061fe] text-white text-sm sm:text-base rounded-2xl items-center gap-2 py-2 px-4 sm:py-3 sm:px-[26px] cursor-pointer shadow-xl shadow-bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus size={18} /> <span>Add Member</span>
        </button>

        {/* Mobile + Tablet Floating Button */}
        <button
            onClick={onClick}
            disabled={loading}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0061fe] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <Plus size={24} />
        </button>
    </>
));
AddButton.displayName = 'AddButton';

// Memoized LoadingSpinner component
const LoadingSpinner = memo(() => (
    <div className="flex justify-center items-center h-[100vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0061fe]"></div>
    </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Utility functions
const parseFiltersFromUrl = (searchParams) => {
    return {
        selectedDepartments: searchParams.get('departments')
            ? searchParams.get('departments').split(',')
                .map(n => {
                    const parsed = parseInt(n, 10);
                    return isNaN(parsed) ? n : parsed;
                })
                .filter(id => id !== null && id !== undefined && id !== '')
            : [],
        status: searchParams.get('status') || '',
        taskFilters: {
            activeMin: searchParams.get('active_min') || '',
            activeMax: searchParams.get('active_max') || '',
            reviewMin: searchParams.get('review_min') || '',
            reviewMax: searchParams.get('review_max') || '',
            completedMin: searchParams.get('completed_min') || '',
            completedMax: searchParams.get('completed_max') || ''
        }
    };
};

const cleanDepartmentIds = (departments) => {
    return departments
        .filter(id => id !== null && id !== undefined && id !== '')
        .map(id => String(id));
};

const InnerCircle = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalActivities, setTotalActivities] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("innerCircleTab") || "list"
    );
    const { user, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Refs for preventing multiple API calls
    const fetchingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // Memoized values
    const isLoading = useMemo(() => authLoading || dataLoading, [authLoading, dataLoading]);
    const currentPage = useMemo(() => 
        parseInt(searchParams.get("page_num") || "1", 10), 
        [searchParams]
    );

    // Initialize filters from URL
    const [currentFilters, setCurrentFilters] = useState(() => 
        parseFiltersFromUrl(searchParams)
    );

    // Memoized total count
    const totalCount = useMemo(() => 
        activeTab === "list" ? totalEmployees : totalActivities, 
        [activeTab, totalEmployees, totalActivities]
    );

    // Stable callback for updating URL parameters
    const updateUrlParams = useCallback((page, filters) => {
        const params = new URLSearchParams();
        params.set("page_num", page.toString());

        if (filters.selectedDepartments.length > 0) {
            const cleanIds = cleanDepartmentIds(filters.selectedDepartments);
            if (cleanIds.length > 0) {
                params.set("departments", cleanIds.join(','));
            }
        }

        if (filters.status) params.set("status", filters.status);

        // Set task filter params only if they have values
        Object.entries(filters.taskFilters).forEach(([key, value]) => {
            if (value) {
                const paramName = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                params.set(paramName, value);
            }
        });

        setSearchParams(params, { replace: true });
        localStorage.setItem('innerCircleFilters', JSON.stringify(filters));
    }, [setSearchParams]);

    // Optimized fetch employees function with debouncing and cancellation
    const fetchEmployees = useCallback(async (page = 1, filters = null, updateUrl = true) => {
        // Prevent multiple simultaneous calls
        if (fetchingRef.current) {
            return;
        }

        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();
        fetchingRef.current = true;

        const filtersToUse = filters || currentFilters;
        setLoading(true);

        try {
            const apiFilters = {
                ...filtersToUse,
                selectedDepartments: filtersToUse.selectedDepartments
                    .filter(id => id !== null && id !== undefined && id !== '')
                    .map(id => {
                        const numId = parseInt(id, 10);
                        return isNaN(numId) ? String(id) : numId;
                    })
            };

            const res = await getEmployees(page, apiFilters, departments, {
                signal: abortControllerRef.current.signal
            });

            // Only update state if request wasn't cancelled
            if (!abortControllerRef.current.signal.aborted) {
                setEmployees(res.results || []);
                setTotalEmployees(res.count || 0);

                if (updateUrl) {
                    updateUrlParams(page, filtersToUse);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("❌ Error fetching members:", err);
                message.error("Failed to fetch members");
            }
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    }, [currentFilters, departments, updateUrlParams]);

    // Memoized filter handler
    const handleFilter = useCallback((filters) => {
        setCurrentFilters(filters);
        updateUrlParams(1, filters);

        if (activeTab === "list") {
            fetchEmployees(1, filters);
        }
    }, [activeTab, updateUrlParams, fetchEmployees]);

    // Memoized clear filters handler
    const handleClearFilters = useCallback(() => {
        setCurrentFilters(DEFAULT_FILTERS);
        updateUrlParams(1, DEFAULT_FILTERS);

        if (activeTab === "list") {
            fetchEmployees(1, DEFAULT_FILTERS);
        }

        localStorage.removeItem('innerCircleFilters');
    }, [activeTab, updateUrlParams, fetchEmployees]);

    // Optimized status update handler
    const handleStatusUpdate = useCallback((employeeId, newStatus) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === employeeId
                    ? { ...emp, status: newStatus }
                    : emp
            )
        );
    }, []);

    // Memoized page change handler
    const handlePageChange = useCallback((newPage) => {
        updateUrlParams(newPage, currentFilters);
        fetchEmployees(newPage, currentFilters);
    }, [currentFilters, updateUrlParams, fetchEmployees]);

    // Optimized tab click handler
    const handleTabClick = useCallback((tab) => {
        if (tab === activeTab) return; // Prevent unnecessary updates

        setActiveTab(tab);
        localStorage.setItem("innerCircleTab", tab);

        setCurrentFilters(DEFAULT_FILTERS);
        updateUrlParams(1, DEFAULT_FILTERS);
    }, [activeTab, updateUrlParams]);

    // Modal handlers
    const showDeleteModal = useCallback((id) => {
        setSelectedId(id);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setSelectedId(null);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedId || loading) return;

        try {
            setLoading(true);
            await deleteUser(selectedId);
            message.success("Member deleted successfully");

            await fetchEmployees(currentPage, currentFilters, false);
        } catch (err) {
            console.error("Delete error:", err);
            message.error(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Failed to delete member"
            );
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedId(null);
        }
    }, [selectedId, loading, currentPage, currentFilters, fetchEmployees]);

    // Optimized add employee handler with better validation
    const handleAddEmployee = useCallback(async (employeeData) => {
        if (loading) {
            message.error("Already processing, please wait");
            return;
        }

        // Validation
        if (employeeData.password !== employeeData.password1) {
            message.error('Passwords do not match');
            return;
        }

        if (employeeData.password.length < 8) {
            message.error('Password must be at least 8 characters');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
            message.error('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);

            const form = new FormData();
            
            // Required fields
            form.append("first_name", employeeData.first_name);
            form.append("last_name", employeeData.last_name);
            form.append("email", employeeData.email);
            form.append("password", employeeData.password);
            form.append("password1", employeeData.password1);

            // Optional fields
            const optionalFields = [
                'department', 'profession', 'phone_number', 'tg_username',
                'level', 'role', 'address', 'birth_date'
            ];

            optionalFields.forEach(field => {
                const value = employeeData[field];
                if (value && (typeof value === 'string' ? value.trim() : value)) {
                    const fieldName = field === 'department' ? 'department_id' : field;
                    form.append(fieldName, typeof value === 'string' ? value.trim() : value);
                }
            });

            if (employeeData.profile_picture) {
                form.append("profile_picture", employeeData.profile_picture, employeeData.profile_picture.name);
            }

            await createEmployees(form);
            message.success("Member added successfully");
            setIsAddModalOpen(false);

            await fetchEmployees(currentPage, currentFilters, false);

        } catch (err) {
            console.error("❌ API Error:", err);

            let errorMessage = "Failed to add member";

            if (err.response?.status === 400) {
                if (err.response.data?.email) {
                    errorMessage = "Email already exists. Please use a different email.";
                } else if (err.response.data?.errors) {
                    const errors = Object.entries(err.response.data.errors)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
                        .join("; ");
                    errorMessage = `Validation errors: ${errors}`;
                } else if (err.response.data?.detail || err.response.data?.message) {
                    errorMessage = err.response.data.detail || err.response.data.message;
                }
            } else if (err.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [loading, currentPage, currentFilters, fetchEmployees]);

    // Fetch departments on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const deptData = await getDepartments();
                setDepartments(deptData);
            } catch (error) {
                console.error("Error fetching departments:", error);
                message.error("Failed to load departments");
            }
        };
        fetchDepartments();
    }, []);

    // Initialize data on component mount
    useEffect(() => {
        if (!authLoading && departments.length > 0) {
            fetchEmployees(currentPage, currentFilters, false).finally(() => {
                setDataLoading(false);
            });
        }
    }, [authLoading, departments.length]); // Removed fetchEmployees from deps to prevent infinite loop

    // Handle URL parameter changes (back/forward navigation)
    useEffect(() => {
        const urlFilters = parseFiltersFromUrl(searchParams);
        const filtersChanged = JSON.stringify(urlFilters) !== JSON.stringify(currentFilters);
        
        if (filtersChanged && !fetchingRef.current) {
            setCurrentFilters(urlFilters);
            fetchEmployees(currentPage, urlFilters, false);
        }
    }, [searchParams.toString()]); // Only depend on search params string

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full max-w-screen-2xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-6 gap-4">
                <h1 className="text-[#1F2937] font-bold text-2xl sm:text-3xl xl:text-4xl text-center md:text-left">
                    Inner Circle ({totalCount})
                </h1>

                {/* Tabs */}
                <div className="flex items-center bg-[#DBDBDB] rounded-4xl w-full md:w-[280px] xl:w-[350px] overflow-hidden p-1">
                    <TabButton 
                        active={activeTab === "list"}
                        onClick={() => handleTabClick("list")}
                    >
                        List
                    </TabButton>
                    <TabButton 
                        active={activeTab === "activity"}
                        onClick={() => handleTabClick("activity")}
                    >
                        Activity
                    </TabButton>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3">
                        <FilterModal
                            onFilter={handleFilter}
                            onClearFilters={handleClearFilters}
                            currentFilters={currentFilters}
                            showTaskFilters={activeTab === "activity"}
                        />
                    </div>
                    
                    <Permission anyOf={[ROLES.EMPLOYEE, ROLES.MANAGER]}>
                        <div className="hidden justify-center lg:justify-end w-[240px]"></div>
                    </Permission>

                    <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS, ROLES.DEP_MANAGER]}>
                        {!loading && (
                            <div className="flex justify-center lg:justify-end">
                                <AddButton 
                                    onClick={() => setIsAddModalOpen(true)}
                                    loading={loading}
                                />
                            </div>
                        )}
                    </Permission>
                </div>
            </div>

            {/* Content */}
            {activeTab === "list" && (
                <EmployeeList
                    employees={employees}
                    loading={loading}
                    onDelete={showDeleteModal}
                    onStatusUpdate={handleStatusUpdate}
                    currentPage={currentPage}
                    totalEmployees={totalEmployees}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            )}

            {activeTab === "activity" && (
                <Activity
                    onTotalActivitiesChange={setTotalActivities}
                    currentFilters={currentFilters}
                />
            )}

            {/* Modals */}
            <Modal
                title="Are you sure you want to delete this member?"
                open={isDeleteModalOpen}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Yes, delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading }}
                className="delete-modal"
            >
                <p>This action cannot be undone.</p>
            </Modal>

            <AddEmployeeModal
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
            />
        </div>
    );
};

export default memo(InnerCircle);