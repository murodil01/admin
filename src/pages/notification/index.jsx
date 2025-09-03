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
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificationsAll();
      const notificationsData = data.results || data || [];
      setNotifications(notificationsData);

      // Check if there are any unread notifications
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
  }, [onNotificationUpdate]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.is_read === false || notification.read === false || notification.status === "unread") {
      try {
        await markNotificationAsRead(notification.id);
        const updated = notifications.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        );
        setNotifications(updated);
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
        {/* Title */}
        <h1 className="text-black text-[25px] font-semibold">Notifications</h1>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-2 pr-2">
          {loading ? (
            <p className="text-gray-500 text-[18px] font-bold">Loading...</p>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-[16px] px-[16px] py-[20px] border border-[#dcdcdc] rounded-[12px] cursor-pointer hover:shadow-md transition-shadow ${item.is_read === false || item.read === false || item.status === "unread"
                    ? "bg-blue-50 border-blue-200"
                    : "opacity-70 hover:opacity-100"
                  }`}
              >
                <img
                  src={
                    item.display_image ||
                    "https://avatars.mds.yandex.net/i?id=17ce2915d8a8ee46c05a880825f4bdf63150c0be-9863899-images-thumbs&n=13"
                  }
                  alt={item.title}
                  className="w-[72px] h-[76px] object-cover rounded-xl"
                />
                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold text-[17px] text-black flex items-center">
                    {item.title}
                    {(item.is_read === false || item.read === false || item.status === "unread") && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </h3>
                  <p className="text-[#878787] text-[12px] font-[400] line-clamp-2">
                    {item.description || item.message}
                  </p>
                  <span className="text-[#4E4E4E] text-[10px] font-[400] flex items-center gap-[2px] mt-1">
                    <Calendar size={10} />
                    {new Date(item.created_time || item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No notifications found.</p>
          )}
        </div>

        {/* Mark all as read button - only show if there are unread notifications */}
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            className="self-start flex items-center gap-2 px-4 py-2 bg-[#0061FE] rounded-[10px] text-white cursor-pointer my-4 hover:bg-[#0051d1] transition-colors"
          >
            <CheckCircle size={16} />
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