import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckSquare, FiSettings } from 'react-icons/fi';
import NotificationCard from './NotificationCard';
import { useApi } from '../hooks/useApi';

const Notifications = ({ notifications: rawNotifications, loading, onClose, refetch }) => {
    const { makeRequest } = useApi();
    const notifications = rawNotifications || [];
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        try {
            await Promise.all(
                unreadNotifications.map(n => makeRequest(`/api/notifications/${n.id}/read/`, 'PATCH'))
            );
            if (refetch) refetch();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </h3>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                            title="Mark all as read"
                        >
                            <FiCheckSquare size={18} />
                        </button>
                    )}
                    <Link to="/settings" onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors" title="Notification Settings">
                        <FiSettings size={18} />
                    </Link>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col gap-2 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex gap-4">
                                <div className="rounded-full bg-gray-100 h-10 w-10 shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onUpdate={refetch}
                        />
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckSquare className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium whitespace-pre-wrap">All caught up!{"\n"}No new notifications.</p>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                <Link
                    to="/notifications"
                    onClick={onClose}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                    View all notifications
                </Link>
            </div>
        </div>
    );
};

export default Notifications;