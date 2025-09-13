import { FiEdit3 } from "react-icons/fi";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import {
  Button,
  DatePicker,
  message,
  Card,
  Avatar,
  Skeleton,
  Tag,
  Upload,
} from "antd";
import {
  UserOutlined,
  CloseOutlined,
  CameraOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

import { getMyProfile, updateMyProfile } from "../../api/services/profileService";
import { Grid } from "antd";
const { useBreakpoint } = Grid;
import useTokenManager from "../../hooks/useTokenManager";
import TokenExpiredScreen from "../../components/TokenExpiredScreen";
import { getUserProjectsById } from "../../api/services/userProjectsService";

// Memoized ProjectCard komponenti
const ProjectCard = memo(({ project }) => {
  // Memoized date formatting function
  const formattedDate = useMemo(() => {
    if (!project?.created_at) return "Not specified";
    
    try {
      const date = new Date(project.created_at);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }, [project?.created_at]);

  // Memoized project icon
  const projectIcon = useMemo(() => {
    if (!project?.name) return null;

    const colors = [
      "bg-gradient-to-r from-yellow-400 to-yellow-500",
      "bg-gradient-to-r from-purple-500 to-purple-600",
      "bg-gradient-to-r from-blue-500 to-blue-600",
      "bg-gradient-to-r from-green-500 to-green-600",
      "bg-gradient-to-r from-red-500 to-red-600",
      "bg-gradient-to-r from-indigo-500 to-indigo-600",
    ];

    const colorIndex = project.name.length % colors.length;
    const initials = project.name
      .split(" ")
      .map((word) => word[0])
      .filter(Boolean)
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div
        className={`w-12 h-12 rounded-xl ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
      >
        {initials || "P"}
      </div>
    );
  }, [project?.name]);

  // Project validation
  if (!project) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="text-gray-500 text-center">Project data not available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] max-w-full">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 md:gap-4">
        {/* Left Section - Project Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {project.image ? (
            <img
              className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-lg object-cover shadow-md flex-shrink-0"
              src={project.image}
              alt={project.name || "Project"}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          <div 
            className="flex-shrink-0" 
            style={{ display: project.image ? 'none' : 'flex' }}
          >
            {projectIcon}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 mb-1 truncate leading-tight">
              {project.name || "Unnamed Project"}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
              <CalendarDays size={12} className="md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate">Created {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Right Section - Project Statistics */}
        <div className="flex-shrink-0 lg:ml-6">
          <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 text-center lg:text-center">
            Project Data
          </h4>

          <div className="grid grid-cols-3 gap-3 md:gap-4 lg:gap-5">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5 md:mb-1 font-medium">
                Total
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 leading-none">
                {project.all_tasks ?? 0}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5 md:mb-1 font-medium">
                Active
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-green-600 leading-none">
                {project.active_tasks ?? 0}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-0.5 md:mb-1 font-medium">
                Dropped
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-red-600 leading-none">
                {project.dropped_count ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

// Memoized Projects komponenti
const Projects = memo(() => {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 7;
  const totalCount = projects.length;

  // Memoized user ID extractor
  const getCurrentUserIdFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id || payload.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }, []);

  // Fetch projects with memoized callback
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getCurrentUserIdFromToken();
      if (!userId) {
        throw new Error("Unable to get current user ID from token");
      }

      const userData = await getUserProjectsById(userId);
      
      if (userData?.projects) {
        setProjects(userData.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Projects fetch error:", error);
      setError(error.message || "Failed to fetch projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserIdFromToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Memoized pagination data
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    return {
      totalPages,
      paginatedProjects,
      startItem: startIndex + 1,
      endItem: Math.min(endIndex, totalCount)
    };
  }, [projects, page, totalCount, itemsPerPage]);

  // Memoized page change handler
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= paginationData.totalPages) {
      setPage(newPage);
    }
  }, [paginationData.totalPages]);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600 text-sm sm:text-base">
            Loading your projects...
          </span>
        </div>
      </div>
    </div>
  ), []);

  if (loading) return loadingSkeleton;

  if (error) {
    return (
      <div className="bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠</span>
            </div>
            <div className="text-red-500 text-base sm:text-lg font-semibold mb-2">
              Error Loading Projects
            </div>
            <div className="text-gray-600 text-sm sm:text-base mb-4">{error}</div>
            <button
              onClick={fetchProjects}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Projects</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Projects Yet
            </h3>
            <p className="text-gray-600 text-base max-w-md mx-auto mb-6">
              You haven't created any projects yet. Start by creating your first project to get organized!
            </p>
            <button
              onClick={fetchProjects}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {paginationData.paginatedProjects.map((project) => (
                <ProjectCard key={`project-${project.id}`} project={project} />
              ))}
            </div>

            {paginationData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <div className="text-sm text-gray-600">
                  Showing {paginationData.startItem}–{paginationData.endItem} of {totalCount} projects
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`p-2 rounded-full transition-all ${page === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-50"
                      }`}
                    aria-label="Previous page"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(paginationData.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === page;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${isCurrentPage
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === paginationData.totalPages}
                    className={`p-2 rounded-full transition-all ${page === paginationData.totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-50"
                      }`}
                    aria-label="Next page"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

Projects.displayName = 'Projects';

// Memoized InputField komponenti
const InputField = memo(({ label, value, onChange, placeholder, readOnly = false, type = "text", endAdornment = null }) => (
  <div>
    <label className="block text-sm text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value || (readOnly ? "Not provided" : "")}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
        placeholder={readOnly ? undefined : placeholder}
      />
      {endAdornment && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {endAdornment}
        </div>
      )}
    </div>
  </div>
));

InputField.displayName = 'InputField';

// Memoized PasswordField komponenti
const PasswordField = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  showPassword, 
  onTogglePassword,
  readOnly = false 
}) => (
  <div>
    <label className="block text-sm text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50"
        placeholder={readOnly ? undefined : placeholder}
      />
      {!readOnly && (
        <span
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        >
          {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        </span>
      )}
    </div>
  </div>
));

PasswordField.displayName = 'PasswordField';

const MainProfile = () => {
  // State management - grouped for better organization
  const [profileState, setProfileState] = useState({
    user: null,
    originalUser: null,
    birthday: "",
    originalBirthday: "",
    isEditing: false,
    loading: true,
    updating: false,
  });

  const [passwordState, setPasswordState] = useState({
    changePassword: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [tokenExpiredSection, setTokenExpiredSection] = useState(false);

  const screens = useBreakpoint();
  const navigate = useNavigate();
  const { tokenExpired, redirecting, checkApiError } = useTokenManager();

  // Memoized avatar size calculation
  const avatarSize = useMemo(() => {
    let size = 80;
    if (screens.sm) size = 100;
    if (screens.md) size = 100;
    if (screens.lg) size = 120;
    return size;
  }, [screens]);

  // Memoized token check function
  const checkTokenExpiration = useCallback((error) => {
    if (error.response && error.response.status === 401) {
      setTokenExpiredSection(true);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      setTimeout(() => {
        message.error("Session expired. Please login again.");
        navigate("/login");
      }, 2000);

      return true;
    }
    return false;
  }, [navigate]);

  // Memoized profile fetch function
  const fetchUser = useCallback(async () => {
    if (tokenExpired || redirecting) return;

    try {
      setProfileState(prev => ({ ...prev, loading: true }));
      const data = await getMyProfile();

      const userWithPreview = {
        ...data,
        profile_picture_preview: data.profile_picture || null,
      };

      setProfileState(prev => ({
        ...prev,
        user: userWithPreview,
        originalUser: { ...userWithPreview },
        birthday: data.birth_date || "",
        originalBirthday: data.birth_date || "",
        loading: false
      }));
    } catch (error) {
      console.error("Profile fetch error:", error);

      if (!checkTokenExpiration(error)) {
        message.error(`Error fetching user data: ${error.message || 'Unknown error'}`);
      }
      
      setProfileState(prev => ({ ...prev, loading: false }));
    }
  }, [tokenExpired, redirecting, checkApiError, checkTokenExpiration]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Memoized input change handler
  const handleInputChange = useCallback((field, value) => {
    setProfileState(prev => ({
      ...prev,
      user: { ...prev.user, [field]: value }
    }));
  }, []);

  // Memoized edit handlers
  const startEditing = useCallback(() => {
    setProfileState(prev => ({
      ...prev,
      originalUser: { ...prev.user },
      originalBirthday: prev.birthday,
      isEditing: true
    }));
  }, []);

  const cancelEditing = useCallback(() => {
    setProfileState(prev => ({
      ...prev,
      user: { ...prev.originalUser },
      birthday: prev.originalBirthday,
      isEditing: false
    }));
    setPasswordState(prev => ({ ...prev, changePassword: false }));
  }, []);

  // Memoized save handler
  const handleSave = useCallback(async () => {
    if (!profileState.user || tokenExpired || redirecting) return;

    try {
      setProfileState(prev => ({ ...prev, updating: true }));

      const updateData = {
        first_name: profileState.user.first_name,
        last_name: profileState.user.last_name,
        email: profileState.user.email,
        phone_number: profileState.user.phone_number,
        address: profileState.user.address,
        tg_username: profileState.user.tg_username,
      };

      if (profileState.birthday) {
        updateData.birth_date = dayjs(profileState.birthday).format("YYYY-MM-DD");
      }

      if (passwordState.changePassword) {
        if (!profileState.user.password || !profileState.user.password1) {
          message.error("Please fill out both password fields.");
          return;
        }
        if (profileState.user.password !== profileState.user.password1) {
          message.error("New password and confirmation do not match.");
          return;
        }
        updateData.password = profileState.user.password;
        updateData.password1 = profileState.user.password1;
      }

      if (profileState.user.profile_picture instanceof File) {
        updateData.profile_picture = profileState.user.profile_picture;
      }

      await updateMyProfile(updateData);

      const freshUserData = await getMyProfile();
      const updatedUserWithPreview = {
        ...freshUserData,
        profile_picture_preview: freshUserData.profile_picture || null,
      };

      setProfileState(prev => ({
        ...prev,
        user: updatedUserWithPreview,
        originalUser: { ...updatedUserWithPreview },
        birthday: freshUserData.birth_date || "",
        originalBirthday: freshUserData.birth_date || "",
        isEditing: false,
        updating: false
      }));
      
      setPasswordState(prev => ({ ...prev, changePassword: false }));
      message.success("Profile updated successfully");
    } catch (error) {
      if (!checkApiError(error)) {
        message.error("Error during saving");
      }
      setProfileState(prev => ({ ...prev, updating: false }));
    }
  }, [profileState.user, profileState.birthday, passwordState.changePassword, tokenExpired, redirecting, checkApiError]);

  // Memoized token validity checker - optimized to avoid re-renders
  const checkTokenValidity = useCallback(() => {
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

        setTimeout(() => {
          message.error("Session expired. Please login again.");
          navigate("/login");
        }, 2000);

        return false;
      }

      const timeLeft = expirationTime - currentTime;
      const minutesLeft = Math.floor(timeLeft / 60000);

      if (minutesLeft < 5 && minutesLeft > 0) {
        message.warning(`Your session will expire in ${minutesLeft} minutes. Please save your work.`);
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      setTokenExpiredSection(true);
      return false;
    }
  }, [navigate]);

  // Optimized token check interval - only check, don't cause re-renders
  useEffect(() => {
    checkTokenValidity();
    const interval = setInterval(checkTokenValidity, 30000);
    return () => clearInterval(interval);
  }, [checkTokenValidity]);

  // Memoized password handlers
  const toggleCurrentPassword = useCallback(() => {
    setPasswordState(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }));
  }, []);

  const toggleNewPassword = useCallback(() => {
    setPasswordState(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }));
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setPasswordState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }));
  }, []);

  const toggleChangePassword = useCallback(() => {
    setPasswordState(prev => ({ ...prev, changePassword: !prev.changePassword }));
  }, []);

  // Memoized upload handler
  const handleAvatarUpload = useCallback((file) => {
    const preview = URL.createObjectURL(file);
    setProfileState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        profile_picture_preview: preview,
        profile_picture: file,
      }
    }));
    return false;
  }, []);

  // Memoized date change handler
  const handleDateChange = useCallback((date, dateString) => {
    setProfileState(prev => ({ ...prev, birthday: dateString }));
  }, []);

  // Early returns for loading states
  if (tokenExpired || tokenExpiredSection) {
    return <TokenExpiredScreen />;
  }

  if (profileState.loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  if (!profileState.user) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <div className="text-center py-8">User data not found</div>
        </Card>
      </div>
    );
  }

  const { user, birthday, isEditing, updating } = profileState;
  const { changePassword, showCurrentPassword, showNewPassword, showConfirmPassword } = passwordState;

  return (
    <div className="p-6 max-w-full mx-auto rounded-2xl shadow-md bg-white m-10 space-y-10">
      <div className="flex flex-col gap-10 mt-3">
        {/* Top User Card */}
        <div className="relative rounded-2xl">
          {/* Edit Button */}
          {!isEditing && (
            <div className="absolute -top-4 right-0">
              <button
                onClick={startEditing}
                className="md:hidden p-2 rounded-md shadow-md hover:shadow-lg bg-[#0048FF] text-white flex items-center justify-center"
              >
                <FiEdit3 size={18} />
              </button>

              <button
                onClick={startEditing}
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
                size={avatarSize}
                src={user.profile_picture_preview || user.profile_picture}
                icon={<UserOutlined />}
                className="ring-2 sm:ring-4 ring-indigo-100 shadow-lg"
              />
              {isEditing && (
                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
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
                  {user.role === "dep_manager" ? "Department Manager" : user.role}
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
            <div className="space-y-4">
              {/* Email */}
              <InputField
                label="Email"
                value={user.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Please enter your email"
                readOnly={!isEditing}
              />

              {/* Phone */}
              <InputField
                label="Phone Number"
                value={user.phone_number || "+998"}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="Please enter your phone number"
                readOnly={!isEditing}
              />

              {/* Birthday */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date of birth</label>
                {isEditing ? (
                  <DatePicker
                    className="w-full calendar h-[49.6px]"
                    value={birthday ? dayjs(birthday) : null}
                    onChange={handleDateChange}
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
              <InputField
                label="Department"
                value={user.department?.name || "Not provided"}
                readOnly={true}
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex flex-col gap-5">
            <div className="space-y-4">
              {/* Telegram */}
              <InputField
                label="Telegram Username"
                value={user.tg_username || "@"}
                onChange={(e) => handleInputChange("tg_username", e.target.value)}
                placeholder="Please enter your telegram username"
                readOnly={!isEditing}
              />

              {/* Address */}
              <InputField
                label="Address"
                value={user.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Please enter your address"
                readOnly={!isEditing}
              />

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Password</label>

                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    {changePassword ? (
                      <>
                        <PasswordField
                          label=""
                          value={user.password || ""}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          placeholder="Enter your new password"
                          showPassword={showNewPassword}
                          onTogglePassword={toggleNewPassword}
                        />

                        <PasswordField
                          label="Confirm password"
                          value={user.password1 || ""}
                          onChange={(e) => handleInputChange("password1", e.target.value)}
                          placeholder="Confirm your new password"
                          showPassword={showConfirmPassword}
                          onTogglePassword={toggleConfirmPassword}
                        />

                        <Button type="link" danger onClick={toggleChangePassword}>
                          Cancel Password Change
                        </Button>
                      </>
                    ) : (
                      <>
                        <PasswordField
                          label=""
                          value="••••••••"
                          showPassword={showCurrentPassword}
                          onTogglePassword={toggleCurrentPassword}
                          readOnly={true}
                        />
                        <Button type="link" onClick={toggleChangePassword}>
                          Change Password
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="password"
                      value="••••••••"
                      readOnly
                      className="w-full border p-3 border-gray-300 rounded-lg bg-gray-50 text-gray-800"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save / Cancel buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={updating}
              className="bg-[#0048FF] max-w-[155px] w-full py-3 text-white hover:opacity-90 rounded-lg shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelEditing}
              disabled={updating}
              className="bg-[#EFEFEF] max-w-[155px] w-full py-3 text-[#313131] hover:opacity-90 rounded-lg shadow-md shadow-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <Projects />
    </div>
  );
};

export default MainProfile;