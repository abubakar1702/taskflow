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
import TaskDependencies from "./TaskDependencies";

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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
                    <p className="text-xs font-semibold">Error loading task: {error.message}</p>
                    <button
                        onClick={refetch}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 text-xs font-bold uppercase tracking-wider"
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
                <p className="text-xs text-gray-500 font-medium">No task found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center text-xs font-bold uppercase tracking-wider text-blue-650 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-all shadow-none"
                    >
                        <FiActivity className="w-4 h-4 text-gray-605 dark:text-slate-400" />
                        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-700 dark:text-slate-300">Activity</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <TaskInfo task={task} onUpdate={refetch} />
                        <div className="mb-6 shadow-none border border-gray-200 dark:border-slate-800/80 rounded-lg p-6 bg-white dark:bg-slate-900">
                            <Subtasks task={task} taskId={task.id} creator={task.creator} assignees={task.assignees} refetch={refetch} />
                        </div>
                        <TaskComments taskId={task.id} task={task} />
                    </div>

                    <div className="space-y-6">
                        <DueDate task={task} onUpdate={refetch} isCreator={isCreator} />
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-none p-6 space-y-6 border border-gray-200 dark:border-slate-800/80">
                            <TaskCreator task={task} />
                            <div className="h-px bg-gray-200 dark:bg-slate-800" />
                            <Assignee
                                assignees={task.assignees}
                                taskId={task.id}
                                project={task.project}
                                refetch={refetch}
                                isCreator={isCreator}
                            />
                        </div>
                        <AssetSection total_assets={task.total_assets} task={task} taskId={task.id} projectId={task.project?.id || null} />
                        <TaskDependencies task={task} />
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