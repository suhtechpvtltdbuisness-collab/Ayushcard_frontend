import React, { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";

const Topbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "New Application",
      message:
        "A new Health Card application has been submitted by Amit Kumar.",
      time: "10 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Donation Received",
      message: "A donation of ₹5,000 has been received from Renu Verma.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "System Update",
      message: "The system will undergo maintenance at 12:00 AM.",
      time: "5 hours ago",
      unread: false,
    },
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex justify-between items-center h-22.5 px-8 border-b border-[#F3F4F6] bg-[#FFFFFF]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <h1 className="text-[22px] font-bold text-[#22333B]">
        Good Morning Vivek!
      </h1>

      <div className="flex items-center gap-4">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-10 h-10 rounded-full bg-[#F2F4F3] flex items-center justify-center text-[#4B5563] hover:bg-gray-200 transition-colors relative cursor-pointer"
          >
            <Bell size={18} className="text-[#22333B]" />
            {notifications.some((n) => n.unread) && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#F68E5F] rounded-full"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#FFFCFB] border border-[#F3F4F6] rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center px-4 py-3 border-b border-[#F2F4F3] bg-[#FFFCFB]">
                <h3 className="font-semibold text-[#22333B] text-[15px]">
                  Notifications
                </h3>
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="text-gray-400 hover:text-[#22333B] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-[#F2F4F3] hover:bg-[#F2F4F3] cursor-pointer transition-colors ${notification.unread ? "bg-[#FFFCFB]" : "bg-[#FFFCFB]"}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`text-[14px] ${notification.unread ? "font-semibold text-[#22333B]" : "font-medium text-[#22333B]"}`}
                        >
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <span className="w-2 h-2 rounded-full bg-[#F68E5F] mt-1.5 shrink-0 shadow-sm shadow-[#F68E5F]/30"></span>
                        )}
                      </div>
                      <p className="text-[13px] text-[#22333B]/80 line-clamp-2 leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <span className="text-[11px] text-[#22333B]/60 font-medium">
                        {notification.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-[#22333B]/60 text-[14px]">
                    No new notifications
                  </div>
                )}
              </div>

              <div className="border-t border-[#F2F4F3] p-3 text-center bg-[#FFFCFB]">
                <button className="text-[13px] font-bold text-[#F68E5F] hover:text-[#e07b4d] transition-colors cursor-pointer">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D1D5DB]"></div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#22333B]">
              Admin User
            </span>
            <span className="text-[13px] text-[#22333B]/60">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
