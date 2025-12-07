import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Assignee from "./Assignee";
import Subtasks from "./Subtasks";
import { useApi } from "../../components/hooks/useApi";
import { format } from "date-fns";
import Avatar from "../../components/common/Avatar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TaskDetail = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const { data: taskData, loading, error, refetch } = useApi(
        id ? `${API_BASE_URL}/api/tasks/${id}` : null
    );

    useEffect(() => {
        if (taskData) {
            setTask(taskData);
        }
    }, [taskData]);

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    const priorityColors = {
        Urgent: "bg-red-100 text-red-800 border-red-300",
        High: "bg-orange-100 text-orange-800 border-orange-300",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Low: "bg-green-100 text-green-800 border-green-300",
    };

    const statusColors = {
        "To Do": "bg-gray-100 text-gray-800 border-gray-300",
        "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
        Done: "bg-green-100 text-green-800 border-green-300",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <p>Error loading task: {error.message}</p>
                    <button
                        onClick={refetch}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-6">
                <p className="text-gray-500">No task found</p>
            </div>
        );
    }

    const formatDateTime = () => {
        if (!task.due_date) return "No due date";

        const date = new Date(task.due_date);
        const formattedDate = format(date, "MMM dd, yyyy");

        if (task.due_time) {
            return `${formattedDate} at ${task.due_time.substring(0, 5)}`;
        }

        return formattedDate;
    };

    const safeFormatDate = (dateValue, formatString = "MMM dd, yyyy HH:mm", fallback = "N/A") => {
        if (!dateValue) return fallback;
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return fallback;
            return format(date, formatString);
        } catch (error) {
            return fallback;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Back button or breadcrumb */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content - Left side (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task title and actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                                <button className="text-gray-500 hover:text-gray-700 p-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Status and Priority badges */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[task.status]}`}>
                                    {task.status}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>
                                {task.project && (
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                                        {task.project.name}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {task.description || "No description provided"}
                                    </p>
                                </div>
                            </div>

                            {/* Subtasks section */}
                            <div className="mb-6">
                                <Subtasks taskId={task.id} creator={task.creator} assignees={task.assignees} refetch={refetch} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right side (1/3) */}
                    <div className="space-y-6">
                        {/* Due date card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Due Date</h2>
                            <div className="flex items-center text-gray-700">
                                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">{formatDateTime()}</span>
                            </div>
                        </div>

                        {/* Assignees card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Assignees</h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                    {task.assignees?.length || 0}
                                </span>
                            </div>
                            <Assignee assignees={task.assignees} taskId={task.id} refetch={refetch} />
                        </div>

                        {/* Task details card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Created by</p>
                                    <div className="flex items-center mt-1">
                                        {task.creator?.avatar ? (
                                            <img
                                                src={task.creator.avatar}
                                                alt={task.creator.display_name}
                                                className="w-8 h-8 rounded-full mr-3"
                                            />
                                        ) : (
                                            <Avatar
                                                name={task.creator.display_name}
                                                size={6}
                                                className="mr-3"
                                            />
                                        )}
                                        <span className="font-medium text-gray-900">{task.creator?.display_name}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Created at</p>
                                    <p className="font-medium text-gray-900">
                                        {safeFormatDate(task.created_at)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Last updated</p>
                                    <p className="font-medium text-gray-900">
                                        {safeFormatDate(task.updated_at)}
                                    </p>
                                </div>

                                {task.project && (
                                    <div>
                                        <p className="text-sm text-gray-500">Project</p>
                                        <div className="flex items-center mt-1">
                                            <Avatar
                                                name={task.project.name}
                                                size={6}
                                                className="mr-3"
                                            />
                                            <span className="font-medium text-gray-900">{task.project.name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaskDetail;