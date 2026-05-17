import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { FaTimes, FaCheckCircle, FaUserPlus, FaClock, FaEdit, FaTrash, FaPaperclip, FaUserMinus } from "react-icons/fa";
import { LuSquareActivity } from "react-icons/lu";
import Avatar from "../../components/common/Avatar";
import { ClipLoader } from "react-spinners";

const TaskActivity = ({ isOpen, onClose, taskId, taskTitle }) => {
    if (!isOpen) return null;

    const { data: activitiesData, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.taskActivity(taskId),
        queryFn: async () => (await apiClient.get(`/api/tasks/${taskId}/activities/`)).data,
        enabled: !!taskId && isOpen,
    });

    const activities = Array.isArray(activitiesData) ? activitiesData : (activitiesData?.results || []);

    const getActivityIcon = (type) => {
        switch (type) {
            case "status_change":
                return <FaCheckCircle className="text-emerald-500 w-4 h-4" />;
            case "assignee_added":
                return <FaUserPlus className="text-blue-500 w-4 h-4" />;
            case "assignee_removed":
                return <FaUserMinus className="text-rose-500 w-4 h-4" />;
            case "due_date":
                return <FaClock className="text-amber-500 w-4 h-4" />;
            case "comment":
                return <LuSquareActivity className="text-purple-500 w-4 h-4" />;
            case "asset_added":
                return <FaPaperclip className="text-slate-500 w-4 h-4" />;
            case "priority_change":
                return <FaEdit className="text-amber-500 w-4 h-4" />;
            case "created":
                return <FaCheckCircle className="text-blue-500 w-4 h-4" />;
            default:
                return <LuSquareActivity className="text-slate-500 w-4 h-4" />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const renderActivityContent = (activity) => {
        const { type, action, details } = activity;

        switch (type) {
            case "status_change":
                return (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {action}{" "}
                        <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{details?.to || ''}</span>
                    </p>
                );
            case "priority_change":
                return (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {action}{" "}
                        <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{details?.to || ''}</span>
                    </p>
                );
            case "assignee_added":
            case "assignee_removed":
                return (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {action}
                    </p>
                );
            case "due_date":
                return (
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {action}
                    </p>
                );
            case "comment":
                return (
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{action}:</p>
                        <p className="text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400 italic">
                            "{details?.comment || ''}"
                        </p>
                    </div>
                );
            case "created":
                return <p className="text-sm text-slate-700 dark:text-slate-300">{action}</p>;
            default:
                return <p className="text-sm text-slate-700 dark:text-slate-300">{action}</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right border-l border-slate-200/80 dark:border-slate-800">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <LuSquareActivity className="text-blue-600 dark:text-blue-400" /> Activity Log
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[280px]">
                            {taskTitle || "Task History"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Close"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <ClipLoader color="#2563eb" size={40} speedMultiplier={0.8} />
                            <p className="text-xs text-slate-400 font-medium">Loading task activities...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-6">
                            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Failed to load activity history.</p>
                            <p className="text-[10px] text-rose-400 mt-1">{error.message}</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                            <LuSquareActivity className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Activity Recorded</p>
                            <p className="text-xs text-slate-400 mt-1">Actions taken on this task will appear here.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 before:absolute before:top-0 before:bottom-0 before:left-[-1px]">
                            {activities.map((activity) => (
                                <div key={activity.id} className="relative group">
                                    {/* Icon Badge */}
                                    <span className="absolute -left-[35px] top-1.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full p-1.5 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors flex items-center justify-center">
                                        {getActivityIcon(activity.type)}
                                    </span>

                                    {/* Activity Card */}
                                    <div className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-200/80 dark:hover:border-slate-700">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar
                                                    name={activity.user?.display_name || activity.user?.email || "System"}
                                                    url={activity.user?.avatar}
                                                    size={6}
                                                />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {activity.user?.display_name || activity.user?.email || "System"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                {formatTimestamp(activity.timestamp)}
                                            </span>
                                        </div>

                                        {renderActivityContent(activity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskActivity;