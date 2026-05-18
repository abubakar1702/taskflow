import React from 'react';
import { FiMessageSquare, FiUserPlus, FiCalendar, FiClock, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { apiClient } from '../../utils/apiClient';

const NotificationCard = ({ notification, onUpdate }) => {
    const { id, type, message, created_at, is_read, data } = notification;

    const getIcon = () => {
        switch (type) {
            case 'comment':
            case 'new_comment':
                return <FiMessageSquare className="text-blue-500" />;
            case 'task_assigned':
            case 'assign':
                return <FiUserPlus className="text-purple-500" />;
            case 'deadline':
            case 'task_deadline':
                return <FiClock className="text-red-500" />;
            case 'status_change':
            case 'status':
                return <FiCheckCircle className="text-green-500" />;
            default:
                return <FiCalendar className="text-gray-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'comment':
            case 'new_comment': return 'bg-blue-50 dark:bg-blue-950/20';
            case 'task_assigned':
            case 'assign': return 'bg-purple-50 dark:bg-purple-950/20';
            case 'deadline':
            case 'task_deadline': return 'bg-red-50 dark:bg-red-950/20';
            case 'status_change':
            case 'status': return 'bg-green-50 dark:bg-green-950/20';
            default: return 'bg-gray-50 dark:bg-slate-800/40';
        }
    };

    const handleMarkAsRead = async (e) => {
        e.stopPropagation();
        if (is_read) return;
        try {
            await apiClient.patch(`/api/notifications/${id}/read/`);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        try {
            await apiClient.delete(`/api/notifications/${id}/delete/`);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <div
            onClick={handleMarkAsRead}
            className={`group p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer border-b border-gray-100 dark:border-slate-800 last:border-0 ${!is_read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getBgColor()}`}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-semibold truncate ${!is_read ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'}`}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="flex items-center gap-2">
                        {!is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" title="Unread"></span>
                        )}
                        <button
                            onClick={handleDelete}
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete notification"
                        >
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 mb-2">
                    {message}
                </p>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                        {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
                    </span>
                    {data?.assigned_by && (
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 italic">
                            by {data.assigned_by}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCard;