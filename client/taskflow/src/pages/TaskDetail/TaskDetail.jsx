import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import Assignee from "./Assignee";
import Subtasks from "./Subtasks";
import DeleteModal from "../../components/modals/DeleteModal";
import AssetSection from "./AssetSection";
import TaskCreator from "./TaskCreator";
import DueDate from "./DueDate";
import TaskInfo from "./TaskInfo";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";
import { FiActivity } from "react-icons/fi";
import TaskActivity from "./TaskActivity";
import TaskComments from "./TaskComments";

const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);

    const { data: task, isLoading: loading, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.task(id),
        queryFn: async () => (await apiClient.get(`/api/tasks/${id}/`)).data,
        enabled: !!id,
    });

    const { isCreator, isAssignee } = useTaskPermissions(task);

    const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
        mutationFn: () => apiClient.delete(`/api/tasks/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.removeQueries({ queryKey: QUERY_KEYS.task(id) });
            navigate("/tasks");
            toast.success("Task deleted successfully");
        },
        onError: () => toast.error("Failed to delete task"),
    });

    if (loading && !task) {
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <FiActivity className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Activity</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <TaskInfo task={task} onUpdate={refetch} />
                        <div className="mb-6 shadow-sm border border-gray-200 rounded-lg p-6 bg-white">
                            <Subtasks task={task} taskId={task.id} creator={task.creator} assignees={task.assignees} refetch={refetch} />
                        </div>
                        <TaskComments taskId={task.id} task={task} />
                    </div>

                    <div className="space-y-6">
                        <DueDate task={task} onUpdate={refetch} isCreator={isCreator} />
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 border border-gray-100">
                            <TaskCreator task={task} />
                            <div className="h-px bg-gray-200" />
                            <Assignee
                                assignees={task.assignees}
                                taskId={task.id}
                                project={task.project}
                                refetch={refetch}
                                isCreator={isCreator}
                            />
                        </div>
                        <AssetSection total_assets={task.total_assets} task={task} taskId={task.id} projectId={task.project?.id || null} />
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => deleteTask()}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                isLoading={deleteLoading}
            />

            <TaskActivity
                isOpen={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                taskId={task?.id}
                taskTitle={task?.title}
            />
        </div>
    );
};

export default TaskDetail;