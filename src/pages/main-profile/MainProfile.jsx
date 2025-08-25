import { FiEdit3 } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  message,
  Card,
  Avatar,
  Skeleton,
  Tag,
  Upload,
  Input,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LogoutOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { getMyProfile, updateMyProfile } from "../../api/services/profileService";
import { Divider } from "antd";
import { Grid } from "antd";
const { useBreakpoint } = Grid;
import useTokenManager from "../../hooks/useTokenManager";
import TokenExpiredScreen from "../../components/TokenExpiredScreen";

const MainProfile = () => {
  const [user, setUser] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenExpiredSection, setTokenExpiredSection] = useState(false);

  const screens = useBreakpoint();

  let size = 80; // default
  if (screens.sm) size = 100;
  if (screens.md) size = 100;
  if (screens.lg) size = 120;

  const navigate = useNavigate();
  const { tokenExpired, redirecting, checkApiError } = useTokenManager();

  // Token tekshirish funksiyasi
  const checkTokenExpiration = (error) => {
    if (error.response && error.response.status === 401) {
      setTokenExpiredSection(true);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      // 2 soniyadan keyin login page'ga yo'naltirish
      setTimeout(() => {
        message.error("Session expired. Please login again.");
        navigate("/login");
      }, 2000);

      return true;
    }
    return false;
  };

  // Add this in useEffect to debug token contents
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", payload);
        console.log("User role in token:", payload.role);
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (tokenExpired || redirecting) return;

      try {
        setLoading(true);
        const data = await getMyProfile();
        console.log("Profile data received:", data);

        setUser({
          ...data,
          profile_picture_preview: data.profile_picture || null,
        });
        setBirthday(data.birth_date || "");
      } catch (error) {
        console.error("Full error object:", error); // Add detailed error logging
        console.error("Error response:", error.response); // Check the actual response

        if (!checkTokenExpiration(error)) {
          message.error(`Error fetching user data: ${error.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [tokenExpired, redirecting, checkApiError]);

  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || tokenExpired || redirecting) return;

    try {
      setUpdating(true);

      const updateData = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        tg_username: user.tg_username,
      };

      if (birthday) {
        updateData.birth_date = dayjs(birthday).format("YYYY-MM-DD");
      }

      if (changePassword) {
        if (!user.password || !user.password1) {
          message.error("Please fill out both password fields.");
          return;
        }
        if (user.password !== user.password1) {
          message.error("New password and confirmation do not match.");
          return;
        }
        updateData.password = user.password;
        updateData.password1 = user.password1;
      }

      if (user.profile_picture instanceof File) {
        updateData.profile_picture = user.profile_picture;
      }

      const updatedUser = await updateMyProfile(updateData);

      setUser({
        ...updatedUser,
        profile_picture_preview: updatedUser.profile_picture || user.profile_picture_preview || null,
      });
      setIsEditing(false);
      setChangePassword(false);
      message.success("Profile updated successfully");
    } catch (error) {
      if (!checkApiError(error)) {
        message.error("Error during saving");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Token muddatini tekshirish
  const checkTokenValidity = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setTokenExpiredSection(true);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        setTokenExpiredSection(true);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // 2 soniyadan keyin login page'ga yo'naltirish
        setTimeout(() => {
          message.error("Session expired. Please login again.");
          navigate("/login");
        }, 2000);

        return false;
      }

      // Token eskirishiga 5 minut qolganida ogohlantirish
      const timeLeft = expirationTime - currentTime;
      const minutesLeft = Math.floor(timeLeft / 60000);

      if (minutesLeft < 5) {
        message.warning(`Your session will expire in ${minutesLeft} minutes. Please save your work.`);
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenExpiredSection(true);
      return false;
    }
  };

  // Har 30 soniyada tokenni tekshirish
  useEffect(() => {
    checkTokenValidity();

    const interval = setInterval(checkTokenValidity, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (tokenExpired) {

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="text-center py-10">
          <div className="text-xl text-gray-600 mb-4">Your session has expired</div>
          <div className="text-lg mb-6">Redirecting to login page...</div>
          <Button type="primary" onClick={() => navigate("/login")}>
            Go to Login Now
          </Button>
        </Card>
      </div>
    );
  }

  // Token eskirgan bo'lsa qizil ekran
  if (tokenExpired || redirecting) {
    return <TokenExpiredScreen />;
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <div className="text-center py-8">User data not found</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto rounded-2xl shadow-md bg-white m-10 space-y-10">
      <div className="flex flex-col gap-10 mt-3">
        {/* Top User Card */}
        <div className="relative rounded-2xl">
          {/* Edit Button */}
          {!isEditing && (
            <div className="absolute -top-4 right-0">
              {/* 📱 Mobile: faqat icon */}
              <button
                onClick={() => setIsEditing(true)}
                className="md:hidden p-2 rounded-md shadow-md hover:shadow-lg bg-[#0048FF] text-white flex items-center justify-center"
              >
                <FiEdit3 size={18} />
              </button>

              {/* 💻 Desktop: icon + text */}
              <button
                onClick={() => setIsEditing(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg bg-[#0048FF] text-white cursor-pointer"
              >
                <FiEdit3 size={18} /> Edit Profile
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex items-center gap-4 md:gap-6 mt-5">
            {/* Avatar with upload */}
            <div className="relative">
              <Avatar
                size={size}
                src={user.profile_picture_preview || user.profile_picture}
                icon={<UserOutlined />}
                className="ring-2 sm:ring-4 ring-indigo-100 shadow-lg"
              />
              {isEditing && (
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const preview = URL.createObjectURL(file);
                    setUser((prev) => ({
                      ...prev,
                      profile_picture_preview: preview,
                      profile_picture: file,
                    }));
                    return false;
                  }}
                >
                  <button
                    className="absolute -bottom-3 right-6 sm:-bottom-4 sm:right-12
                            bg-white shadow-md rounded-full flex items-center justify-center
                              w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] cursor-pointer"
                  >
                    <CameraOutlined className="text-gray-600 text-base sm:text-lg" />
                  </button>
                </Upload>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-2 sm:text-left w-full">
              {/* First Name */}
              {isEditing ? (
                <div className="flex items-center flex-col gap-2 md:flex-row">
                  <input
                    value={user.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="border py-1 rounded-lg border-gray-300 px-2 overflow-none focus:!shadow-none focus:!outline-none placeholder:text-[14px]"
                    placeholder="Please enter your first name"
                  />

                  <input
                    value={user.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="border py-1 rounded-lg border-gray-300 px-2 overflow-none focus:!shadow-none focus:!outline-none placeholder:text-[14px]"
                    placeholder="Please enter your last name"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-start">
                  <h2 className="text-[16px] font-bold md:text-[20px]">{user.first_name}</h2>
                  <h2 className="text-[16px] font-bold md:text-[20px]">{user.last_name}</h2>
                </div>
              )}
              <span className="text-gray-500 text-xs sm:text-sm">
                {user.profession || "No profession"}
              </span>
              <div className="flex flex-wrap gap-2">
                <Tag color="blue" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 capitalize">
                  {user.role}
                </Tag>
                {user.level && user.level !== "none" && (
                  <Tag color="purple" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 capitalize">
                    {user.level}
                  </Tag>
                )}
                <Tag color="green" className="rounded-full text-xs sm:text-sm px-2 sm:px-3 capitalize">
                  {user.status}
                </Tag>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">

          {/* Left section */}
          <div className="flex flex-col gap-5">
            <div className="">
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      value={user.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Please enter your email"
                    />
                  ) : (
                    <input
                      value={user.email || "Not provided"}
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      value={user.phone_number || "+998"}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Please enter your phone number"
                    />
                  ) : (
                    <input
                      value={user.phone_number || "Not provided"}
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Date of birth</label>
                  {isEditing ? (
                    <DatePicker
                      className="w-full calendar h-[49.6px]"
                      value={birthday ? dayjs(birthday) : null}
                      onChange={(date, dateString) => setBirthday(dateString)}
                      format="YYYY-MM-DD"
                    />
                  ) : (
                    <input
                      value={birthday ? dayjs(birthday).format("DD.MM.YYYY") : "Not provided"}
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Department</label>
                  <input
                    value={user.department?.name || "Not provided"}
                    readOnly
                    className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div>
            <div className="">
              <div className="space-y-4">
                {/* Telegram */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Telegram Username</label>
                  {isEditing ? (
                    <input
                      value={user.tg_username || "@"}
                      onChange={(e) => handleInputChange("tg_username", e.target.value)}
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Please enter your telegram username"
                    />
                  ) : (
                    <input
                      value={user.tg_username ? `${user.tg_username}` : "Not provided"}
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <input
                      value={user.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                      placeholder="Please enter your address"
                      rows={3}
                    />
                  ) : (
                    <input
                      value={user.address || "Not provided"}
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                      rows={3}
                    />
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Password</label>

                  {isEditing ? (
                    <div className="flex flex-col gap-4">
                      {/* Current Password - only show when changing password */}
                      {/* {changePassword && (
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={user.password || ""}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                            placeholder="Enter your current password"
                          />
                          <span
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                          >
                            {showCurrentPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                          </span>
                        </div>
                      )} */}

                      {/* New Password */}
                      {changePassword ? (
                        <>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={user.password || ""}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                              placeholder="Enter your new password"
                            />
                            <span
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                              {showNewPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            </span>
                          </div>

                          {/* Confirm Password */}
                          <div className="relative">
                            <label className="block text-sm text-gray-500 mb-1">Confirm password</label>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={user.password1 || ""}
                              onChange={(e) => handleInputChange("password1", e.target.value)}
                              className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                              placeholder="Confirm your new password"
                            />
                            <span
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                              {showConfirmPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            </span>
                          </div>

                          <Button type="link" danger onClick={() => setChangePassword(false)}>
                            Cancel Password Change
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={user.password || ""}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
                            />
                            <span
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                            >
                              {showCurrentPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            </span>
                          </div>
                          <Button type="link" onClick={() => setChangePassword(true)}>
                            Change Password
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    // View Mode (not editing) - Always show password field
                    <div className="relative">
                      <input
                        type="password"
                        value="••••••••"
                        readOnly
                        className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showCurrentPassword}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
        </div>
        {/* Save / Cancel buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSave}
              loading={updating}
              className="bg-[#0048FF] max-w-[155px] w-full py-3 text-white hover:opacity-90 rounded-lg shadow-md shadow-blue-200"
            >
              Save
            </button>
            <button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsEditing(false);
                setChangePassword(false);
              }}
              disabled={updating}
              className="bg-[#EFEFEF] max-w-[155px] w-full py-3 text-[#313131] hover:opacity-90 rounded-lg shadow-md shadow-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainProfile;