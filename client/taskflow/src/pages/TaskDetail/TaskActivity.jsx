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
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {action}{" "}
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider border border-transparent dark:border-slate-700">{details?.to || ''}</span>
                    </p>
                );
            case "priority_change":
                return (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {action}{" "}
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider border border-transparent dark:border-slate-700">{details?.to || ''}</span>
                    </p>
                );
            case "assignee_added":
            case "assignee_removed":
                return (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {action}
                    </p>
                );
            case "due_date":
                return (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                        {action}
                    </p>
                );
            case "comment":
                return (
                    <div className="mt-1">
                        <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mb-1">{action}:</p>
                        <p className="text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                            "{details?.comment || ''}"
                        </p>
                    </div>
                );
            case "created":
                return <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{action}</p>;
            default:
                return <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{action}</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50 transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-none flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-800">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                    <div>
                        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <LuSquareActivity size={14} className="text-blue-600 dark:text-blue-400" /> Activity Log
                        </h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[280px] font-semibold">
                            {taskTitle || "Task History"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-sm text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Close"
                    >
                        <FaTimes className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <ClipLoader color="#2563eb" size={40} speedMultiplier={0.8} />
                            <p className="text-xs text-slate-400 font-semibold">Loading task activities...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-sm p-6">
                            <p className="text-xs text-rose-600 dark:text-rose-450 font-bold uppercase tracking-wider">Failed to load activity history.</p>
                            <p className="text-[10px] text-rose-400 mt-1 font-semibold">{error.message}</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm p-6">
                            <LuSquareActivity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">No Activity Recorded</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Actions taken on this task will appear here.</p>
                        </div>
                    ) : (
                        <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6 before:absolute before:top-0 before:bottom-0 before:left-[-1px]">
                            {activities.map((activity) => (
                                <div key={activity.id} className="relative group py-0.5">
                                    {/* Icon Badge */}
                                    <span className="absolute left-[-24px] top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-none group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors flex items-center justify-center z-10">
                                        {getActivityIcon(activity.type)}
                                    </span>

                                    {/* Activity Card */}
                                    <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-sm p-4 shadow-none hover:shadow-none transition-colors hover:bg-slate-100/40 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    name={activity.user?.display_name || activity.user?.email || "System"}
                                                    url={activity.user?.avatar}
                                                    size={6}
                                                    className="rounded-sm"
                                                />
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {activity.user?.display_name || activity.user?.email || "System"}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-450 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm border border-transparent dark:border-slate-800 uppercase tracking-wider">
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