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
                  {notification.notification_type?.includes("event") ? (
                    <>
                      Event date:{" "}
                      {notification.event_time || notification.event_at ? (
                        new Date(notification.event_time || notification.event_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        "Unknown"
                      )}
                    </>
                  ) : (
                    <>
                      Deadline:{" "}
                      {notification.deadline_time || notification.deadline_at ? (
                        new Date(notification.deadline_time || notification.deadline_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        "No deadline"
                      )}
                    </>
                  )}
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
      const projectId = item.project_id ||
        item.get_instance_id ||
        item.instance_id ||
        item.task_project_id ||
        item.related_project_id;

      const taskId = item.task_id ||
        item.id ||
        item.instance_id;

      if (projectId) {
        // Navigate to specific project's tasks
        navigate(`/tasks/${String(projectId)}/`);
      } else if (taskId) {
        // Fallback: navigate to tasks with task ID as query parameter
        navigate(`/tasks?task_id=${String(taskId)}`);
      } else {
        // Last fallback: navigate to general tasks page
        console.warn('No project_id or task_id found in notification:', item);
        navigate('/tasks');
      }
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
                        <img
                          src={item.display_image || "https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg"}
                          alt="Notification"
                          className="w-15 h-15 object-cover rounded-xl"
                        />
                      </div>

                      {/* Middle content */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-[15px] text-gray-900 flex items-start sm:items-center gap-2">
                          <span className="line-clamp-1">{item.title}</span>
                          {(item.is_read === false ||
                            item.read === false ||
                            item.status === "unread") && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></span>
                            )}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mt-1">
                          {item.description || item.message || "No description available."}
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
                        <div className="flex-shrink-0">
                          <button
                            onClick={(e) => handleViewNotification(e, item)}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap min-w-[32px] sm:min-w-[auto] ${item.is_read
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : item.notification_type === "task" || item.notification_type === "task_assigned"
                                  ? "bg-green-100 text-green-600 hover:bg-green-200"
                                  : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                      ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            <div className="group flex items-center gap-1 cursor-pointer">
                              <span className="text-[12px] font-medium">
                                View
                              </span>
                              <span className="sm:hidden text-sm font-bold">
                                {item.is_read
                                  ? ""
                                  : item.notification_type === "task" || item.notification_type === "task_assigned"
                                    ? <svg width="15" height="15" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M22 27.1798L19.41 24.5898L18 25.9998L22 29.9998L30 21.9998L28.59 20.5898L22 27.1798Z" fill="#00C300" />
                                      <path d="M25 5H22V4C21.9984 3.47005 21.7872 2.96227 21.4125 2.58753C21.0377 2.2128 20.5299 2.00158 20 2H12C11.4701 2.00158 10.9623 2.2128 10.5875 2.58753C10.2128 2.96227 10.0016 3.47005 10 4V5H7C6.47005 5.00158 5.96227 5.2128 5.58753 5.58753C5.2128 5.96227 5.00158 6.47005 5 7V28C5.00158 28.5299 5.2128 29.0377 5.58753 29.4125C5.96227 29.7872 6.47005 29.9984 7 30H16V28H7V7H10V10H22V7H25V18H27V7C26.9984 6.47005 26.7872 5.96227 26.4125 5.58753C26.0377 5.2128 25.5299 5.00158 25 5ZM20 8H12V4H20V8Z" fill="#00C300" />
                                    </svg>
                                    : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                      ? <svg width="15" height="15" className="sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.3333 2.66602V7.99935M10.6667 2.66602V7.99935M4 13.3327H28M6.66667 5.33268H25.3333C26.8061 5.33268 28 6.52659 28 7.99935V26.666C28 28.1388 26.8061 29.3327 25.3333 29.3327H6.66667C5.19391 29.3327 4 28.1388 4 26.666V7.99935C4 6.52659 5.19391 5.33268 6.66667 5.33268Z" stroke="#D37B14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                        ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M1 19L6 14M11.259 16.871C7.515 16.021 3.979 12.485 3.129 8.74105C2.994 8.14905 2.927 7.85305 3.122 7.37205C3.316 6.89205 3.555 6.74205 4.031 6.44505C5.107 5.77305 6.273 5.55905 7.482 5.66505C9.179 5.81605 10.028 5.89105 10.452 5.67005C10.875 5.45005 11.162 4.93405 11.738 3.90305L12.466 2.59605C12.946 1.73605 13.186 1.30505 13.751 1.10205C14.316 0.899049 14.656 1.02205 15.336 1.26805C16.1175 1.54866 16.8272 1.99865 17.4143 2.58577C18.0014 3.17288 18.4514 3.8826 18.732 4.66405C18.978 5.34405 19.101 5.68405 18.898 6.24905C18.695 6.81305 18.265 7.05305 17.404 7.53405L16.067 8.27905C15.037 8.85305 14.523 9.14105 14.302 9.56805C14.082 9.99605 14.162 10.826 14.322 12.486C14.44 13.706 14.237 14.88 13.556 15.97C13.258 16.446 13.109 16.684 12.628 16.879C12.148 17.073 11.852 17.006 11.259 16.871Z" stroke="#1974FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        : "V"
                                }
                              </span>
                              <span className="hidden sm:inline">
                                {item.notification_type === "task" || item.notification_type === "task_assigned"
                                  ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.5 13.2L12.9 11.6L12 12.5L14.5 15L19 10.5L18.1 9.6L14.5 13.2Z" fill={item.is_read ? "#6B7280" : "#00C300"} />
                                    <path d="M16 3H14V2.5C14 2.22 13.78 2 13.5 2H6.5C6.22 2 6 2.22 6 2.5V3H4C3.45 3 3 3.45 3 4V17C3 17.55 3.45 18 4 18H9V16H4V4H6V6H14V4H16V11H18V4C18 3.45 17.55 3 16 3ZM13 5H7V2.5H13V5Z" fill={item.is_read ? "#6B7280" : "#00C300"} />
                                  </svg>
                                  : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                    ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M16 3V6M6 3V6M3 8H17M5 5H15C15.55 5 16 5.45 16 6V16C16 16.55 15.55 17 15 17H5C4.45 17 4 16.55 4 16V6C4 5.45 4.45 5 5 5Z" stroke={item.is_read ? "#6B7280" : "#D37B14"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                      ? <svg width="15" height="15" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 19L6 14M11.259 16.871C7.515 16.021 3.979 12.485 3.129 8.74105C2.994 8.14905 2.927 7.85305 3.122 7.37205C3.316 6.89205 3.555 6.74205 4.031 6.44505C5.107 5.77305 6.273 5.55905 7.482 5.66505C9.179 5.81605 10.028 5.89105 10.452 5.67005C10.875 5.45005 11.162 4.93405 11.738 3.90305L12.466 2.59605C12.946 1.73605 13.186 1.30505 13.751 1.10205C14.316 0.899049 14.656 1.02205 15.336 1.26805C16.1175 1.54866 16.8272 1.99865 17.4143 2.58577C18.0014 3.17288 18.4514 3.8826 18.732 4.66405C18.978 5.34405 19.101 5.68405 18.898 6.24905C18.695 6.81305 18.265 7.05305 17.404 7.53405L16.067 8.27905C15.037 8.85305 14.523 9.14105 14.302 9.56805C14.082 9.99605 14.162 10.826 14.322 12.486C14.44 13.706 14.237 14.88 13.556 15.97C13.258 16.446 13.109 16.684 12.628 16.879C12.148 17.073 11.852 17.006 11.259 16.871Z" stroke={item.is_read ? "#6B7280" : "#1974FD"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      : ""
                                }
                              </span>
                            </div>
                          </button>
                        </div>
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