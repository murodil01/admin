import { useState, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';
import { message, Modal, DatePicker } from 'antd';
import avatarImage from '../../assets/default-avatar.png';
import { getDepartments } from '../../api/services/departmentService';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import dayjs from 'dayjs';

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
        phone_number: "+998",
        tg_username: "@",
        level: "",
        birth_date: "",
        address: "",
    });

    const [avatar, setAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailValidation, setEmailValidation] = useState({ isValid: true, message: "" });
    const [passwordValidation, setPasswordValidation] = useState({ isValid: true, message: "" });

    const { user, isAuthenticated } = useAuth();

    const levelOptions = [
        { value: 'intern', label: 'Intern' },
        { value: 'junior', label: 'Junior' },
        { value: 'middle', label: 'Middle' },
        { value: 'senior', label: 'Senior' },
        { value: 'expert', label: 'Expert' },
        { value: 'specialist', label: 'Specialist' },
        { value: 'none', label: 'None' }
    ];

    // Reset form when modal closes
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
                phone_number: "+998",
                tg_username: "@",
                level: "",
                birth_date: "",
                address: "",
            });
            setAvatar(null);
            setAvatarFile(null);
            setSelectedDepartment(null);
            setEmailValidation({ isValid: true, message: "" });
            setPasswordValidation({ isValid: true, message: "" });
            setIsSubmitting(false);
        }
    }, [visible]);

    // Load departments
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!visible || departments.length > 0) return;

            setLoadingDepartments(true);
            try {
                const response = await getDepartments();
                const departmentsData = response.results || response.data || response;

                if (Array.isArray(departmentsData)) {
                    setDepartments(departmentsData);
                } else {
                    console.error('Invalid departments data format:', departmentsData);
                    message.error('Failed to load departments - invalid data format');
                }
            } catch (err) {
                console.error('Error loading departments:', err);
                message.error('Failed to load departments');
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, [visible, departments.length]);

    // Email validation function
    const validateEmail = async (email) => {
        if (!email) return { isValid: true, message: "" };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: "Please enter a valid email address" };
        }

        try {
            // Add your API call here to check if email exists
            // const response = await checkEmailExists(email);
            // if (response.exists) {
            //     return { isValid: false, message: "This email is already registered" };
            // }
            return { isValid: true, message: "" };
        } catch (error) {
            console.error('Email validation error:', error);
            return { isValid: true, message: "" };
        }
    };

    // Password strength validation
    const validatePassword = (password) => {
        if (!password) return { isValid: true, message: "" };

        if (password.length < 8) {
            return { isValid: false, message: "Password must be at least 8 characters long" };
        }

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

    // Phone number validation and formatting
    const validateAndFormatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber || phoneNumber === "+998") {
            return { isValid: true, formatted: "+998", message: "" };
        }

        // Remove all non-digits except the leading +998
        let cleaned = phoneNumber.replace(/[^\d]/g, "");

        // Ensure it starts with 998
        if (!cleaned.startsWith("998")) {
            return { isValid: false, formatted: phoneNumber, message: "Phone number must start with +998" };
        }

        // Remove leading 998 to get the rest of the number
        const restOfNumber = cleaned.substring(3);

        // Validate Uzbek phone number format (should be 9 digits after 998)
        if (restOfNumber.length !== 9) {
            return {
                isValid: false,
                formatted: phoneNumber,
                message: "Phone number must be 12 digits total (+998XXXXXXXXX)"
            };
        }

        // Check if it starts with valid Uzbek mobile prefixes
        const validPrefixes = ['20', '33', '50', '55', '61', '62', '65', '66', '67', '69',
            '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
            '87', '88', '90', '91', '93', '94', '95', '97', '98', '99'];
        const prefix = restOfNumber.substring(0, 2);

        if (!validPrefixes.includes(prefix)) {
            return {
                isValid: false,
                formatted: phoneNumber,
                message: "Invalid Uzbek mobile number prefix"
            };
        }

        return {
            isValid: true,
            formatted: `+998${restOfNumber}`,
            message: ""
        };
    };

    // Telegram username validation
    const validateTelegramUsername = (username) => {
        if (!username || username === "@") {
            return { isValid: true, formatted: "@", message: "" };
        }

        // Ensure it starts with @
        let formatted = username.startsWith('@') ? username : `@${username}`;

        // Remove @ for validation
        const usernameWithoutAt = formatted.substring(1);

        // Telegram username rules:
        // - 5-32 characters
        // - Can contain a-z, A-Z, 0-9, and underscores
        // - Must start with a letter
        // - Cannot end with underscore
        // - Cannot have two consecutive underscores

        if (usernameWithoutAt.length < 5 || usernameWithoutAt.length > 32) {
            return {
                isValid: false,
                formatted,
                message: "Telegram username must be 5-32 characters long"
            };
        }

        if (!/^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$/.test(usernameWithoutAt)) {
            return {
                isValid: false,
                formatted,
                message: "Invalid Telegram username format"
            };
        }

        if (/__/.test(usernameWithoutAt)) {
            return {
                isValid: false,
                formatted,
                message: "Telegram username cannot contain consecutive underscores"
            };
        }

        return { isValid: true, formatted, message: "" };
    };

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        const selectedDept = deptId ? departments.find(d => d.id.toString() === deptId) : null;

        setFormData(prev => ({
            ...prev,
            department: deptId,
            department_name: selectedDept?.name || ''
        }));
        setSelectedDepartment(selectedDept);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone_number') {
            // Ensure +998 prefix is always present
            let formattedValue = value;
            if (!value.startsWith('+998')) {
                if (value.startsWith('+')) {
                    formattedValue = '+998' + value.substring(1);
                } else if (value.startsWith('998')) {
                    formattedValue = '+' + value;
                } else {
                    formattedValue = '+998' + value.replace(/^\+?998?/, '');
                }
            }
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else if (name === 'tg_username') {
            // Ensure @ prefix is always present
            let formattedValue = value.startsWith('@') ? value : '@' + value;
            setFormData(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear validations when user types
        if (name === 'email') {
            setEmailValidation({ isValid: true, message: "" });
        } else if (name === 'password') {
            setPasswordValidation({ isValid: true, message: "" });
        }
    };

    const handleDateChange = (date, dateString) => {
        setFormData(prev => ({
            ...prev,
            birth_date: dateString
        }));
    };

    const handleEmailBlur = async (e) => {
        const email = e.target.value;
        if (email) {
            const validation = await validateEmail(email);
            setEmailValidation(validation);
        }
    };

    const handlePasswordBlur = (e) => {
        const password = e.target.value;
        if (password) {
            const validation = validatePassword(password);
            setPasswordValidation(validation);
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
            const requiredFields = {
                first_name: 'First Name',
                last_name: 'Last Name',
                email: 'Email',
                password: 'Password',
                role: 'Role',
                level: 'Level'
            };

            // Department is required only for non-founder/manager roles
            if (!['founder', 'manager'].includes(formData.role)) {
                requiredFields.department = 'Department';
            }

            for (const [field, label] of Object.entries(requiredFields)) {
                if (!formData[field] || formData[field].trim() === '') {
                    message.error(`${label} is required`);
                    return;
                }
            }

            // Validate email
            const emailValidationResult = await validateEmail(formData.email);
            if (!emailValidationResult.isValid) {
                message.error(emailValidationResult.message);
                setEmailValidation(emailValidationResult);
                return;
            }

            // Validate password strength
            const passwordValidationResult = validatePassword(formData.password);
            if (!passwordValidationResult.isValid) {
                message.error(passwordValidationResult.message);
                setPasswordValidation(passwordValidationResult);
                return;
            }

            // Validate password match
            if (formData.password !== formData.password1) {
                message.error('Passwords do not match');
                return;
            }

            // Validate birth date
            if (formData.birth_date) {
                const birthDate = new Date(formData.birth_date);
                const today = new Date();

                if (isNaN(birthDate.getTime())) {
                    message.error('Please enter a valid birth date');
                    return;
                }

                if (birthDate >= today) {
                    message.error('Birth date must be in the past');
                    return;
                }

                // Check if person is at least 16 years old
                const sixteenYearsAgo = new Date();
                sixteenYearsAgo.setFullYear(today.getFullYear() - 16);

                if (birthDate > sixteenYearsAgo) {
                    message.error('Member must be at least 16 years old');
                    return;
                }
            }

            // Validate and format phone number
            if (formData.phone_number && formData.phone_number !== '+998') {
                const phoneValidation = validateAndFormatPhoneNumber(formData.phone_number);
                if (!phoneValidation.isValid) {
                    message.error(phoneValidation.message);
                    return;
                }
                setFormData(prev => ({ ...prev, phone_number: phoneValidation.formatted }));
            }

            // Validate Telegram username
            if (formData.tg_username && formData.tg_username !== '@') {
                const tgValidation = validateTelegramUsername(formData.tg_username);
                if (!tgValidation.isValid) {
                    message.error(tgValidation.message);
                    return;
                }
                setFormData(prev => ({ ...prev, tg_username: tgValidation.formatted }));
            }

            // Prepare submit data
            const submitData = {
                ...formData,
                department: selectedDepartment ? selectedDepartment.id : formData.department,
                phone_number: formData.phone_number === '+998' ? '' : formData.phone_number,
                tg_username: formData.tg_username === '@' ? '' : formData.tg_username,
                profile_picture: avatarFile
            };

            // Call parent submit function
            await onSubmit(submitData);
            onClose();

        } catch (error) {
            console.error('Submit error:', error);

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
                message.error('Failed to add member. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return <div>Please login</div>;
    }

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
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
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
                                    className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
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
                                className={`w-full border rounded-[14px] px-3 py-2 mt-1 focus:outline-none ${emailValidation.isValid
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
                            {!emailValidation.isValid && (
                                <p className="text-red-500 text-sm mt-1">{emailValidation.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`w-full border rounded-[14px] px-3 py-2 mt-1 pr-10 focus:outline-none ${passwordValidation.isValid
                                            ? 'border-[#DBDBDB] focus:border-blue-500'
                                            : 'border-red-500'
                                        }`}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handlePasswordBlur}
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
                            {!passwordValidation.isValid && (
                                <p className="text-red-500 text-sm mt-1">{passwordValidation.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Confirm Password *
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
                                <option value="employee">Member</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Department {!['founder', 'manager'].includes(formData.role) && '*'}
                            </label>
                            <select
                                name="department"
                                value={formData.department || ''}
                                onChange={handleDepartmentChange}
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
                                disabled={loadingDepartments || isSubmitting}
                                required={!['founder', 'manager'].includes(formData.role)}
                            >
                                <option value="">
                                    {['founder', 'manager'].includes(formData.role)
                                        ? 'Select department (optional)'
                                        : 'Select department'
                                    }
                                </option>
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
                                placeholder="Enter profession"
                                value={formData.profession}
                                onChange={handleChange}
                                disabled={isSubmitting}
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
                                    placeholder="+998XXXXXXXXX"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                    <img
                                        src={avatarImage}
                                        alt="Default avatar"
                                        className="w-full h-full object-cover"
                                    />
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date of birth
                            </label>
                            <DatePicker
                                className="w-full"
                                value={formData.birth_date ? dayjs(formData.birth_date) : null}
                                onChange={handleDateChange}
                                format="YYYY-MM-DD"
                                placeholder="Select birth date"
                                disabled={isSubmitting}
                                disabledDate={(current) => {
                                    // Disable future dates
                                    if (current && current > dayjs().endOf('day')) {
                                        return true;
                                    }
                                    // Disable dates more than 100 years ago
                                    if (current && current < dayjs().subtract(100, 'year')) {
                                        return true;
                                    }
                                    return false;
                                }}
                                style={{
                                    height: '40px',
                                    borderRadius: '14px',
                                    border: '1px solid #DBDBDB',
                                    marginTop: '4px',
                                }}
                            />
                        </div>

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

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <input
                                name="address"
                                className="w-full border border-[#DBDBDB] rounded-[14px] px-3 py-2 mt-1 focus:outline-none focus:border-blue-500 resize-none"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end w-full">
                            <button
                                type="submit"
                                disabled={isSubmitting || !emailValidation.isValid || !passwordValidation.isValid}
                                className={`px-[40px] py-[13px] rounded-[14px] shadow-md text-white font-medium ${isSubmitting || !emailValidation.isValid || !passwordValidation.isValid
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