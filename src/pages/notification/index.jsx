import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { getNotificationsAll, markAllRead } from "../../api/services/notificationsService";
import toast from "react-hot-toast";

const Notification = ({ onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // 🔹 Backenddan notificationlarni olish
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

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      // Update local state to mark all as read instead of refetching
      const updatedNotifications = notifications.map(item => ({ ...item, is_read: true }));
      setNotifications(updatedNotifications);
      setHasUnread(false);
      toast.success("All notifications marked as read!");

      // Notify parent component about the update with the updated notifications
      if (onNotificationUpdate) {
        onNotificationUpdate(updatedNotifications);
      }
    } catch {
      toast.error("Failed to mark all as read!");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
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
              className={`flex items-start gap-[16px] px-[16px] py-[20px] border border-[#dcdcdc] rounded-[12px] ${item.is_read === false || item.read === false || item.status === "unread"
                  ? "bg-blue-50"
                  : "opacity-70"
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
              <div className="flex flex-col">
                <h3 className="font-semibold text-[17px] text-black">
                  {item.title}
                  {(item.is_read === false || item.read === false || item.status === "unread") && (
                    <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </h3>
                <p className="text-[#878787] text-[12px] font-[400]">
                  {item.description || item.message}
                </p>
                <span className="text-[#4E4E4E] text-[10px] font-[400] flex items-center gap-[2px]">
                  <Calendar size={10} />{" "}
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
          className="self-start flex items-center gap-2 px-4 py-2 bg-[#0061FE] rounded-[10px] text-white cursor-pointer my-4"
        >
          {/* <CheckCircle size={16} /> */}
          Mark all as read
        </button>
      )}
    </div>
  );
};

export default Notification;