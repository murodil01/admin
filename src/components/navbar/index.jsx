import { Menu, Bell, User, Search, Settings } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import AuthContext from "../../context/AuthContext.jsx";
import Notification from "../../pages/notification";
import { X } from "lucide-react";
import { getNotificationsAll, getNotificationsStats } from "../../api/services/notificationsService";
import { useCallback } from "react";

const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
  const { user, loading, logout, refreshAuth } = useContext(AuthContext);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Helper function to calculate unread count
  const calculateUnreadCount = useCallback((notifications) => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return 0;
    }

    return notifications.filter((notif) => {
      if (!notif) return false;
      const isUnread =
        notif.is_read === false ||
        notif.read === false ||
        !notif.is_read ||
        !notif.read ||
        notif.status === "unread" ||
        notif.read_at === null ||
        notif.read_at === undefined;
      return isUnread;
    }).length;
  }, []);

  // Notifications ma'lumotlarini olish
  useEffect(() => {
    let isMounted = true; // To prevent state updates on unmounted component

    const fetchNotificationStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (user && user.id && token && !loading) {
          // Use getNotificationsStats for unread count
          const response = await getNotificationsStats();

          // Extract unread count from response
          let unreadCount = 0;

          if (response?.unread_count !== undefined) {
            unreadCount = response.unread_count;
          } else if (response?.data?.unread_count !== undefined) {
            unreadCount = response.data.unread_count;
          } else if (response?.stats?.unread_count !== undefined) {
            unreadCount = response.stats.unread_count;
          } else {
            console.warn("Unread count not found in stats response:", response);
            // Fallback to the old method if stats don't work
            const allNotificationsResponse = await getNotificationsAll();
            let notifications = [];

            if (allNotificationsResponse?.data && Array.isArray(allNotificationsResponse.data)) {
              notifications = allNotificationsResponse.data;
            } else if (allNotificationsResponse?.results && Array.isArray(allNotificationsResponse.results)) {
              notifications = allNotificationsResponse.results;
            } else if (Array.isArray(allNotificationsResponse)) {
              notifications = allNotificationsResponse;
            }

            unreadCount = calculateUnreadCount(notifications);
          }

          // Only update if count actually changed and component is still mounted
          if (isMounted && notificationCount !== unreadCount) {
            setNotificationCount(unreadCount);
          }
        } else if (isMounted) {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Notification stats fetch error:", error);

        if (!isMounted) return;

        // Fallback to old method on error
        try {
          const fallbackResponse = await getNotificationsAll();
          let notifications = [];

          if (fallbackResponse?.data && Array.isArray(fallbackResponse.data)) {
            notifications = fallbackResponse.data;
          } else if (fallbackResponse?.results && Array.isArray(fallbackResponse.results)) {
            notifications = fallbackResponse.results;
          } else if (Array.isArray(fallbackResponse)) {
            notifications = fallbackResponse;
          }

          const unreadCount = calculateUnreadCount(notifications);
          if (isMounted && notificationCount !== unreadCount) {
            setNotificationCount(unreadCount);
          }
        } catch (fallbackError) {
          console.error("Fallback notification fetch also failed:", fallbackError);
          if (isMounted) {
            setNotificationCount(0);
          }
        }
      }
    };

    // Only fetch when user is available and not loading
    if (user && user.id && !loading) {
      fetchNotificationStats();

      // Refresh every 60 seconds
      const interval = setInterval(fetchNotificationStats, 60000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } else if (isMounted) {
      setNotificationCount(0);
    }

    return () => {
      isMounted = false;
    };
  }, [user, loading, calculateUnreadCount, notificationCount]);

  // Improved notification update handler
  const handleNotificationUpdate = useCallback((updatedNotifications) => {
    if (!updatedNotifications || !Array.isArray(updatedNotifications)) {
      return;
    }

    // Calculate unread count from updated notifications
    const unreadCount = calculateUnreadCount(updatedNotifications);

    // Only update if count actually changed
    setNotificationCount(prev => {
      if (prev !== unreadCount) {
        return unreadCount;
      }
      return prev;
    });
  }, [calculateUnreadCount]);

  // User retry logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user && !loading && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        refreshAuth();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, retryCount, refreshAuth]);

  const navigateAndClose = (path) => {
    setIsUserOpen(false);
    localStorage.removeItem("userDropdownOpen");
    navigate(path);
  };

  // Logout handler
  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setIsUserOpen(false);
      setNotificationCount(0);

      await logout();

      // Clear storage
      localStorage.removeItem("userDropdownOpen");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const savedUserOpen = localStorage.getItem("userDropdownOpen");
    if (savedUserOpen === "true") {
      setIsUserOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    localStorage.setItem("userDropdownOpen", isUserOpen);
  }, [isUserOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
          setIsUserOpen(false);
        }
      }, 0);
    };
    if (isUserOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserOpen]);

  // Notification modal handlers
  const handleNotificationClick = () => {
    setIsNotifOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotifOpen(false);

    // Refresh notification stats after modal close with debounce
    setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (user && user.id && token) {
          const response = await getNotificationsStats();

          let unreadCount = 0;
          if (response?.unread_count !== undefined) {
            unreadCount = response.unread_count;
          } else if (response?.data?.unread_count !== undefined) {
            unreadCount = response.data.unread_count;
          } else if (response?.stats?.unread_count !== undefined) {
            unreadCount = response.stats.unread_count;
          } else {
            // Fallback
            const allNotificationsResponse = await getNotificationsAll();
            let notifications = [];

            if (allNotificationsResponse?.data && Array.isArray(allNotificationsResponse.data)) {
              notifications = allNotificationsResponse.data;
            } else if (allNotificationsResponse?.results && Array.isArray(allNotificationsResponse.results)) {
              notifications = allNotificationsResponse.results;
            } else if (Array.isArray(allNotificationsResponse)) {
              notifications = allNotificationsResponse;
            }

            unreadCount = calculateUnreadCount(notifications);
          }

          // Only update if count actually changed
          setNotificationCount(prev => prev !== unreadCount ? unreadCount : prev);
        }
      } catch (error) {
        console.error("Error refreshing notification stats:", error);
        // Don't set to 0 on error, keep current count
      }
    }, 100); // Increased debounce time
  };

  const renderUserAvatar = () => {
    const token = localStorage.getItem("token");

    if (loading || (!user && token)) {
      return (
        <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
          <User size={20} className="text-gray-400" />
        </div>
      );
    }

    if (!user && !token) {
      return (
        <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center">
          <User size={20} className="text-red-400" />
        </div>
      );
    }

    return (
      <img
        src={user?.profile_picture || "/default-avatar.png"}
        alt="avatar"
        className="w-11 h-11 sm:w-8 sm:h-8 rounded-full object-cover"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  };

  return (
    <header className="bg-white md:bg-[#F2F2F2] mt-[10px] max-sm:mt-3 max-sm:mx-2.5 px-4 md:pl-4 md:pr-8 pb-3 pt-3 flex items-center justify-between max-w-full sticky top-0 z-40 shadow-sm sm:shadow-none rounded-[24px] md:rounded-none gap-5">
      {/* LEFT - Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden flex w-12 h-[45px] bg-white rounded-[14px] items-center justify-center transition sm:shadow hover:bg-gray-50"
        >
          <Menu size={24} className="text-[#1F2937]" />
        </button>

        <button
          onClick={onToggleDesktop}
          className="hidden md:flex w-12 h-[45px] bg-white rounded-[14px] items-center justify-center transition sm:shadow hover:bg-gray-50"
        >
          <Menu size={24} className="text-[#1F2937]" />
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex-1 flex justify-center max-sm:-mr-4">
        <div className="relative w-full max-w-md bg-white rounded-xl max-md:border max-md:border-gray-300 max-sm:border-0 flex max-sm:flex-row-reverse items-center">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none max-sm:hidden">
            <Search className="w-5 h-5 text-[#0A1629]" />
          </span>
          <span className="hidden max-sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#0A1629]" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-[10px] pr-4 pl-10 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:py-1 max-sm:pl-3 max-sm:placeholder-transparent"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5 relative" ref={dropdownRef}>
        {/* Bell with notification count - only show count if > 0 */}
        <button
          onClick={handleNotificationClick}
          className="relative w-12 h-[45px] bg-white rounded-[14px] flex items-center justify-center transition sm:shadow"
          disabled={!user || !user.id}
        >
          <Bell
            size={24}
            className={!user || !user.id ? "text-gray-400" : "text-gray-600"}
          />
          {notificationCount > 0 && user && user.id && !isNotifOpen && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        {/* Mobile avatar */}
        <div
          className="sm:hidden cursor-pointer"
          onClick={() => setIsUserOpen((prev) => !prev)}
        >
          {renderUserAvatar()}
          <div className="w-11 h-11 rounded-full bg-gray-200 hidden items-center justify-center">
            <User size={20} className="text-gray-400" />
          </div>
        </div>

        {/* Desktop avatar */}
        <div className="hidden sm:block">
          <button
            onClick={() => setIsUserOpen((prev) => !prev)}
            className="flex justify-between w-44 items-center gap-2 h-11 px-3 bg-white rounded-[14px] shadow transition hover:bg-gray-50"
          >
            {renderUserAvatar()}
            <div className="w-8 h-8 rounded-full bg-gray-200 hidden items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
            <span className="font-medium text-base text-gray-700 truncate w-20">
              {loading || (!user && localStorage.getItem("token")) ? (
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              ) : user?.first_name ? (
                user.first_name
              ) : localStorage.getItem("token") ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshAuth();
                  }}
                  className="text-xs text-blue-500 hover:underline"
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? "Failed" : "Retry"}
                </button>
              ) : (
                "Guest"
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isUserOpen ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Dropdown */}
        {isUserOpen && !loading && user && (
          <div className="absolute top-[60px] md:top-12 right-0 w-56 sm:w-48 md:w-44 bg-white rounded-[14px] shadow-lg py-2 z-50 space-y-1 text-sm text-gray-700">
            <div
              onClick={() => navigateAndClose("/main-profile")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <FaUserCircle size={18} /> <span>My Profile</span>
            </div>
            <div
              onClick={() => navigateAndClose("/settings")}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <Settings size={18} /> <span>Settings</span>
            </div>
            <div
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer border-t border-gray-400 pt-2 transition-colors ${isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <IoIosLogOut size={18} />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {isNotifOpen && user && user.id && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-opacity-50">
            <div
              ref={notifRef}
              className="bg-white rounded-l-[25px] w-[440px] max-w-[95%] p-[30px] relative transform transition-all duration-300 ease-out shadow-2xl"
              style={{
                animation: "slideInRight 0.3s ease-out",
              }}
            >
              <button
                onClick={handleNotificationClose}
                className="absolute sm:top-8 right-5 top-7 text-gray-500 transition-colors p-1"
              >
                <X size={30} />
              </button>
              <Notification
                onNotificationUpdate={handleNotificationUpdate}
              />
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </header>
  );
};

export default Navbar;