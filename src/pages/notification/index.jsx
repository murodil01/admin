import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { getNotificationsAll } from "../../api/services/notificationsService";
import toast from "react-hot-toast";

const Notification = () => {
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Backenddan notificationlarni olish
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotificationsAll();
      setNotifications(data.results || data); 
    } catch {
      toast.error("Failed to fetch notifications!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 3);

  return (
    <div className="flex flex-col h-[80vh] ">
      {/* Title */}
      <h1 className="text-black text-[25px] font-semibold">Notifications</h1>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2 pt-4">
        {loading ? (
          <p className="text-gray-500 text-[18px] font-bold">Loading...</p>
        ) : displayedNotifications.length > 0 ? (
          displayedNotifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-[16px] px-[16px] py-[20px] border border-[#dcdcdc] rounded-[8px]"
            >
              <img
                src={
                  item.display_image ||
                  "https://avatars.mds.yandex.net/i?id=17ce2915d8a8ee46c05a880825f4bdf63150c0be-9863899-images-thumbs&n=13"
                }
                alt={item.title}
                className="w-[72px] h-[76px] object-cover"
              />
              <div className="flex flex-col">
                <h3 className="font-semibold text-[17px] text-black">
                  {item.title}
                </h3>
                <p className="text-[#878787] text-[12px] font-[400]">
                  {item.description}
                </p>
                <span className="text-[#4E4E4E] text-[10px] font-[400] flex items-center gap-[2px]">
                  <Calendar size={10} />{" "}
                  {new Date(item.created_time).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No notifications found.</p>
        )}
      </div>

      {/* Button */}
      {notifications.length > 3 && (
        <div className="mt-4 flex justify-start">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-[#0061FE] text-white w-full max-w-[250px] h-[40px] rounded-[10px] text-[15px] font-normal"
          >
            {showAll ? "Show less" : "View more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;
