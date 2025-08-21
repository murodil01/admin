import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import EmployeeList from "./EmployeeList";
import Activity from "./activity";
import AddEmployeeModal from "./AddEmployeeModal";
import {
    getEmployees,
    createEmployees,
} from "../../api/services/employeeService";
import { deleteUser } from "../../api/services/userService";

import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import { message, Pagination, Modal } from "antd";
import FilterDropdown from "./FilterDropdown";

const InnerCircle = () => {
    const [searchParams] = useSearchParams();
    const itemsPerPage = 12;
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("innerCircleTab") || "list"
    );
    const { user, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    // Yuklash holatini birlashtirish
    const isLoading = authLoading || dataLoading;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // filter tanlanganda qayta fetch qilish
    const handleFilter = (deptId) => {
        setSelectedDepartment(deptId);
        fetchEmployees(1, deptId);
    };


    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async (page = 1, departmentId = null) => {
        setLoading(true);
        try {
            const res = await getEmployees(page, departmentId); // service department bo‘yicha filtrlanadi
            setEmployees(res.results || []);
            setTotalEmployees(res.count || 0);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get("page_num") || "1", 10);
        fetchEmployees(pageFromUrl);
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(searchParams);
        params.set("page_num", newPage);
        navigate(`?${params.toString()}`, { replace: true });
        fetchEmployees(newPage);
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Delete modalni ochish
    const showDeleteModal = (id) => {
        setSelectedId(id);
        setIsDeleteModalOpen(true);
    };

    // Bekor qilish
    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setSelectedId(null);
    };

    // Tasdiqlash
    const handleConfirmDelete = async () => {
        if (!selectedId) return;

        try {
            setLoading(true);
            await deleteUser(selectedId); // service endpoint chaqiriladi
            message.success("Employee deleted successfully");
            fetchEmployees(); // listni yangilash
        } catch (err) {
            console.error("Delete error details:", {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers,
            });
            message.error(
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Failed to delete employee"
            );
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedId(null);
        }
    };

    const handleAddEmployee = async (employeeData) => {
        try {
            const form = new FormData();
            form.append("first_name", employeeData.first_name);
            form.append("last_name", employeeData.last_name);
            form.append("email", employeeData.email);
            form.append("password", employeeData.password);
            form.append("password1", employeeData.password1);

            if (employeeData.department) {
                form.append("department_id", employeeData.department);
            }
            if (employeeData.profession)
                form.append("profession", employeeData.profession);
            if (employeeData.phone_number)
                form.append("phone_number", employeeData.phone_number);
            if (employeeData.tg_username)
                form.append("tg_username", employeeData.tg_username);
            if (employeeData.profession) {
                form.append("profession", employeeData.profession);
            }
            if (employeeData.level) {
                form.append("level", employeeData.level);
            }
            if (employeeData.role) form.append("role", employeeData.role);
            if (employeeData.address) form.append("address", employeeData.address);
            if (employeeData.profile_picture) {
                form.set(
                    "profile_picture",
                    employeeData.profile_picture,
                    employeeData.profile_picture.name
                );
            }

            if (employeeData.birth_date) {
                if (employeeData.birth_date instanceof Date) {
                    form.append(
                        "birth_date",
                        employeeData.birth_date.toISOString().split("T")[0]
                    );
                } else if (typeof employeeData.birth_date === "string") {
                    form.append("birth_date", employeeData.birth_date);
                }
            }

            await createEmployees(form);
            message.success("Employee added successfully");
            setIsAddModalOpen(false);
            fetchEmployees();
            const response = await createEmployees(form);
            console.log("API Response:", response.data);  // API javobini ko'rish
            message.success("Employee added successfully");
        } catch (err) {
            console.error("Full error:", err);
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.detail ||
                "Failed to add employee";

            if (err.response?.data?.errors) {
                const errors = Object.entries(err.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                    .join("\n");
                message.error(`Validation errors:\n${errors}`);
            } else {
                message.error(errorMessage);
            }
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        localStorage.setItem("innerCircleTab", tab);
    };

    useEffect(() => {
        if (!authLoading) {
            fetchEmployees().finally(() => setDataLoading(false));
        }
    }, [authLoading]);

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
        <div className="w-full max-w-screen-xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 mb-6 gap-4">
                <h1 className="text-[#1F2937] font-bold text-2xl sm:text-3xl xl:text-4xl text-center md:text-left">
                    Inner Circle ({employees.length})
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
                    {/* Filter button */}
                    <div className="flex items-center gap-3">
                        <FilterDropdown onFilter={handleFilter} />
                    </div>
                    <Permission anyOf={[ROLES.EMPLOYEE, ROLES.HEADS]}>
                        <div className="flex justify-center lg:justify-end w-[240px]"></div>
                    </Permission>

                    {/* Add Button */}
                    <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
                        {!loading && (
                            <div className="flex justify-center lg:justify-end">
                                {/* Desktop Button - faqat lg: dan boshlab */}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="hidden lg:flex bg-[#0061fe] text-white text-sm sm:text-base rounded-2xl items-center gap-2 py-2 px-4 sm:py-3 sm:px-5 cursor-pointer shadow-xl shadow-bg-blue-300"
                                >
                                    <Plus size={18} /> <span>Add Employee</span>
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
                    onStatusUpdate={fetchEmployees}
                />
            )}

            <Modal
                title={`Are you sure you want to delete ${employees.first_name} employee?`}
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
            {activeTab === "activity" && <Activity />}

            {/* Modal */}
            <AddEmployeeModal
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
            />

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
                <Pagination
                    current={parseInt(searchParams.get("page_num") || 1)}
                    total={totalEmployees}
                    pageSize={itemsPerPage}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default InnerCircle;