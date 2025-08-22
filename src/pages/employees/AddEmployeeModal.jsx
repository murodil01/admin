import { useState, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';
import { message, Modal } from 'antd';
import avatarImage from '../../assets/default-avatar.png';
import { getDepartments } from '../../api/services/departmentService';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailValidation, setEmailValidation] = useState({ isValid: true, message: "" });

    const { user, isAuthenticated } = useAuth();

    const levelOptions = [
        { value: 'intern', label: 'Intern' },
        { value: 'junior', label: 'Junior' },
        { value: 'middle', label: 'Middle' },
        { value: 'senior', label: 'Senior' },
        { value: 'expert', label: 'Expert' },
        { value: 'specialist', label: 'Specialist' },
        { value: '', label: 'None' }
    ]

    useEffect(() => {
        if (!visible) {
            setFormData({
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
            setAvatar(null);
            setAvatarFile(null);
            setSelectedDepartment(null);
            setEmailValidation({ isValid: true, message: "" });
            setIsSubmitting(false);
        }
    }, [visible]);

    // Departmentlarni yuklash
    useEffect(() => {
        const fetchDepartments = async () => {
            setLoadingDepartments(true);
            try {
                const response = await getDepartments();
                // Check different possible response structures
                const departmentsData = response.results || response.data || response;

                if (Array.isArray(departmentsData)) {
                    setDepartments(departmentsData);
                } else {
                    message.error('Failed to load departments - invalid data format');
                }
            } catch (err) {
                message.error('Failed to load departments');
            } finally {
                setLoadingDepartments(false);
            }
        };

        if (visible && departments.length === 0) {
            fetchDepartments();
        }
    }, [visible, departments.length]);

    // Email validation function (you can customize this based on your API)
    const validateEmail = async (email) => {
        if (!email) return { isValid: true, message: "" };

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: "Please enter a valid email address" };
        }

        // You can add API call here to check if email exists
        try {
            // Example API call (replace with your actual endpoint)
            // const response = await checkEmailExists(email);
            // if (response.exists) {
            //     return { isValid: false, message: "This email is already registered" };
            // }

            return { isValid: true, message: "" };
        } catch (error) {
            console.error('Email validation error:', error);
            return { isValid: true, message: "" }; // Allow submission if validation fails
        }
    };

    // Password strength validation
    const validatePassword = (password) => {
        if (!password) return { isValid: true, message: "" };

        if (password.length < 8) {
            return { isValid: false, message: "Password must be at least 8 characters long" };
        }

        // Add more password rules as needed
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return {
                isValid: false,
                message: "Password must contain uppercase, lowercase, and numbers"
            };
        }

        return { isValid: true, message: "" };
    };

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        const selectedDept = deptId ? departments.find(d => d.id === deptId) : null;
        setFormData(prev => ({
            ...prev,
            department: deptId,
            department_name: selectedDept?.name || ''
        }));
        setSelectedDepartment(selectedDept);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear email validation when user types
        if (name === 'email') {
            setEmailValidation({ isValid: true, message: "" });
        }
    };

    // Email blur validation
    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (email) {
            const validation = await validateEmail(email);
            setEmailValidation(validation);
        }
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                message.error('Avatar file size must be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                message.error('Please upload a valid image file');
                return;
            }

            setAvatar(URL.createObjectURL(file));
            setAvatarFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
                message.error('Please fill in all required fields');
                return;
            }

            // Validate email
            const emailValidationResult = await validateEmail(formData.email);
            if (!emailValidationResult.isValid) {
                message.error(emailValidationResult.message);
                setEmailValidation(emailValidationResult);
                return;
            }

            // Validate password strength
            const passwordValidation = validatePassword(formData.password);
            if (!passwordValidation.isValid) {
                message.error(passwordValidation.message);
                return;
            }

            // Validate password match
            if (formData.password !== formData.password1) {
                message.error('Passwords do not match');
                return;
            }

            // Validate birth date
            if (formData.birth_date) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(formData.birth_date)) {
                    message.error('Please enter birth date in YYYY-MM-DD format');
                    return;
                }

                // Check if birth date is not in the future
                const birthDate = new Date(formData.birth_date);
                const today = new Date();
                if (birthDate > today) {
                    message.error('Birth date cannot be in the future');
                    return;
                }
            }

            // Validate and normalize phone number if provided
            if (formData.phone_number?.trim()) {
                const raw = formData.phone_number.trim();

                // Extract only digits from the phone number
                const digits = raw.replace(/\D/g, ""); // remove all non-digits

                // Check if we have 10-15 digits (international E.164 standard)
                if (digits.length < 10 || digits.length > 15) {
                    message.error("Phone number must have 10–15 digits");
                    return;
                }

                // Normalize: always add '+' prefix with digits only
                setFormData(prev => ({
                    ...prev,
                    phone_number: `+${digits}`
                }));
            }

            // Validate Telegram username format
            if (formData.tg_username && !formData.tg_username.startsWith('@')) {
                setFormData(prev => ({
                    ...prev,
                    tg_username: `@${formData.tg_username}`
                }));
            }

            // Prepare submit data
            const submitData = {
                ...formData,
                department: selectedDepartment ? selectedDepartment.id : null,
                profile_picture: avatarFile
            };

            console.log("Submitting data to parent:", submitData);

            // Call parent submit function
            await onSubmit(submitData);

            // Show success message
            message.success('Employee added successfully!');

            // Close modal after successful submission
            onClose();

        } catch (error) {
            console.error('Submit error:', error);

            // Handle specific error types
            if (error.response?.status === 400) {
                const errorData = error.response.data;

                if (errorData.email) {
                    message.error('This email is already registered');
                    setEmailValidation({ isValid: false, message: "This email is already registered" });
                } else if (errorData.phone_number) {
                    message.error('This phone number is already registered');
                } else if (errorData.tg_username) {
                    message.error('This Telegram username is already registered');
                } else {
                    message.error('Please check your input data');
                }
            } else if (error.response?.status === 409) {
                message.error('User with this email already exists');
                setEmailValidation({ isValid: false, message: "This email is already registered" });
            } else {
                message.error('Failed to add employee. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return <div>Please login</div>;

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width="100%"
            style={{ maxWidth: 900 }}
            centered
            className="custom-modal"
        >
            <div className='px-10 sm:px-6 lg:px-10'>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1F2937] mb-6">
                    Add Member
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Form Fields */}
                    <div className="flex-1 space-y-4">
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={`w-full border rounded-[14px] px-3 py-2 mt-1 focus:outline-none ${
                                    emailValidation.isValid
                                        ? 'border-[#DBDBDB] focus:border-blue-500'
                                        : 'border-red-500'
                                }`}
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleEmailBlur}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10 focus:outline-none focus:border-blue-500"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                    disabled={isSubmitting}
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
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 pr-10 focus:outline-none focus:border-blue-500"
                                    placeholder="Confirm Password"
                                    value={formData.password1}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                    disabled={isSubmitting}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Role *
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                disabled={loadingDepartments || isSubmitting}
                                required
                            >
                                <option value="">Select role</option>
                                <Permission anyOf={[ROLES.FOUNDER]}>
                                    <option value="founder">Founder</option>
                                    <option value="manager">Manager</option>
                                </Permission>
                                <option value="heads">Chief Officer</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>

                        {/* Department select komponentini to'g'rilaymiz */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Department *
                            </label>
                            <select
                                name="department"
                                value={formData.department || ''}
                                onChange={handleDepartmentChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                disabled={loadingDepartments || isSubmitting}
                                required
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
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
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
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
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
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                    value={formData.tg_username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Avatar and Additional Fields */}
                    <div className="flex flex-col space-y-4 max-w-[320px] w-full">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center justify-center border border-gray-300 rounded-[24px] p-6 h-[300px]">
                            <div className="w-[180px] h-[200px] bg-[#DBDBDB] rounded-full overflow-hidden flex justify-center items-center">
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
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                value={formData.birth_date}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Level *
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select level</option>
                                {levelOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
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
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end col-span-2 w-full">
                            <button
                                type="submet"
                                disabled={isSubmitting || !emailValidation.isValid}
                                htmlType="submit"
                                className={`px-[40px] py-[13px] rounded-[14px] shadow-md text-white font-medium ${
                                    isSubmitting || !emailValidation.isValid
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#0061FE] hover:opacity-90 shadow-blue-300 cursor-pointer'
                                }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Member'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddEmployeeModal;