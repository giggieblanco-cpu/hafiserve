import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, ShoppingBag, Hotel, ExternalLink, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../lib/api";
import { getCurrentUser } from "../lib/storage";

interface Notification {
  id: string;
  targetEmail: string;
  title: string;
  message: string;
  type: string;
  linkPath: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.email);
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 10s for new notifications (faster than before for real-time updates)
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) loadNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    await markAllNotificationsRead(user.email);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClickNotif = async (notif: Notification) => {
    if (!notif.read && user?.email) {
      await markNotificationRead(notif.id, user.email);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    if (notif.linkPath) {
      setOpen(false);
      navigate(notif.linkPath);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="size-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-green-600" />
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3" />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <Bell className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}

            {!loading && notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClickNotif(notif)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors flex gap-3 ${
                  !notif.read ? "bg-blue-50/50" : ""
                }`}
              >
                {/* Icon */}
                <div className={`mt-0.5 flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                  notif.type === "booking"
                    ? "bg-blue-100 text-blue-600"
                    : notif.type === "message"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {notif.type === "booking" ? (
                    <Hotel className="size-4" />
                  ) : notif.type === "message" ? (
                    <MessageCircle className="size-4" />
                  ) : (
                    <ShoppingBag className="size-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium leading-tight ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                      {notif.title}
                    </p>
                    {notif.linkPath && <ExternalLink className="size-3 text-gray-400 flex-shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
