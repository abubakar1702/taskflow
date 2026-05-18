import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import { Link } from "react-router-dom";
import { FaPlus, FaExclamationCircle, FaClipboardList, FaCalendarAlt, FaClock, FaPaperclip } from "react-icons/fa";
import TaskCard from "../components/task/TaskCard";
import FilterBar from "../components/task/filter/FilterBar";
import LoadingScreen from "../components/common/LoadingScreen";
import Avatar from "../components/common/Avatar";
import { PRIORITY_COLORS, STATUS_COLORS } from "../components/constants/uiColors";

const Tasks = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem("tasks_view_mode") || "grid";
    });
    const [filters, setFilters] = useState({ priority: "", status: "", due_today: false, overdue: false, project_id: "" });
    const [sortBy, setSortBy] = useState("Date Created (Desc)");

    useEffect(() => {
        localStorage.setItem("tasks_view_mode", viewMode);
    }, [viewMode]);

    const mapSortToApi = (sortLabel) => {
        const sortMapping = {
            "Date Created": "created_at",
            "Date Created (Desc)": "-created_at",
            "Due Date": "due_date",
            "Due Date (Desc)": "-due_date",
        };
        return sortMapping[sortLabel] || "-created_at";
    };

    const queryString = useMemo(() => {
        const query = new URLSearchParams();
        if (filters.priority) query.append("priority", filters.priority);
        if (filters.status) query.append("status", filters.status);
        if (filters.due_today) query.append("due_today", "true");
        if (filters.overdue) query.append("overdue", "true");
        if (filters.project_id) query.append("project_id", filters.project_id);
        if (activeTab === "Assigned to me") query.append("assigned_to_me", "true");
        if (activeTab === "Created by me") query.append("created_by_me", "true");
        const apiSort = mapSortToApi(sortBy);
        if (apiSort) query.append("ordering", apiSort);
        return query.toString();
    }, [activeTab, filters, sortBy]);

    const { data: tasksData = [], isLoading: loading, error } = useQuery({
        queryKey: QUERY_KEYS.tasks(queryString),
        queryFn: async () => (await apiClient.get(`/api/tasks/?${queryString}`)).data,
        placeholderData: (prev) => prev,
    });
    const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.results || []);

    const onFilterUpdate = (newActiveTab, newFilters, newSortBy) => {
        setActiveTab(newActiveTab);
        setFilters(newFilters);
        setSortBy(newSortBy);
    };

    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const formatTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isOverdue = (task) => {
        if (!task.due_date) return false;
        const now = new Date();
        const dueDateTime = new Date(`${task.due_date}T${task.due_time || "23:59:59"}`);
        return now > dueDateTime && task.status !== "Done";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tasks{" "}
                        {!loading && tasks && (
                            <span className="text-gray-400 dark:text-slate-500 font-medium text-2xl ml-2">({tasks.length})</span>
                        )}
                    </h1>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link to="/new-task/">
                            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow active:scale-95 transform transition-transform">
                                <FaPlus className="w-3.5 h-3.5" /> New Task
                            </button>
                        </Link>
                    </div>
                </div>

                <FilterBar onFilterUpdate={onFilterUpdate} viewMode={viewMode} setViewMode={setViewMode} />

                <div className="mt-6 min-h-[50vh] relative">
                    {loading ? (
                        <LoadingScreen message="Loading tasks..." height="60vh" />
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to load tasks</h3>
                            <p className="text-red-700 mb-4">{error.response?.data?.detail || error.message}</p>
                            <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                Try Again
                            </button>
                        </div>
                    ) : !tasks || tasks.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-800">
                            <div className="bg-blue-50 dark:bg-blue-950/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaClipboardList className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
                            <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                                You don't have any tasks matching your filters. Create a new task to get started.
                            </p>
                            <Link to="/new-task/">
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer shadow-sm">
                                    Create First Task
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {tasks.map((task) => <TaskCard key={task.id} {...task} />)}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-md shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 px-6 py-3">
                                        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                            <div className="col-span-4">Title</div>
                                            <div className="col-span-1">Status</div>
                                            <div className="col-span-1">Priority</div>
                                            <div className="col-span-2">Project</div>
                                            <div className="col-span-2">Creator</div>
                                            <div className="col-span-1">Due Date</div>
                                            <div className="col-span-1">Assignees</div>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-4">
                                                        <Link to={`/tasks/${task.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 block">
                                                            {task.title}
                                                        </Link>
                                                        <div className="flex items-center gap-2">
                                                            {task.total_assets > 0 && (
                                                                <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                                                                    <FaPaperclip className="w-3 h-3" />
                                                                    <span className="text-xs">({task.total_assets})</span>
                                                                </div>
                                                            )}
                                                            {task.subtasks?.length > 0 && (
                                                                <div className="flex text-xs items-center gap-1.5 text-gray-400 mt-1">
                                                                    Subtasks: <span>{task.subtasks?.filter((st) => st.status === "Done").length || 0} / {task.subtasks?.length || 0}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[task.status]}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${PRIORITY_COLORS[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate block">
                                                            {task.project?.name || "No Project"}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar name={task.creator?.display_name} url={task.creator?.avatar} size={6} />
                                                            <span className="text-sm text-gray-700 dark:text-slate-300 truncate">{task.creator?.display_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1">
                                                        {task.due_date ? (
                                                            <div className={`text-sm ${isOverdue(task) ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-slate-400"}`}>
                                                                <div className="flex items-center gap-1">
                                                                    <FaCalendarAlt className="w-3 h-3" />
                                                                    <span className="text-xs">{formatDate(task.due_date)}</span>
                                                                </div>
                                                                {task.due_time && (
                                                                    <div className="flex items-center gap-1 mt-0.5">
                                                                        <FaClock className="w-3 h-3" />
                                                                        <span className="text-xs">{formatTime(task.due_time)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-slate-600">-</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1">
                                                        {task.assignees && task.assignees.length > 0 ? (
                                                            <div className="flex items-center -space-x-2">
                                                                {task.assignees.slice(0, 3).map((assignee, index) => (
                                                                    <div key={assignee.id} className="relative ring-2 ring-white dark:ring-slate-900 rounded-full" style={{ zIndex: 3 - index }}>
                                                                        <Avatar name={assignee.display_name} url={assignee.avatar} size={6} />
                                                                    </div>
                                                                ))}
                                                                {task.assignees.length > 3 && (
                                                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-slate-300" style={{ zIndex: 0 }}>
                                                                        +{task.assignees.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 dark:text-slate-600 italic">None</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;