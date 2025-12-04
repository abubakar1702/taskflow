import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "../components/hooks/useApi";
import {
    FaArrowLeft,
    FaEdit,
    FaTrash,
    FaCalendarAlt,
    FaClock,
    FaCheckCircle,
    FaCircle,
    FaUser,
    FaProjectDiagram,
    FaExclamationCircle,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Task = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedSubtask, setSelectedSubtask] = useState(null);

    const {
        data: task,
        loading,
        error,
        refetch,
        makeRequest,
    } = useApi(`${API_BASE_URL}/api/tasks/${id}/`, "GET", null, [id]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800 border-red-300";
            case "Medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "Low":
                return "bg-green-100 text-green-800 border-green-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "To Do":
                return "bg-blue-100 text-blue-800";
            case "In Progress":
                return "bg-purple-100 text-purple-800";
            case "Done":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not set";
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "Not set";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isOverdue = () => {
        if (!task?.due_date) return false;
        const now = new Date();
        const dueDateTime = new Date(`${task.due_date}T${task.due_time || "23:59:59"}`);
        return now > dueDateTime && task.status !== "Done";
    };

    const handleDeleteTask = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await makeRequest(`${API_BASE_URL}/api/tasks/${id}/`, "DELETE");
            toast.success("Task deleted successfully!");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            toast.error("Failed to delete task");
            console.error(err);
        }
    };

    const toggleSubtask = async (subtaskId, currentStatus) => {
        try {
            await makeRequest(
                `${API_BASE_URL}/api/subtasks/${subtaskId}/`,
                "PATCH",
                { is_completed: !currentStatus }
            );
            refetch();
            toast.success("Subtask updated!");
        } catch (err) {
            toast.error("Failed to update subtask");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <ClipLoader color="#2563EB" size={60} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                        <FaExclamationCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
                        <h3 className="text-xl font-medium text-red-900 mb-2">
                            Failed to load task
                        </h3>
                        <p className="text-red-700 mb-6">
                            {error.data?.detail || error.message || "An error occurred"}
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-500">Task not found</p>
                </div>
            </div>
        );
    }

    const completedSubtasks = task.subtasks?.filter((st) => st.is_completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const completionPercentage =
        totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Tasks</span>
                    </button>

                    <div className="flex gap-3">
                        <Link to={`/tasks/${id}/edit`}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <FaEdit />
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={handleDeleteTask}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FaTrash />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Info Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getPriorityColor(
                                        task.priority
                                    )}`}
                                >
                                    {task.priority} Priority
                                </span>
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                                        task.status
                                    )}`}
                                >
                                    {task.status}
                                </span>
                                {isOverdue() && (
                                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        Overdue
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {task.title}
                            </h1>

                            {task.description && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {task.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Subtasks */}
                        {totalSubtasks > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Subtasks
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {completedSubtasks}/{totalSubtasks} completed
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Subtask List */}
                                <div className="space-y-3">
                                    {task.subtasks.map((subtask) => (
                                        <div
                                            key={subtask.id}
                                            className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <button
                                                onClick={() =>
                                                    toggleSubtask(subtask.id, subtask.is_completed)
                                                }
                                                className="mt-1 flex-shrink-0"
                                            >
                                                {subtask.is_completed ? (
                                                    <FaCheckCircle className="text-green-600 text-xl" />
                                                ) : (
                                                    <FaCircle className="text-gray-300 text-xl" />
                                                )}
                                            </button>

                                            <div className="flex-grow">
                                                <p
                                                    className={`font-medium ${subtask.is_completed
                                                        ? "line-through text-gray-500"
                                                        : "text-gray-900"
                                                        }`}
                                                >
                                                    {subtask.text}
                                                </p>
                                                {subtask.assignee && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {subtask.assignee.avatar ? (
                                                            <img
                                                                src={subtask.assignee.avatar}
                                                                alt={subtask.assignee.display_name}
                                                                className="w-6 h-6 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                {subtask.assignee.display_name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")
                                                                    .toUpperCase()
                                                                    .slice(0, 2)}
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-600">
                                                            {subtask.assignee.display_name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Project Info */}
                        {task.project && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaProjectDiagram className="text-blue-600" />
                                    Project
                                </h3>
                                <Link
                                    to={`/projects/${task.project.id}`}
                                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-200"
                                >
                                    <p className="font-medium text-gray-900">
                                        {task.project.name}
                                    </p>
                                    {task.project.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {task.project.description}
                                        </p>
                                    )}
                                </Link>
                            </div>
                        )}

                        {/* Due Date & Time */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaCalendarAlt className="text-blue-600" />
                                Due Date
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <span>{formatDate(task.due_date)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FaClock className="text-gray-400" />
                                    <span>{formatTime(task.due_time)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Assignees */}
                        {task.assignees && task.assignees.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaUser className="text-blue-600" />
                                    Assignees ({task.assignees.length})
                                </h3>
                                <div className="space-y-3">
                                    {task.assignees.map((assignee) => (
                                        <div
                                            key={assignee.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                                        >
                                            {assignee.avatar ? (
                                                <img
                                                    src={assignee.avatar}
                                                    alt={assignee.display_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {assignee.display_name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .slice(0, 2)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {assignee.display_name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {assignee.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Creator Info */}
                        {task.creator && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Created By
                                </h3>
                                <div className="flex items-center gap-3">
                                    {task.creator.avatar ? (
                                        <img
                                            src={task.creator.avatar}
                                            alt={task.creator.display_name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {task.creator.display_name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {task.creator.display_name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {task.creator.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-1 text-sm text-gray-600">
                                    <p>
                                        Created:{" "}
                                        {new Date(task.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <p>
                                        Updated:{" "}
                                        {new Date(task.updated_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default Task;
