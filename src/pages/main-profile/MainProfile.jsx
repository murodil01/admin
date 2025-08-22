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
  Input
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
import useTokenManager from "../../hooks/useTokenManager";
import TokenExpiredScreen from "../../components/TokenExpiredScreen";

const MainProfile = () => {
  const [user, setUser] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const navigate = useNavigate();
  const { tokenExpired, redirecting, checkApiError } = useTokenManager();

  // User ma'lumotlarini olish
  useEffect(() => {
    const fetchUser = async () => {
      if (tokenExpired || redirecting) return;
      
      try {
        setLoading(true);
        const data = await getMyProfile();
        setUser({
          ...data,
          profile_picture_preview: data.profile_picture || null,
        });
        setBirthday(data.birth_date || "");
      } catch (error) {
        if (!checkApiError(error)) {
          message.error("Error fetching user data");
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
        birth_date: birthday ? dayjs(birthday).format("YYYY-MM-DD") : null,
        address: user.address,
        tg_username: user.tg_username,
      };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    message.success("Logged out successfully");
    window.location.href = "/login";
  };

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
    <div className="p-6 max-w-3xl mx-auto rounded-2xl shadow-md bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <Button 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          className="flex items-center"
        >
          Logout
        </Button>
      </div>
      
      <div>
        {/* Top User Card */}
        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-white shadow-md rounded-2xl">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Avatar with upload */}
            <div className="relative">
              <Avatar
                size={120}
                src={user.profile_picture_preview || user.profile_picture}
                icon={<UserOutlined />}
                className="ring-4 ring-indigo-100 shadow-lg"
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
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    className="absolute bottom-2 right-2 bg-white shadow-md"
                  />
                </Upload>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              {isEditing ? (
                <div className="flex gap-3">
                  <Input
                    size="large"
                    className="rounded-lg"
                    value={user.first_name || ""}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    placeholder="First Name"
                  />
                  <Input
                    size="large"
                    className="rounded-lg"
                    value={user.last_name || ""}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.first_name} {user.last_name}
                </h2>
              )}

              {/* Extra Info */}
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-gray-500 text-sm">
                  {user.profession || "No profession"}
                </span>
                <Tag color="blue" className="rounded-full text-sm px-3">
                  {user.role || "User"}
                </Tag>
                {user.level && user.level !== "none" && (
                  <Tag color="purple" className="rounded-full text-sm px-3">
                    {user.level}
                  </Tag>
                )}
                <Tag color="green" className="rounded-full text-sm px-3">
                  {user.status || "Active"}
                </Tag>
              </div>
            </div>
          </div>

          {/* Right Section - Edit Button */}
          <div className="mt-6 md:mt-0">
            {!isEditing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                size="large"
                className="rounded-xl px-6 shadow-md hover:shadow-lg"
              >
                Edit Profile
              </Button>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6 mt-6">
          {/* Contact Info */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                {isEditing ? (
                  <Input
                    value={user.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Input
                    value={user.email || "Not provided"}
                    readOnly
                    className="w-full"
                  />
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                {isEditing ? (
                  <Input
                    value={user.phone_number || ""}
                    onChange={(e) => handleInputChange("phone_number", e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Input
                    value={user.phone_number || "Not provided"}
                    readOnly
                    className="w-full"
                  />
                )}
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Birthday</label>
                {isEditing ? (
                  <DatePicker
                    className="w-full"
                    value={birthday ? dayjs(birthday) : null}
                    onChange={(date, dateString) => setBirthday(dateString)}
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <Input
                    value={birthday ? dayjs(birthday).format("DD.MM.YYYY") : "Not provided"}
                    readOnly
                    className="w-full"
                  />
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Department</label>
                <Input
                  value={user.department?.name || "Not provided"}
                  readOnly
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Additional Information</h3>
            <div className="space-y-4">
              {/* Telegram */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Telegram Username</label>
                {isEditing ? (
                  <Input
                    value={user.tg_username || ""}
                    onChange={(e) => handleInputChange("tg_username", e.target.value)}
                    className="w-full"
                    addonBefore="@"
                  />
                ) : (
                  <Input
                    value={user.tg_username ? `@${user.tg_username}` : "Not provided"}
                    readOnly
                    className="w-full"
                  />
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Address</label>
                {isEditing ? (
                  <Input.TextArea
                    value={user.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                ) : (
                  <Input.TextArea
                    value={user.address || "Not provided"}
                    readOnly
                    className="w-full"
                    rows={3}
                  />
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Password</label>
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    {!changePassword ? (
                      <div>
                        <Input value="••••••••" readOnly className="w-full" />
                        <Button type="link" onClick={() => setChangePassword(true)}>
                          Change Password
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input.Password
                          placeholder="New Password"
                          value={user.password || ""}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="w-full"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                        <Input.Password
                          placeholder="Confirm Password"
                          value={user.password1 || ""}
                          onChange={(e) => handleInputChange("password1", e.target.value)}
                          className="w-full"
                          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                        <Button type="link" danger onClick={() => setChangePassword(false)}>
                          Cancel Password Change
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <Input value="••••••••" readOnly className="w-full" />
                )}
              </div>

              {/* Created At */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Account Created</label>
                <Input
                  value={dayjs(user.created_at).format("DD.MM.YYYY HH:mm")}
                  readOnly
                  className="w-full"
                />
              </div>
              
              {/* Save / Cancel buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setIsEditing(false);
                      setChangePassword(false);
                    }}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={updating}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;