import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import EmployeeList from './EmployeeList';
import Activity from './activity';
import AddEmployeeModal from './AddEmployeeModal';
import { getEmployees, createEmployees, deleteEmployee } from '../../api/services/employeeService';
import { message, Pagination, Modal } from 'antd';

const InnerCircle = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageNum = parseInt(searchParams.get("page_num") || "1", 10);
    const itemsPerPage = 10;
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(localStorage.getItem("innerCircleTab") || "list");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();
    const totalPages = Math.ceil(employees.length / itemsPerPage);
    const startIndex = (pageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = employees.slice(startIndex, endIndex);
    const { confirm } = Modal;

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async (page = 1) => {
        setLoading(true);
        try {
            const res = await getEmployees(page);
            setEmployees(res.results || []);
            setTotalEmployees(res.count || 0);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page_num') || '1', 10);
        console.log('Current page from URL:', pageFromUrl);
        fetchEmployees(pageFromUrl);
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        // 1. Joriy search parametrlarini saqlab qolish
        const params = new URLSearchParams(searchParams);

        // 2. Yangi sahifa parametrini o'rnatish
        params.set('page_num', newPage);

        // 3. Navigate funksiyasi bilan URLni yangilash
        navigate(`?${params.toString()}`, { replace: true });

        // Ma'lumotlarni yangilash
        fetchEmployees(newPage);

        // 4. Debug uchun console.log
        console.log('Navigating to:', params.toString());
        console.log('URL updated to:', `?page_num=${newPage}`);
    };

    const handleDelete = async (id) => {
        confirm({
            title: 'Are you sure you want to delete this employee?',
            content: 'This action cannot be undone',
            okText: 'Yes, delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteEmployee(id);
                    message.success('Employee deleted successfully');
                    fetchEmployees(); // Ro'yxatni yangilash
                } catch (err) {
                    console.error('Delete error:', err);
                    message.error(err.response?.data?.message || 'Failed to delete employee');
                }
            }
        });
    };

    const handleAddEmployee = async (employeeData) => {
        try {
            const form = new FormData();
            // Majburiy maydonlar
            form.append('first_name', employeeData.first_name);
            form.append('last_name', employeeData.last_name);
            form.append('email', employeeData.email);
            form.append('password', employeeData.password);
            form.append('password1', employeeData.password1);

            if (employeeData.department) {
                form.append('department', employeeData.department);
            }

            // Qo'shimcha maydonlar
            if (employeeData.profession) form.append('profession', employeeData.profession);
            if (employeeData.phone_number) form.append('phone_number', employeeData.phone_number);
            if (employeeData.tg_username) form.append('tg_username', employeeData.tg_username);
            if (employeeData.level) form.append('level', employeeData.level);
            if (employeeData.role) form.append('role', employeeData.role);
            if (employeeData.address) form.append('address', employeeData.address);
            if (employeeData.profile_picture) {form.append('profile_picture', employeeData.profile_picture, employeeData.profile_picture.name);}

            // Tug'ilgan kunini to'g'ri formatda qo'shish
            if (employeeData.birth_date) {
            // Agar Date obyekti bo'lsa
            if (employeeData.birth_date instanceof Date) {
                form.append('birth_date', employeeData.birth_date.toISOString().split('T')[0]);
            }
            // Agar string bo'lsa
            else if (typeof employeeData.birth_date === 'string') {
                form.append('birth_date', employeeData.birth_date);
            }
            }


            // FormData tarkibini konsolga chiqaramiz (tekshirish uchun)
            for (let [key, value] of form.entries()) {
                console.log(`${key}:`, value);
            }

            await createEmployees(form);
            message.success('Employee added successfully');
            setIsAddModalOpen(false);
            fetchEmployees();
        } catch (err) {
            console.error('Full error:', err);
            const errorMessage = err.response?.data?.message ||
                                err.response?.data?.detail ||
                                'Failed to add employee';

            // Agar backend validation xatoliklarini yuborsa
            if (err.response?.data?.errors) {
                const errors = Object.entries(err.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
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

    if (loading) return <div className="flex justify-center items-center h-[100vh]">Loading...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-7 md:mt-1 mb-6 gap-4">
                <h1 className="text-[#1F2937] font-bold text-3xl sm:text-xl xl:text-4xl">
                    Inner Circle ({employees.length})
                </h1>

                <div className="flex items-center bg-[#DBDBDB] xl:p-[3px] rounded-4xl w-full m-auto md:w-[250px] xl:w-[350px]">
                    <button
                        onClick={() => handleTabClick("list")}
                        className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${activeTab === "list" ? "bg-[#0061fe] text-white" : "bg-[#DBDBDB] text-[#1F2937]"
                            }`}
                    >
                        List
                    </button>

                    <button
                        onClick={() => handleTabClick("activity")}
                        className={`py-[5px] xl:py-[9px] rounded-4xl w-1/2 text-[16px] font-bold transition-all duration-200 ${activeTab === "activity" ? "bg-[#0061fe] text-white" : "bg-[#DBDBDB] text-[#1F2937]"
                            }`}
                    >
                        Activity
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="hidden md:flex bg-[#0061fe] text-white text-sm lg:text-base rounded-2xl items-center gap-1 py-2 px-3 xl:py-3 xl:px-5 cursor-pointer"
                    >
                        <Plus /> Add Employee
                    </button>
                </div>
            </div>

            {activeTab === "list" && (
                <EmployeeList
                    employees={currentPageItems}
                    loading={loading}
                    onDelete={handleDelete}
                    onStatusUpdate={fetchEmployees}
                />
            )}

            {activeTab === "activity" && <Activity />}

            <AddEmployeeModal
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddEmployee}
            />

            <div className="mt-6 flex justify-center">
                <Pagination
                    current={parseInt(searchParams.get('page_num') || 1)}
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