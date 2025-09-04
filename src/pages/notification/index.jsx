import { FiSearch } from "react-icons/fi";
import { FiBell } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, X, Eye } from "lucide-react";
import { getNotificationsAll, markAllRead, markNotificationAsRead } from "../../api/services/notificationsService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

const Notification = ({ onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

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
      <div className="flex flex-col h-[90vh] mt-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
          <FiBell className="text-[#0061fe]" size={28} />
          {/* Tabs */}
          <div className="border-b border-gray-200 w-full">
            <ul className="flex items-center justify-around text-sm font-semibold">
              <li
                className={`cursor-pointer py-3 transition-colors ${activeTab === 'all'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('all')}
              >
                All
              </li>
              <li
                className={`cursor-pointer py-3 transition-colors ${activeTab === 'task'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('task')}
              >
                Task
              </li>
              <li
                className={`cursor-pointer py-3 transition-colors ${activeTab === 'project'
                  ? 'text-[#0061fe] border-b-2 border-[#0061fe]'
                  : 'text-gray-500 hover:text-[#0061fe]'
                  }`}
                onClick={() => handleTabChange('project')}
              >
                Project
              </li>
              <li
                className={`cursor-pointer py-3 transition-colors ${activeTab === 'events'
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
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {loading ? (
            <p className="text-gray-500 text-center font-medium">Loading...</p>
          ) : filteredNotifications.length > 0 ? (
            groupNotificationsByDate(filteredNotifications).map((group) => (
              <div key={group.date} className="space-y-4">
                {/* Date Title */}
                <div className="px-4">
                  <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {group.dateTitle}
                  </h2>
                </div>

                {/* Notifications for this date */}
                <div className="space-y-3 px-4">
                  {group.notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-shadow ${item.is_read === false ||
                        item.read === false ||
                        item.status === "unread"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 opacity-80 hover:opacity-100"
                        }`}
                    >
                      {/* Left icon or image */}
                      <div className="flex-shrink-0">
                        {(item.notification_type === "task" || item.notification_type === "task_assigned") && (
                          <div className="flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 27.1798L19.41 24.5898L18 25.9998L22 29.9998L30 21.9998L28.59 20.5898L22 27.1798Z" fill="#00C300" />
                              <path d="M25 5H22V4C21.9984 3.47005 21.7872 2.96227 21.4125 2.58753C21.0377 2.2128 20.5299 2.00158 20 2H12C11.4701 2.00158 10.9623 2.2128 10.5875 2.58753C10.2128 2.96227 10.0016 3.47005 10 4V5H7C6.47005 5.00158 5.96227 5.2128 5.58753 5.58753C5.2128 5.96227 5.00158 6.47005 5 7V28C5.00158 28.5299 5.2128 29.0377 5.58753 29.4125C5.96227 29.7872 6.47005 29.9984 7 30H16V28H7V7H10V10H22V7H25V18H27V7C26.9984 6.47005 26.7872 5.96227 26.4125 5.58753C26.0377 5.2128 25.5299 5.00158 25 5ZM20 8H12V4H20V8Z" fill="#00C300" />
                            </svg>
                          </div>
                        )}
                        {(item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned") && (
                          <div className="flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M26.668 4H5.33464C3.86397 4 2.66797 5.196 2.66797 6.66667V25.3333C2.66797 26.804 3.86397 28 5.33464 28H26.668C28.1386 28 29.3346 26.804 29.3346 25.3333V6.66667C29.3346 5.196 28.1386 4 26.668 4ZM5.33464 25.3333V6.66667H26.668L26.6706 25.3333H5.33464Z" fill="#0061FE" />
                              <path d="M8 9.33398H24V12.0007H8V9.33398ZM8 14.6673H24V17.334H8V14.6673ZM8 20.0007H16V22.6673H8V20.0007Z" fill="#0061FE" />
                            </svg>
                          </div>
                        )}
                        {(item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled") && (
                          <div className="flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21.3333 2.66602V7.99935M10.6667 2.66602V7.99935M4 13.3327H28M6.66667 5.33268H25.3333C26.8061 5.33268 28 6.52659 28 7.99935V26.666C28 28.1388 26.8061 29.3327 25.3333 29.3327H6.66667C5.19391 29.3327 4 28.1388 4 26.666V7.99935C4 6.52659 5.19391 5.33268 6.66667 5.33268Z" stroke="#D37B14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Middle content */}
                      <div className="flex flex-col flex-1">
                        <h3 className="font-semibold text-[15px] text-gray-900 flex items-center">
                          {item.title}
                          {(item.is_read === false ||
                            item.read === false ||
                            item.status === "unread") && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {item.description || item.message}
                        </p>
                        <span className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {new Date(item.event_time || item.deadline_time).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Right action button */}
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            // Navigate based on notification type
                            if (item.notification_type === "task" || item.notification_type === "task_assigned") {
                              navigate(`/tasks/:projectId`);
                            } else if (item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned") {
                              navigate(`/tasks`);
                            } else if (item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled") {
                              navigate(`/calendar`);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${item.notification_type === "task" || item.notification_type === "task_assigned"
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                              : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                                ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          View{" "}
                          {item.notification_type === "task" || item.notification_type === "task_assigned"
                            ? "Task"
                            : item.notification_type === "event" || item.notification_type === "event_created" || item.notification_type === "event_updated" || item.notification_type === "event_cancelled"
                              ? "Event"
                              : item.notification_type === "project" || item.notification_type === "project_created" || item.notification_type === "project_assigned"
                                ? "Project"
                                : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">
              {activeTab === 'all' ? 'No notifications found.' : `No ${activeTab} notifications found.`}
            </p>
          )}
        </div>

        {/* Mark all as read button - only show if there are unread notifications */}
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="m-4 flex items-center justify-center text-[#0061FE] font-medium transition-colors cursor-pointer hover:text-[#76abff]"
          >
            Mark all as read
          </button>
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