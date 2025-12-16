import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useApi } from "../../components/hooks/useApi";
import Assignee from "./Assignee";
import Subtasks from "./Subtasks";
import DeleteModal from "../../components/modals/DeleteModal";
import AssetSection from "./AssetSection";
import TaskCreator from "./TaskCreator";
import DueDate from "./DueDate";
import TaskInfo from "./TaskInfo";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { isCreator, isAssignee } = useTaskPermissions(task);

    const { data: taskData, loading, error, refetch } = useApi(
        id ? `${API_BASE_URL}/api/tasks/${id}` : null
    );

    const { makeRequest: deleteTask, loading: deleteLoading } = useApi();

    useEffect(() => {
        if (taskData) {
            setTask(taskData);
        }
    }, [taskData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <ClipLoader color="#021af3ff" size={100} />
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

    const handleDeleteTask = async () => {
        try {
            await deleteTask(`/api/tasks/${id}/`, "DELETE");
            navigate("/tasks");
            toast.success("Task deleted successfully");
        } catch (err) {
            console.error("Failed to delete task:", err);
            toast.error("Failed to delete task");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
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
                        <TaskInfo task={task} onUpdate={refetch} />

                        {/* Subtasks section */}
                        <div className="mb-6 shadow-sm border border-gray-200 rounded-lg p-6 bg-white">
                            <Subtasks task={task} taskId={task.id} creator={task.creator} assignees={task.assignees} refetch={refetch} />
                        </div>
                    </div>

                    {/* Sidebar - Right side (1/3) */}
                    <div className="space-y-6">
                        {/* Due date card */}
                        <DueDate task={task} />

                        {/* Creator and Assignees Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
                            {/* Creator */}
                            <TaskCreator task={task} />

                            {/* Divider */}
                            <div className="h-px bg-gray-200" />

                            {/* Assignees */}
                            <Assignee
                                assignees={task.assignees}
                                taskId={task.id}
                                project={task.project}
                                refetch={refetch}
                                isCreator={isCreator}
                            />
                        </div>

                        {/* Asset Section */}
                        <AssetSection total_assets ={task.total_assets} task={task} taskId={task.id} projectId={task.project?.id || null} />

                    </div>
                </div>
            </div>

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