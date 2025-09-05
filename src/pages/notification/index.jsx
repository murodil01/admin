import { FiSearch } from "react-icons/fi";
import { FiBell } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, X, Eye } from "lucide-react";
import { getNotificationsAll, markAllRead, markNotificationAsRead, getNotificationsStats } from "../../api/services/notificationsService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import { useContext } from "react";

// Notification Detail Modal Component
const NotificationDetailModal = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  if (!isOpen || !notification) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMarkAsRead = async () => {
    if (!notification.is_read && !notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
      onClick={handleBackdropClick}
    >
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Notification Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex items-center gap-10">
          {/* Notification Image */}
          <div className="mb-4">
            <img
              src={notification.display_image
                || "https://avatars.mds.yandex.net/i?id=17ce2915d8a8ee46c05a880825f4bdf63150c0be-9863899-images-thumbs&n=13"}
              alt={notification.title}
              className="w-30 h-30 object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-black flex items-center">
                {notification.title}
                {(notification.is_read === false || notification.read === false || notification.status === "unread") && (
                  <span className="ml-2 inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                )}
              </h3>
              {(notification.is_read === false || notification.read === false || notification.status === "unread") && (
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  <Eye size={14} />
                  Mark as Read
                </button>
              )}
            </div>

            {/* Description */}
            <div className="">
              <p className="text-gray-700 text-base leading-relaxed">
                {notification.description || notification.message || "No description available."}
              </p>
            </div>

            {/* Additional details */}
            <div className="text-sm text-gray-600 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Created: {notification.created_time || notification.created_at
                    ? new Date(notification.created_time || notification.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                    : "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Event date: {notification.event_time || notification.event_at
                    ? new Date(notification.event_time || notification.event_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                    : "Unknown"}
                </span>
              </div>

              {notification.notification_type && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                    {notification.notification_type}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-md text-xs ${(notification.is_read === false || notification.read === false || notification.status === "unread")
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
                  }`}>
                  {(notification.is_read === false || notification.read === false || notification.status === "unread") ? "Unread" : "Read"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          {/* You can add more action buttons here if needed */}
        </div>
      </div>
    </div>
  );
};

const Notification = ({ onNotificationUpdate, onCloseNotificationModal }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useContext(AuthContext);

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
  // Notifications ma'lumotlarini olish
useEffect(() => {
  let isMounted = true;

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

        // Only update if component is still mounted
        if (isMounted) {
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
        if (isMounted) {
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
}, [user, loading, calculateUnreadCount]); // notificationCount ni dependency dan olib tashlang

  // // Improved notification update handler
  // const handleNotificationUpdate = useCallback((updatedNotifications) => {
  //   if (!updatedNotifications || !Array.isArray(updatedNotifications)) {
  //     return;
  //   }

  //   // Calculate unread count from updated notifications
  //   const unreadCount = calculateUnreadCount(updatedNotifications);

  //   // Only update if count actually changed
  //   setNotificationCount(prev => {
  //     if (prev !== unreadCount) {
  //       return unreadCount;
  //     }
  //     return prev;
  //   });
  // }, [calculateUnreadCount]);

  // Get formatted date title
  const getDateTitle = (dateString) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const notificationDate = new Date(dateString);

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    notificationDate.setHours(0, 0, 0, 0);

    if (notificationDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return notificationDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const grouped = {};

    notifications.forEach(notification => {
      const dateKey = new Date(notification.created_time || notification.created_at).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notification);
    });

    // Sort groups by date (most recent first)
    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(dateKey => ({
        date: dateKey,
        dateTitle: getDateTitle(dateKey),
        notifications: grouped[dateKey]
      }));

    return sortedGroups;
  };

  // Filter notifications based on active tab
  const filterNotifications = useCallback((notificationsData, tabFilter) => {
    if (tabFilter === 'all') {
      return notificationsData;
    }

    const filterMap = {
      'task': ['task', 'task_assigned'],
      'project': ['project', 'project_created', 'project_assigned'],
      'events': ['event', 'event_created', 'event_updated', 'event_cancelled']
    };

    const typesToFilter = filterMap[tabFilter] || [];
    return notificationsData.filter(notification =>
      typesToFilter.includes(notification.notification_type)
    );
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationsAll();
      const notificationsData = data.results || data || [];
      setNotifications(notificationsData);

      // Apply current filter
      const filtered = filterNotifications(notificationsData, activeTab);
      setFilteredNotifications(filtered);

      // Check if there are any unread notifications (from all notifications)
      const unreadExists = notificationsData.some(item =>
        item.is_read === false ||
        item.read === false ||
        !item.is_read ||
        !item.read ||
        item.status === "unread"
      );
      setHasUnread(unreadExists);

      // Notify parent component about the update
      if (onNotificationUpdate) {
        onNotificationUpdate(notificationsData);
      }
    } catch {
      toast.error("Failed to fetch notifications!");
    } finally {
      setLoading(false);
    }
  }, [onNotificationUpdate, activeTab, filterNotifications]);

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const filtered = filterNotifications(notifications, tabName);
    setFilteredNotifications(filtered);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.is_read === false || notification.read === false || notification.status === "unread") {
      try {
        await markNotificationAsRead(notification.id);
        const updated = notifications.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        );
        setNotifications(updated);

        // Update filtered notifications
        const filteredUpdated = filterNotifications(updated, activeTab);
        setFilteredNotifications(filteredUpdated);

        setHasUnread(updated.some(
          (item) =>
            item.is_read === false ||
            item.read === false ||
            !item.is_read ||
            !item.read ||
            item.status === "unread"
        ));

        // Yangi qo'shilgan qism: notificationCount ni yangilang
        setNotificationCount(prev => prev - 1);

        // Notify parent (Navbar) immediately
        if (onNotificationUpdate) {
          onNotificationUpdate(updated);
        }
        // Update selected notification to show as read in modal
        setSelectedNotification({ ...notification, is_read: true });
      } catch {
        toast.error("Failed to mark notification as read!");
        setSelectedNotification(notification);
      }
    } else {
      setSelectedNotification(notification);
    }

    setIsModalOpen(true);
  };

  // This function handles the "View" button click in each notification
  const handleViewNotification = (e, item) => {
    e.stopPropagation();

    // Close the notification modal
    if (onCloseNotificationModal) {
      onCloseNotificationModal();
    }

    // Navigate based on notification type
    if (item.notification_type === "task" || item.notification_type === "task_assigned") {
      // For task notifications, navigate to tasks/:projectID
      // You might need to adjust this based on your data structure
      // If the notification doesn't have project_id, you might need to fetch it or adjust your API
      const projectId = item.get_instance_id;
      navigate(`/tasks/${projectId}`);
    } else if (item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned") {
      navigate(`/tasks`);
    } else if (item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled") {
      navigate(`/calendar`);
    }
  };

  const handleModalMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      const updated = notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      );
      setNotifications(updated);

      // Update filtered notifications
      const filteredUpdated = filterNotifications(updated, activeTab);
      setFilteredNotifications(filteredUpdated);

      setHasUnread(updated.some(
        (item) =>
          item.is_read === false ||
          item.read === false ||
          !item.is_read ||
          !item.read ||
          item.status === "unread"
      ));

      // Yangi qo'shilgan qism: notificationCount ni yangilang
      setNotificationCount(prev => prev - 1);

      // Update selected notification
      setSelectedNotification(prev => prev ? { ...prev, is_read: true } : null);

      if (onNotificationUpdate) {
        onNotificationUpdate(updated);
      }
      toast.success("Notification marked as read!");
    } catch {
      toast.error("Failed to mark notification as read!");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      const updatedNotifications = notifications.map(item => ({ ...item, is_read: true }));
      setNotifications(updatedNotifications);

      // Update filtered notifications
      const filteredUpdated = filterNotifications(updatedNotifications, activeTab);
      setFilteredNotifications(filteredUpdated);

      setHasUnread(false);

      // Yangi qo'shilgan qism: notificationCount ni nolga tenglang
      setNotificationCount(0);

      toast.success("All notifications marked as read!");

      if (onNotificationUpdate) {
        onNotificationUpdate(updatedNotifications);
      }
    } catch {
      toast.error("Failed to mark all as read!");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Update filtered notifications when activeTab changes
  useEffect(() => {
    const filtered = filterNotifications(notifications, activeTab);
    setFilteredNotifications(filtered);
  }, [activeTab, notifications, filterNotifications]);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex max-w-[90%] sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 relative">
            <FiBell
              size={24}
              className={!user || !user.id ? "text-gray-400" : "text-gray-600"}
            />
            {notificationCount > 0 && user && user.id && (
              <span className="absolute -top-2 -right-1 min-w-[10px] min-h-[10px] bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-1">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </div>
          {/* Tabs */}
          <div className="border-b border-gray-200 w-full sm:border-b-0">
            <ul className="flex items-center justify-around sm:justify-center sm:gap-8 text-xs sm:text-sm font-semibold">
              <li
                className={`cursor-pointer py-2 sm:py-3 px-2 sm:px-0 transition-colors ${activeTab === 'all'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('all')}
              >
                All
              </li>
              <li
                className={`cursor-pointer py-2 sm:py-3 px-2 sm:px-0 transition-colors ${activeTab === 'task'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('task')}
              >
                Task
              </li>
              <li
                className={`cursor-pointer py-2 sm:py-3 px-2 sm:px-0 transition-colors ${activeTab === 'project'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('project')}
              >
                Project
              </li>
              <li
                className={`cursor-pointer py-2 sm:py-3 px-2 sm:px-0 transition-colors ${activeTab === 'events'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('events')}
              >
                Events
              </li>
            </ul>
          </div>
        </div>

        {/* Scrollable list with date grouping */}
        <div className="flex-1 overflow-y-auto py-2 sm:py-4 space-y-4 sm:space-y-6">
          {loading ? (
            <p className="text-gray-500 text-center font-medium py-8">Loading...</p>
          ) : filteredNotifications.length > 0 ? (
            groupNotificationsByDate(filteredNotifications).map((group) => (
              <div key={group.date} className="space-y-3 sm:space-y-4">
                {/* Date Title */}
                <div className="">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 sm:pb-2 py-2 sm:py-0">
                    {group.dateTitle}
                  </h2>
                </div>

                {/* Notifications for this date */}
                <div className="space-y-2 sm:space-y-3">
                  {group.notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg sm:rounded-xl cursor-pointer transition-all hover:shadow-md ${item.is_read === false ||
                        item.read === false ||
                        item.status === "unread"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 opacity-80 hover:opacity-100"
                        }`}
                    >
                      {/* Left icon */}
                      <div className="flex-shrink-0 mt-1 sm:mt-0">
                        {(item.notification_type === "task" || item.notification_type === "task_assigned") && (
                          <div className="flex items-center justify-center">
                            <svg width="20" height="20" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 27.1798L19.41 24.5898L18 25.9998L22 29.9998L30 21.9998L28.59 20.5898L22 27.1798Z" fill="#00C300" />
                              <path d="M25 5H22V4C21.9984 3.47005 21.7872 2.96227 21.4125 2.58753C21.0377 2.2128 20.5299 2.00158 20 2H12C11.4701 2.00158 10.9623 2.2128 10.5875 2.58753C10.2128 2.96227 10.0016 3.47005 10 4V5H7C6.47005 5.00158 5.96227 5.2128 5.58753 5.58753C5.2128 5.96227 5.00158 6.47005 5 7V28C5.00158 28.5299 5.2128 29.0377 5.58753 29.4125C5.96227 29.7872 6.47005 29.9984 7 30H16V28H7V7H10V10H22V7H25V18H27V7C26.9984 6.47005 26.7872 5.96227 26.4125 5.58753C26.0377 5.2128 25.5299 5.00158 25 5ZM20 8H12V4H20V8Z" fill="#00C300" />
                            </svg>
                          </div>
                        )}
                        {(item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned") && (
                          <div className="flex items-center justify-center">
                            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.96029 28.6263C1.77287 28.8141 1.66772 29.0687 1.66797 29.334C1.66822 29.5993 1.77385 29.8536 1.96162 30.041C2.1494 30.2284 2.40393 30.3336 2.66923 30.3333C2.93453 30.3331 3.18887 30.2275 3.37629 30.0397L1.96029 28.6263ZM9.58029 23.829C9.76236 23.6403 9.86304 23.3877 9.86064 23.1255C9.85823 22.8633 9.75295 22.6125 9.56745 22.4272C9.38195 22.2419 9.13109 22.1368 8.86889 22.1347C8.60669 22.1325 8.35414 22.2334 8.16562 22.4157L9.58029 23.829ZM20.6123 7.30635L24.7216 11.421L26.1363 10.0077L22.027 5.89302L20.6123 7.30635ZM12.359 25.1997L6.86962 19.705L5.45629 21.1197L10.9443 26.6117L12.359 25.1997ZM23.071 19.057L20.515 20.017L21.219 21.889L23.775 20.9304L23.071 19.057ZM12.0483 11.5197L12.975 8.99302L11.0963 8.30368L10.171 10.8317L12.0483 11.5197ZM8.05896 15.1944C9.00829 14.933 9.72962 14.749 10.3203 14.325L9.15096 12.701C8.92162 12.8677 8.62162 12.965 7.52829 13.2663L8.05896 15.1944ZM10.171 10.8317C9.78029 11.8983 9.65762 12.189 9.47362 12.405L10.9963 13.7024C11.467 13.149 11.7083 12.4437 12.0483 11.5197L10.171 10.8317ZM10.3203 14.325C10.5701 14.1446 10.7954 13.937 10.9963 13.7024L9.47362 12.405C9.37805 12.516 9.26975 12.6154 9.15096 12.701L10.3203 14.325ZM20.515 20.017C19.5963 20.3637 18.8963 20.609 18.347 21.0837L19.6563 22.5984C19.8696 22.4117 20.159 22.2864 21.219 21.889L20.515 20.017ZM18.8056 24.533C19.1056 23.441 19.203 23.1424 19.3683 22.9117L17.743 21.7463C17.3203 22.337 17.1376 23.057 16.8763 24.0037L18.8056 24.533ZM18.347 21.085C18.1194 21.2806 17.9181 21.5019 17.743 21.7463L19.3696 22.9117C19.4523 22.7944 19.5478 22.6908 19.6563 22.5984L18.347 21.085ZM6.86962 19.7037C6.00829 18.841 5.42429 18.2544 5.04562 17.7784C4.66429 17.2997 4.62562 17.093 4.62429 17.001L2.62429 17.013C2.62962 17.789 3.01496 18.4397 3.48029 19.0237C3.94696 19.6103 4.62829 20.2904 5.45496 21.117L6.86962 19.7037ZM7.52829 13.2663C6.40029 13.5784 5.47229 13.8317 4.77762 14.1117C4.08429 14.389 3.42696 14.765 3.04029 15.437L4.77496 16.4344C4.82029 16.3544 4.95629 16.1944 5.52162 15.9677C6.08696 15.741 6.88429 15.5184 8.05896 15.1944L7.52829 13.2663ZM4.62429 16.9997C4.62313 16.8013 4.67466 16.6062 4.77362 16.4344L3.04029 15.437C2.76442 15.9162 2.62086 16.4601 2.62429 17.013L4.62429 16.9997ZM10.9443 26.6117C11.7763 27.4437 12.4603 28.1317 13.0483 28.5997C13.6363 29.069 14.291 29.4557 15.0723 29.457L15.075 27.457C14.9816 27.457 14.775 27.4184 14.295 27.0357C13.815 26.6544 13.2256 26.0677 12.359 25.1997L10.9443 26.6117ZM16.8776 24.0023C16.551 25.1863 16.3283 25.989 16.1003 26.5583C15.871 27.129 15.7096 27.265 15.6296 27.3103L16.6203 29.0477C17.299 28.661 17.6763 27.9997 17.9563 27.3023C18.2363 26.6037 18.4923 25.669 18.8056 24.533L16.8776 24.0023ZM15.0723 29.457C15.615 29.457 16.1483 29.317 16.6203 29.0477L15.6296 27.3103C15.4606 27.4066 15.2694 27.4571 15.075 27.457L15.0723 29.457ZM24.7216 11.421C26.1403 12.8397 27.1216 13.825 27.7216 14.6384C28.3136 15.4357 28.3816 15.861 28.3096 16.1944L30.2643 16.617C30.5176 15.4464 30.051 14.421 29.3296 13.4477C28.6176 12.4877 27.5083 11.3797 26.1363 10.0077L24.7216 11.421ZM23.775 20.9277C25.5896 20.2464 27.059 19.697 28.103 19.117C29.163 18.5304 30.011 17.789 30.2643 16.617L28.3096 16.1944C28.2376 16.5277 28.0003 16.8877 27.1323 17.3677C26.2483 17.8597 24.9483 18.3503 23.071 19.0557L23.775 20.9277ZM22.027 5.89302C20.6456 4.51035 19.531 3.39168 18.567 2.67435C17.5883 1.94902 16.5563 1.47835 15.3803 1.73835L15.8123 3.69035C16.1456 3.61702 16.571 3.68368 17.3736 4.28102C18.191 4.88768 19.1843 5.87568 20.6123 7.30635L22.027 5.89302ZM12.9736 8.99168C13.6696 7.09435 14.155 5.77835 14.6416 4.88502C15.1216 4.00502 15.479 3.76502 15.8123 3.69035L15.3816 1.73835C14.2056 1.99702 13.4683 2.85835 12.8856 3.92768C12.311 4.98368 11.7696 6.46902 11.0963 8.30368L12.9736 8.99168ZM3.37362 30.0397L9.58029 23.829L8.16562 22.4157L1.95896 28.6263L3.37362 30.0397Z" fill="#0061FE"/>
                            </svg>
                          </div>
                        )}
                        {(item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled") && (
                          <div className="flex items-center justify-center">
                            <svg width="20" height="20" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21.3333 2.66602V7.99935M10.6667 2.66602V7.99935M4 13.3327H28M6.66667 5.33268H25.3333C26.8061 5.33268 28 6.52659 28 7.99935V26.666C28 28.1388 26.8061 29.3327 25.3333 29.3327H6.66667C5.19391 29.3327 4 28.1388 4 26.666V7.99935C4 6.52659 5.19391 5.33268 6.66667 5.33268Z" stroke="#D37B14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Middle content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-[15px] text-gray-900 flex items-start sm:items-center gap-2">
                          <span className="line-clamp-2 sm:line-clamp-1">{item.title}</span>
                          {(item.is_read === false ||
                            item.read === false ||
                            item.status === "unread") && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></span>
                            )}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1">
                          {item.description || item.message}
                        </p>
                        <span className="text-gray-400 text-xs flex items-center gap-1 mt-2">
                          <Calendar size={10} className="sm:w-3 sm:h-3" />
                          <span className="truncate">
                            {new Date(item.event_time || item.deadline_time).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      {/* Right action button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => handleViewNotification(e, item)}
                          className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-w-[32px] sm:min-w-[auto] ${item.notification_type === "task" || item.notification_type === "task_assigned"
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          <span className="hidden sm:inline">View </span>
                          <span className="sm:hidden text-sm font-bold">
                            {item.notification_type === "task" || item.notification_type === "task_assigned"
                              ? "T"
                              : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                ? "E"
                                : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                  ? "P"
                                  : "V"}
                          </span>
                          <span className="hidden sm:inline">
                            {item.notification_type === "task" || item.notification_type === "task_assigned"
                              ? "Task"
                              : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                ? "Event"
                                : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                  ? "Project"
                                  : ""}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-gray-300 mb-4">
                <FiBell size={48} />
              </div>
              <p className="text-gray-400 text-center text-sm sm:text-base">
                {activeTab === 'all' ? 'No notifications found.' : `No ${activeTab} notifications found.`}
              </p>
            </div>
          )}
        </div>

        {/* Mark all as read button - only show if there are unread notifications */}
        {hasUnread && (
          <div className="border-t border-gray-200 flex items-center justify-center">
            <button
              onClick={handleMarkAllRead}
              className="w-full sm:w-auto flex items-center justify-center text-[#0061FE] font-medium transition-colors cursor-pointer hover:text-[#76abff] text-sm sm:text-base py-2"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={closeModal}
        onMarkAsRead={handleModalMarkAsRead}
      />
    </>
  );
};

export default Notification;