import { useState, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Button, message, Modal } from 'antd';
import avatarImage from '../../assets/default-avatar.png';
import { getDepartments } from '../../api/services/departmentService';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AddEmployeeModal = ({ visible, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password1: "",
        role: "",
        department: "",
        profession: "",
        phone_number: "",
        tg_username: "",
        level: "",
        birth_date: "",
        address: "",
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [departments, setDepartments] = useState([]); // Departmentlar uchun state
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Departmentlarni yuklash
    useEffect(() => {
        const fetchDepartments = async () => {
            setLoadingDepartments(true);
            try {
                const res = await getDepartments();
                // API javobi strukturasi bo'yicha moslashtirish
                const depts = res.results || res.data || res;
                setDepartments(res.results || res.data || []);
                console.log('Departments loaded:', res.results || res.data);
            } catch (err) {
                console.error('Departments olishda xato:', err);
                message.error('Failed to load departments');
            } finally {
                setLoadingDepartments(false);
            }
        };

        if (visible && departments.length === 0) {
            fetchDepartments();
        }
    }, [visible]);

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        const selectedDept = deptId ? departments.find(d => d.id === deptId) : null;
        setFormData(prev => ({
            ...prev,
            department: deptId,
            department_name: selectedDept?.name || ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
            setAvatarFile(file);
        }
    };

    // AddEmployeeModal.js
    const handleSubmit = (e) => {
        e.preventDefault();

        // Tug'ilgan kunini to'g'ri formatga keltirish
        let formattedBirthDate = null;
        if (formData.birth_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            // Agar inputdan string kelgan bo'lsa (YYYY-MM-DD)
            if (!dateRegex.test(formData.birth_date)) {
                message.error('Iltimos, tug\'ilgan kunni "YYYY-MM-DD" formatida kiriting');
                return;
            }
            // Agar Date obyekti bo'lsa
            else if (formData.birth_date instanceof Date) {
                formattedBirthDate = formData.birth_date.toISOString().split('T')[0];
            }
        }

        const submitData = {
            ...formData,
            department: selectedDepartment ? selectedDepartment.id : null,
            profile_picture: avatarFile
        };

        onSubmit(submitData);

        // Validatsiya
        if (formData.password !== formData.password1) {
            message.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            message.error('Password must be at least 8 characters');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            message.error('Please enter a valid email address');
            return;
        }

        const requiredFields = ['first_name', 'last_name', 'email', 'password'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            message.error(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        onSubmit({ ...formData, avatarFile });
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            className="custom-modal"
        >
            <div className='px-10'>
                <h2 className="text-2xl font-semibold text-[#1F2937]">
                    Add Employee
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-[50px]">
                    {/* Left Side - Form Fields */}
                    <div className="flex-1 space-y-[19px] max-w-[464px] w-full">
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password1"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10"
                                    placeholder="Confirm Password"
                                    value={formData.password1}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                disabled={loadingDepartments}
                            >
                                <option value="">Select role</option>
                                <option value="founder">Founder</option>
                                <option value="manager">Manager</option>
                                <option value="heads">Heads</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        {/* Department select komponentini to'g'rilaymiz */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department || ''} // undefined bo'lmasligi uchun
                                onChange={handleDepartmentChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                disabled={loadingDepartments}
                            >
                                <option value="">Select department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {loadingDepartments && (
                                <span className="text-sm text-gray-500">Loading departments...</span>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Profession
                            </label>
                            <input
                                type="text"
                                name="profession"
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                value={formData.profession}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Telegram Username
                                </label>
                                <input
                                    type="text"
                                    name="tg_username"
                                    placeholder="@username"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    value={formData.tg_username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Avatar and Additional Fields */}
                    <div className="flex-1 space-y-5 max-w-[320px] w-full">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center justify-center border border-gray-300 rounded-[24px] p-6 h-[300px]">
                            <div className="w-[180px] h-[180px] bg-[#DBDBDB] rounded-full overflow-hidden flex justify-center items-center">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img src={avatarImage} alt="Default avatar" className="w-full h-full object-cover" />
                                )}
                            </div>

                            <label
                                htmlFor="avatarUpload"
                                className="cursor-pointer w-full mt-7 text-[18px] font-bold flex items-center gap-8 justify-between"
                            >
                                Upload Avatar
                                <div className="w-[48px] h-[48px] bg-[#DBDBDB] rounded-[14px] text-[#1F2937] flex justify-center items-center">
                                    <Paperclip size={24} />
                                </div>
                            </label>
                            <input
                                type="file"
                                id="avatarUpload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Birth Date
                            </label>
                            <input
                                type="date"
                                name="birth_date"
                                className="w-full border border-[#D8E0F0] rounded-[14px] px-3 py-2 mt-1"
                                value={formData.birth_date}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Level
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                            >
                                <option value="">Select level</option>
                                <option value="junior">Junior</option>
                                <option value="middle">Middle</option>
                                <option value="senior">Senior</option>
                                <option value="none">None</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end col-span-2 w-full">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="bg-[#0061FE] hover:bg-[#111827] text-white px-[40px] py-[13px] rounded-[14px] shadow-md shadow-blue-300"
                            >
                                Save Employee
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddEmployeeModal;