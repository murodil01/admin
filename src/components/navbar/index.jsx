import { Menu, Bell, User, Search, Settings } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import AuthContext from "../../context/AuthContext.jsx";
import Notification from "../../pages/notification";
import { X } from "lucide-react";
import { getNotificationsAll } from "../../api/services/notificationsService";

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

  // Notifications ma'lumotlarini olish
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (user && user.id && token && !loading) {
          console.log("Fetching notifications for user:", user.id);

          // API ni parametrlarsiz chaqirish (server parametrlarni qabul qilmaydi)
          const response = await getNotificationsAll();
          console.log("Notifications API response:", response);

          // Response strukturasini aniqlash
          let notifications = [];

          if (response?.data && Array.isArray(response.data)) {
            notifications = response.data;
          } else if (response?.results && Array.isArray(response.results)) {
            notifications = response.results;
          } else if (Array.isArray(response)) {
            notifications = response;
          } else if (response?.notifications && Array.isArray(response.notifications)) {
            notifications = response.notifications;
          } else {
            console.warn("Notifications response format not recognized:", response);
            setNotificationCount(0);
            return;
          }

          console.log(`Total notifications received: ${notifications.length}`);

          // O'qilmagan bildirishnomalarni hisoblash
          const unreadCount = notifications.filter((notif) => {
            if (!notif) return false;

            // Turli field nomlarini tekshirish
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

          console.log(`Total: ${notifications.length}, Unread: ${unreadCount}`);

          // Debugging uchun birinchi 3 ta notification
          notifications.slice(0, 3).forEach((notif, index) => {
            console.log(`Notification ${index + 1}:`, {
              id: notif.id,
              title: notif.title?.substring(0, 30) || notif.message?.substring(0, 30) || "No title",
              is_read: notif.is_read,
              read: notif.read,
              status: notif.status,
              read_at: notif.read_at,
            });
          });

          setNotificationCount(unreadCount);
        } else {
          console.log("Not fetching notifications:", {
            hasUser: !!user,
            hasUserId: !!user?.id,
            hasToken: !!token,
            isLoading: loading,
          });
          setNotificationCount(0);
        }
      } catch (error) {
        console.error("Notifications fetch error:", error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Auth error in notifications - token might be invalid");
        }
        setNotificationCount(0);
      }
    };

    // Faqat user mavjud va loading tugaganda fetch qilish
    if (user && user.id && !loading) {
      fetchNotifications();

      // 60 sekundda bir marta yangilab turish
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotificationCount(0);
    }
  }, [user, loading]);

  // User retry logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user && !loading && retryCount < 3) {
      console.log(`Auth retry attempt ${retryCount + 1}/3`);
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

      console.log("Starting logout...");

      await logout();

      // Clear storage
      localStorage.removeItem("userDropdownOpen");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      console.log("Logout completed");
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

    // Refresh notifications after modal close
    setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (user && user.id && token) {
          console.log("Refreshing notifications after modal close...");

          const response = await getNotificationsAll();

          let notifications = [];
          if (response?.data && Array.isArray(response.data)) {
            notifications = response.data;
          } else if (response?.results && Array.isArray(response.results)) {
            notifications = response.results;
          } else if (Array.isArray(response)) {
            notifications = response;
          } else if (response?.notifications && Array.isArray(response.notifications)) {
            notifications = response.notifications;
          }

          const unreadCount = notifications.filter((notif) => {
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

          console.log(`After modal close - Total: ${notifications.length}, Unread: ${unreadCount}`);
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Error refreshing notifications:", error);
      }
    }, 500);
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
        {/* Bell with notification count */}
        <button
          onClick={handleNotificationClick}
          className="relative w-12 h-[45px] bg-white rounded-[14px] flex items-center justify-center transition sm:shadow"
          disabled={!user || !user.id}
        >
          <Bell
            size={24}
            className={!user || !user.id ? "text-gray-400" : "text-gray-600"}
          />
          {notificationCount > 0 && user && user.id && (
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
              className={`w-4 h-4 transition-transform duration-200 ${
                isUserOpen ? "rotate-180" : ""
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
              className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer border-t border-gray-400 pt-2 transition-colors ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
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
              className="bg-white rounded-l-[25px] w-[500px] max-w-[95%] p-[30px] relative transform transition-all duration-300 ease-out shadow-2xl"
              style={{
                animation: "slideInRight 0.3s ease-out",
              }}
            >
              <button
                onClick={handleNotificationClose}
                className="absolute top-7 right-10 text-black transition-colors p-1"
              >
                <X size={30} />
              </button>
              <Notification
                onNotificationUpdate={() => {
                  setTimeout(() => {
                    if (user && user.id) {
                      console.log("Notification updated, refreshing count...");
                      setNotificationCount((prev) => prev);
                    }
                  }, 1000);
                }}
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


// import { Menu, Bell, User, Search, Settings } from "lucide-react";
// import { useState, useRef, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { IoIosLogOut } from "react-icons/io";
// import { FaUserCircle } from "react-icons/fa";
// import AuthContext from "../../context/AuthContext";
// import Notification from "../../pages/notification"; // 🔹 Notification component qo'shdik
// import { X } from "lucide-react";

// const Navbar = ({ onToggleDesktop, onToggleMobile }) => {
//   const { user, loading, logout, refreshAuth } = useContext(AuthContext);
//   const [isUserOpen, setIsUserOpen] = useState(false);
//   const [isNotifOpen, setIsNotifOpen] = useState(false); // 🔹 Notification modal holati
//   const [retryCount, setRetryCount] = useState(0);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const notifRef = useRef(null);

//   // Agar user ma'lumotlari kechiksa retry qilish
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token && !user && !loading && retryCount < 3) {
//       const timer = setTimeout(() => {
//         setRetryCount((prev) => prev + 1);
//         refreshAuth();
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [user, loading, retryCount, refreshAuth]);

//   const navigateAndClose = (path) => {
//     setIsUserOpen(false);
//     localStorage.removeItem("userDropdownOpen");
//     navigate(path);
//   };

//   useEffect(() => {
//     const savedUserOpen = localStorage.getItem("userDropdownOpen");
//     if (savedUserOpen === "true") {
//       setIsUserOpen(true);
//     }
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (notifRef.current && !notifRef.current.contains(e.target)) {
//         setIsNotifOpen(false);
//       }
//     };

//     if (isNotifOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isNotifOpen]);

//   useEffect(() => {
//     localStorage.setItem("userDropdownOpen", isUserOpen);
//   }, [isUserOpen]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       setTimeout(() => {
//         if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//           setIsUserOpen(false);
//         }
//       }, 0);
//     };
//     if (isUserOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isUserOpen]);

//   const renderUserAvatar = () => {
//     const token = localStorage.getItem("token");

//     if (loading || (!user && token)) {
//       return (
//         <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
//           <User size={20} className="text-gray-400" />
//         </div>
//       );
//     }

//     if (!user && !token) {
//       return (
//         <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center">
//           <User size={20} className="text-red-400" />
//         </div>
//       );
//     }

//     return (
//       <img
//         src={user.profile_picture || "/default-avatar.png"}
//         alt="avatar"
//         className="w-11 h-11 sm:w-8 sm:h-8 rounded-full object-cover"
//         onError={(e) => {
//           e.target.style.display = "none";
//           e.target.nextSibling.style.display = "flex";
//         }}
//       />
//     );
//   };

//   return (
//     <header
//       className="bg-white md:bg-[#F2F2F2] mt-[10px] max-sm:mt-3 max-sm:mx-2.5 px-4 md:pl-4 md:pr-8 pb-3 pt-3 flex items-center justify-between max-w-full sticky top-0 z-40 
//       shadow-sm sm:shadow-none rounded-[24px] md:rounded-none gap-5"
//     >
//       {/* LEFT - Menu */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={onToggleMobile}
//           className="md:hidden flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow "
//         >
//           <Menu size={24} className="text-[#1F2937]" />
//         </button>

//         <button
//           onClick={onToggleDesktop}
//           className="hidden md:flex w-12 h-[45px] bg-white rounded-[14px]  items-center justify-center transition sm:shadow "
//         >
//           <Menu size={24} className="text-[#1F2937]" />
//         </button>
//       </div>

//       {/* SEARCH */}
//       <div className="flex-1 flex justify-center max-sm:-mr-4">
//         <div className="relative w-full max-w-md bg-white rounded-xl max-md:border max-md:border-gray-300 max-sm:border-0 flex max-sm:flex-row-reverse items-center">
//           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none max-sm:hidden">
//             <Search className="w-5 h-5 text-[#0A1629]" />
//           </span>
//           <span className="hidden max-sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
//             <Search className="w-5 h-5 text-[#0A1629]" />
//           </span>
//           <input
//             type="text"
//             placeholder="Search..."
//             className="w-full py-[10px] pr-4 pl-10 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:py-1
//                  max-sm:pl-3 max-sm:placeholder-transparent"
//           />
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div className="flex items-center gap-5 relative" ref={dropdownRef}>
//         {/* 🔔 Bell */}
//         <button
//           onClick={() => {
//             setIsNotifOpen(true); // 🔹 modal ham ochiladi
//           }}
//           className="relative w-12 h-[45px] bg-white rounded-[14px] flex items-center justify-center transition sm:shadow "
//         >
//           <Bell size={24} className="text-gray-600" />
//           <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
//         </button>

//         {/* ✅ Mobile avatar */}
//         <div
//           className="sm:hidden cursor-pointer"
//           onClick={() => setIsUserOpen((prev) => !prev)}
//         >
//           {renderUserAvatar()}
//           <div className="w-11 h-11 rounded-full bg-gray-200 hidden items-center justify-center">
//             <User size={20} className="text-gray-400" />
//           </div>
//         </div>

//         {/* ✅ Desktop avatar */}
//         <div className="hidden sm:block">
//           <button
//             onClick={() => setIsUserOpen((prev) => !prev)}
//             className="flex justify-between w-44 items-center gap-2 h-11 px-3 bg-white rounded-[14px] shadow  transition"
//           >
//             {renderUserAvatar()}
//             <div className="w-8 h-8 rounded-full bg-gray-200 hidden items-center justify-center">
//               <User size={16} className="text-gray-400" />
//             </div>
//             <span className="font-medium text-base text-gray-700 truncate w-20">
//               {loading || (!user && localStorage.getItem("token")) ? (
//                 <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
//               ) : user?.first_name ? (
//                 user.first_name
//               ) : localStorage.getItem("token") ? (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     refreshAuth();
//                   }}
//                   className="text-xs text-blue-500 hover:underline"
//                 >
//                   Retry
//                 </button>
//               ) : (
//                 "Guest"
//               )}
//             </span>
//             <svg
//               className={`w-4 h-4 transition-transform duration-200 ${
//                 isUserOpen ? "rotate-180" : ""
//               }`}
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 9l-7 7-7-7"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* 🔽 Dropdown (common for mobile and desktop) */}
//         {isUserOpen && !loading && user && (
//           <div className="absolute top-[60px] md:top-12 right-0 w-56 sm:w-48 md:w-44 bg-white rounded-[14px] shadow-lg py-2 z-50 space-y-1 text-sm text-gray-700">
//             <div
//               onClick={() => navigateAndClose(`/main-profile`)}
//               className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
//             >
//               <FaUserCircle size={18} /> <span>My Profile</span>
//             </div>
//             <div
//               onClick={() => navigateAndClose("/settings")}
//               className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
//             >
//               <Settings size={18} /> <span>Settings</span>
//             </div>
//             <div
//               onClick={async () => {
//                 await logout();
//                 navigateAndClose("/login");
//               }}
//               className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer border-t border-gray-400 pt-2"
//             >
//               <IoIosLogOut size={18} />
//               <span>Logout</span>
//             </div>
//           </div>
//         )}

//         {/* 🔹 Notification Modal */}
//         {isNotifOpen && (
//           <div className="fixed inset-0 z-50 flex  justify-end bg-black/50">
//             <div
//               ref={notifRef}
//               className="bg-white rounded-l-[25px] w-[600px] max-w-[95%] p-[55px] relative"
//             >
//               {/* <button
//                 onClick={() => setIsNotifOpen(false)}
//                 className="absolute top-3 right-3 text-gray-500 hover:text-black"
//               >
//                 <X size={20} />
//               </button> */}
//               <Notification />
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;