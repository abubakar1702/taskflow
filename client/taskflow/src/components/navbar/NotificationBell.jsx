import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import Notifications from "../notification/Notifications";
import { useApi } from "../hooks/useApi";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);

    // Fetch notifications using useApi hook
    const { data, loading, refetch } = useApi('/api/notifications/', 'GET', null, []);
    const notifications = data || [];

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-200 ${isOpen
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                aria-label="Toggle notifications"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <Notifications
                    notifications={notifications}
                    loading={loading}
                    onClose={() => setIsOpen(false)}
                    refetch={refetch}
                />
            )}
        </div>
    );
};

export default NotificationBell;
