import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Assignee from "./Assignee";
import Subtasks from "./Subtasks";
import { useApi } from "../../components/hooks/useApi";
import { format } from "date-fns";
import Avatar from "../../components/common/Avatar";
import { BsThreeDotsVertical } from "react-icons/bs";
import TaskInfoAction from "./TaskInfoAction";
import EditTaskInfoModal from "../../components/modals/EditTaskInfoModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { FaProjectDiagram } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: taskData, loading, error, refetch } = useApi(
        id ? `${API_BASE_URL}/api/tasks/${id}` : null
    );

    const { makeRequest: deleteTask, loading: deleteLoading } = useApi();

    useEffect(() => {
        if (taskData) {
            setTask(taskData);
        }
    }, [taskData]);

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    const isCreator = task?.creator?.id === currentUser.id;
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

    const handleDeleteTask = async () => {
        try {
            await deleteTask(`/api/tasks/${id}/`, "DELETE");
            navigate("/");
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowActionMenu(!showActionMenu);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <BsThreeDotsVertical className="w-5 h-5" />
                                    </button>
                                    <TaskInfoAction
                                        showActionMenu={showActionMenu}
                                        setShowActionMenu={setShowActionMenu}
                                        onEdit={() => setShowEditModal(true)}
                                        onDelete={() => setShowDeleteModal(true)}
                                        task={task}
                                    />
                                </div>
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
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-2">
                                        <FaProjectDiagram className="w-4 h-4" />
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

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">Created at: {safeFormatDate(task.created_at)}</div>
                                <div className="text-sm text-gray-500">Updated at: {safeFormatDate(task.updated_at)}</div>
                            </div>
                        </div>
                        {/* Subtasks section */}
                        <div className="mb-6 border border-gray-200 rounded-lg p-6 bg-white">
                            <Subtasks taskId={task.id} creator={task.creator} assignees={task.assignees} refetch={refetch} />
                        </div>
                    </div>

                    {/* Sidebar - Right side (1/3) */}
                    <div className="space-y-6">
                        {/* Due date card */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Due Date</h2>
                            {(() => {
                                const now = new Date();
                                const dueDate = new Date(task.due_date);
                                const isCompleted = task.status === 'Done' || task.status === 'Completed';

                                const isTodayDate = dueDate.toDateString() === now.toDateString();

                                if (task.due_time) {
                                    const [hours, minutes] = task.due_time.split(':');
                                    dueDate.setHours(hours, minutes, 0);
                                } else {
                                    dueDate.setHours(23, 59, 59, 999);
                                }

                                const isOverdue = dueDate < now && !isCompleted;
                                const isDueToday = isTodayDate && !isOverdue && !isCompleted;

                                let textColor = 'text-gray-700';
                                let iconColor = 'text-gray-400';
                                let label = null;

                                if (isOverdue) {
                                    textColor = 'text-red-600';
                                    iconColor = 'text-red-500';
                                    label = <span className="ml-2 text-sm font-semibold text-red-600">(Overdue)</span>;
                                } else if (isDueToday) {
                                    textColor = 'text-purple-600';
                                    iconColor = 'text-purple-500';
                                    label = <span className="ml-2 text-sm font-semibold text-purple-600">(Today)</span>;
                                }

                                return (
                                    <div className={`flex items-center ${textColor}`}>
                                        <svg className={`w-5 h-5 mr-3 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">
                                            {formatDateTime()}
                                            {label}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Creator and Assignees Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
                            {/* Creator */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">
                                    Created by
                                </p>

                                <div className="flex items-center gap-3">
                                    {task.creator?.avatar ? (
                                        <img
                                            src={task.creator.avatar}
                                            alt={task.creator.display_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <Avatar
                                            name={task.creator.display_name}
                                            size={10}
                                        />
                                    )}

                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 text-base">
                                            {task.creator?.display_name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {task.creator?.email}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-200" />

                            {/* Assignees */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-sm font-semibold">
                                        Assignees
                                    </h2>

                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {task.assignees?.length || 0}
                                    </span>
                                </div>

                                <Assignee
                                    assignees={task.assignees}
                                    taskId={task.id}
                                    refetch={refetch}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {task && (
                <EditTaskInfoModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    task={task}
                    onUpdate={refetch}
                />
            )}

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default TaskDetail;