import { useState, useEffect, useCallback } from "react";
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

const InnerCircle = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const itemsPerPage = 12;
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalActivities, setTotalActivities] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("innerCircleTab") || "list"
    );
    const { user, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const isLoading = authLoading || dataLoading;

    const [departments, setDepartments] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Initialize filters from URL parameters or localStorage
    const initializeFilters = () => {
        const urlFilters = {
            selectedDepartments: searchParams.get('departments')
                ? searchParams.get('departments').split(',').map(n => parseInt(n, 10)).filter(Boolean)
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
        return urlFilters;
    };

    const [currentFilters, setCurrentFilters] = useState(initializeFilters());

    // Update URL parameters when filters change
    const updateUrlParams = useCallback((page, filters) => {
        const params = new URLSearchParams();

        // Always set page
        params.set("page_num", page.toString());
        if (filters.selectedDepartments.length > 0) {
            params.set("departments", filters.selectedDepartments.join(','));
        }
        if (filters.status) params.set("status", filters.status);

        // Set task filter params only if they have values
        if (filters.taskFilters.activeMin) params.set("active_min", filters.taskFilters.activeMin);
        if (filters.taskFilters.activeMax) params.set("active_max", filters.taskFilters.activeMax);
        if (filters.taskFilters.reviewMin) params.set("review_min", filters.taskFilters.reviewMin);
        if (filters.taskFilters.reviewMax) params.set("review_max", filters.taskFilters.reviewMax);
        if (filters.taskFilters.completedMin) params.set("completed_min", filters.taskFilters.completedMin);
        if (filters.taskFilters.completedMax) params.set("completed_max", filters.taskFilters.completedMax);

        // Update URL without causing navigation
        setSearchParams(params, { replace: true });

        // Save filters to localStorage
        localStorage.setItem('innerCircleFilters', JSON.stringify(filters));
    }, [setSearchParams]);

    // Enhanced filter handler
    const handleFilter = useCallback((filters) => {
        setCurrentFilters(filters);
        // ALWAYS reset to page 1 when applying new filters
        updateUrlParams(1, filters);

        // Fetch data based on active tab - start from page 1
        if (activeTab === "list") {
            fetchEmployees(1, filters);
        } else if (activeTab === "activity") {
            // For activity tab, URL update will trigger useEffect in Activity component
            // The Activity component will automatically fetch from page 1 with new filters
        }
    }, [activeTab, updateUrlParams]);

    // Enhanced clear filters handler
    const handleClearFilters = useCallback(() => {
        const clearedFilters = {
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
        setCurrentFilters(clearedFilters);
        // ALWAYS reset to page 1 when clearing filters
        updateUrlParams(1, clearedFilters);

        // Fetch data from page 1
        if (activeTab === "list") {
            fetchEmployees(1, clearedFilters);
        } else if (activeTab === "activity") {
            // Activity component will handle the refetch automatically via useEffect
        }

        // Clear from localStorage
        localStorage.removeItem('innerCircleFilters');
    }, [activeTab, updateUrlParams]);

    const handleStatusUpdate = (employeeId, newStatus) => {
        setEmployees(prevEmployees =>
            prevEmployees.map(emp =>
                emp.id === employeeId
                    ? { ...emp, status: newStatus }
                    : emp
            )
        );
    };

    // Fetch departments first
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const deptData = await getDepartments();
                setDepartments(deptData);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    }, []);

    // Enhanced fetchEmployees function to handle multiple filters
    const fetchEmployees = async (page = 1, filters = null, updateUrl = true) => {
        const filtersToUse = filters || currentFilters;
        setLoading(true);

        try {
            const res = await getEmployees(page, filtersToUse, departments);

            setEmployees(res.results || []);
            setTotalEmployees(res.count || 0);

            // Only update URL params when explicitly requested (not on initial load)
            if (updateUrl) {
                updateUrlParams(page, filtersToUse);
            }
        } catch (err) {
            console.error("❌ Error fetching members:", err);
            message.error("Failed to fetch members");
        } finally {
            setLoading(false);
        }
    };

    // Handle page changes
    const handlePageChange = (newPage) => {
        updateUrlParams(newPage, currentFilters);
        fetchEmployees(newPage, currentFilters);
    };

    // Initialize data on component mount
    useEffect(() => {
        if (!authLoading) {
            const pageFromUrl = parseInt(searchParams.get("page_num") || "1", 10);
            fetchEmployees(pageFromUrl, currentFilters, false).finally(() => setDataLoading(false));
        }
    }, [authLoading]);

    // Handle URL parameter changes (back/forward navigation)
    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get("page_num") || "1", 10);
        const urlFilters = {
            selectedDepartments: searchParams.get('departments')
                ? searchParams.get('departments').split(',').map(n => parseInt(n, 10)).filter(Boolean)
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

        // Only fetch if the URL parameters are different from current state
        const filtersChanged = JSON.stringify(urlFilters) !== JSON.stringify(currentFilters);

        if (filtersChanged) {
            setCurrentFilters(urlFilters);
            fetchEmployees(pageFromUrl, urlFilters, false);
        }
    }, [searchParams.toString()]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const showDeleteModal = (id) => {
        setSelectedId(id);
        setIsDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedId(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedId) return;

        try {
            setLoading(true);
            await deleteUser(selectedId);
            message.success("Member deleted successfully");

            // Stay on current page with current filters
            const currentPage = parseInt(searchParams.get("page_num") || "1", 10);
            await fetchEmployees(currentPage, currentFilters, false);
        } catch (err) {
            console.error("Delete error details:", {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers,
            });
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
    };

    const handleAddEmployee = async (employeeData) => {
        if (loading) {
            message.error("Already processing, ignoring duplicate call");
            return;
        }

        try {
            setLoading(true);

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

            const form = new FormData();

            form.append("first_name", employeeData.first_name);
            form.append("last_name", employeeData.last_name);
            form.append("email", employeeData.email);
            form.append("password", employeeData.password);
            form.append("password1", employeeData.password1);

            if (employeeData.department) {
                form.append("department_id", employeeData.department);
            }
            if (employeeData.profession?.trim()) {
                form.append("profession", employeeData.profession.trim());
            }
            if (employeeData.phone_number?.trim()) {
                form.append("phone_number", employeeData.phone_number.trim());
            }
            if (employeeData.tg_username?.trim()) {
                form.append("tg_username", employeeData.tg_username.trim());
            }
            if (employeeData.level) {
                form.append("level", employeeData.level);
            }
            if (employeeData.role) {
                form.append("role", employeeData.role);
            }
            if (employeeData.address?.trim()) {
                form.append("address", employeeData.address.trim());
            }
            if (employeeData.profile_picture) {
                form.append("profile_picture", employeeData.profile_picture, employeeData.profile_picture.name);
            }
            if (employeeData.birth_date) {
                form.append("birth_date", employeeData.birth_date);
            }

            const response = await createEmployees(form);

            message.success("Member added successfully");
            setIsAddModalOpen(false);

            // Refresh current page with current filters
            const currentPage = parseInt(searchParams.get("page_num") || "1", 10);
            await fetchEmployees(currentPage, currentFilters, false);

        } catch (err) {
            console.error("❌ API Error:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);

            let errorMessage = "Failed to add member";

            if (err.response?.status === 400) {
                if (err.response.data?.email) {
                    errorMessage = "Email already exists. Please use a different email.";
                } else if (err.response.data?.errors) {
                    const errors = Object.entries(err.response.data.errors)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
                        .join("; ");
                    errorMessage = `Validation errors: ${errors}`;
                } else if (err.response.data?.detail) {
                    errorMessage = err.response.data.detail;
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            } else if (err.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            }

            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        localStorage.setItem("innerCircleTab", tab);

        // Reset filters when switching tabs AND reset to page 1
        const clearedFilters = {
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
        setCurrentFilters(clearedFilters);
        updateUrlParams(1, clearedFilters); // Reset to page 1
    };

    // Function to get the total count based on active tab
    const getTotalCount = () => {
        return activeTab === "list" ? totalEmployees : totalActivities;
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[100vh]">Loading...</div>;
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-[100vh]">
                Loading...
            </div>
        );

    return (
        <div className="w-full max-w-screen-2xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-6 gap-4">
                <h1 className="text-[#1F2937] font-bold text-2xl sm:text-3xl xl:text-4xl text-center md:text-left">
                    Inner Circle ({getTotalCount()})
                </h1>

                {/* Tabs */}
                <div className="flex items-center bg-[#DBDBDB] rounded-4xl w-full md:w-[280px] xl:w-[350px] overflow-hidden p-1">
                    <button
                        onClick={() => handleTabClick("list")}
                        className={`py-2 sm:py-[9px] text-sm sm:text-base font-bold w-1/2 transition-all duration-200 rounded-full cursor-pointer ${activeTab === "list"
                            ? "bg-[#0061fe] text-white"
                            : "bg-[#DBDBDB] text-[#1F2937]"
                            }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => handleTabClick("activity")}
                        className={`py-2 sm:py-[9px] text-sm sm:text-base font-bold w-1/2 transition-all duration-200 rounded-full cursor-pointer ${activeTab === "activity"
                            ? "bg-[#0061fe] text-white"
                            : "bg-[#DBDBDB] text-[#1F2937]"
                            }`}
                    >
                        Activity
                    </button>
                </div>

                <div className="flex items-center gap-5">
                    {/* FilterModal with conditional props based on activeTab */}
                    <div className="flex items-center gap-3">
                        <FilterModal
                            onFilter={handleFilter}
                            onClearFilters={handleClearFilters}
                            currentFilters={currentFilters}
                            showTaskFilters={activeTab === "activity"} // Show task filters only in activity tab
                        />
                    </div>
                    <Permission anyOf={[ROLES.EMPLOYEE, ROLES.MANAGER]}>
                        <div className="hidden justify-center lg:justify-end w-[240px]"></div>
                    </Permission>

                    {/* Add Button - only show in list tab */}
                    <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS, ROLES.DEP_MANAGER]}>
                        {!loading && (
                            <div className="flex justify-center lg:justify-end">
                                {/* Desktop Button - faqat lg: dan boshlab */}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="hidden lg:flex bg-[#0061fe] text-white text-sm sm:text-base rounded-2xl items-center gap-2 py-2 px-4 sm:py-3 sm:px-[26px] cursor-pointer shadow-xl shadow-bg-blue-300"
                                >
                                    <Plus size={18} /> <span>Add Member</span>
                                </button>

                                {/* Mobile + Tablet Floating Button */}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0061fe] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                >
                                    <Plus size={24} />
                                </button>
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
                    // Pagination props
                    currentPage={parseInt(searchParams.get("page_num") || "1", 10)}
                    totalEmployees={totalEmployees}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            )}

            <Modal
                title={`Are you sure you want to delete this member?`}
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

            {activeTab === "activity" && (
                <Activity
                    onTotalActivitiesChange={setTotalActivities}
                    currentFilters={currentFilters}
                />
            )}

            {/* Modal */}
            <AddEmployeeModal
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
            />
        </div>
    );
};

export default InnerCircle;