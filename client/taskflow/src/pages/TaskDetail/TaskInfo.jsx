import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import TaskInfoAction from "./TaskInfoAction";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { format } from "date-fns";
import EditTaskInfoModal from "../../components/modals/EditTaskInfoModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../components/constants/uiColors";

const TaskInfo = ({ task, onUpdate }) => {
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { isCreator, isAssignee } = useTaskPermissions(task);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch important tasks to derive isImportant
    const { data: importantTasksData } = useQuery({
        queryKey: QUERY_KEYS.importantTasks(),
        queryFn: async () => (await apiClient.get("/api/important-tasks/")).data,
    });
    const importantTasks = Array.isArray(importantTasksData) ? importantTasksData : (importantTasksData?.results || []);

    const isImportant = importantTasks.some(
        (t) => t.id === task.id || t.task?.id === task.id || t.task_id === task.id
    );

    // Toggle important
    const { mutate: toggleImportant } = useMutation({
        mutationFn: () =>
            isImportant
                ? apiClient.delete(`/api/important-tasks/${task.id}/`)
                : apiClient.post("/api/important-tasks/", { task_id: task.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.importantTasks() });
            toast.success(isImportant ? "Removed from important tasks" : "Marked as important");
        },
        onError: () => toast.error("Failed to update importance"),
    });

    // Leave task
    const { mutate: leaveTask } = useMutation({
        mutationFn: () => apiClient.patch(`/api/tasks/${task.id}/leave/`),
        onSuccess: () => {
            toast.success("Task left successfully");
            navigate("/tasks");
        },
        onError: () => toast.error("Failed to leave task"),
    });

    // Delete task
    const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
        mutationFn: () => apiClient.delete(`/api/tasks/${task.id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.removeQueries({ queryKey: QUERY_KEYS.task(task.id) });
            toast.success("Task deleted successfully");
            setShowDeleteModal(false);
            navigate("/tasks");
        },
        onError: () => toast.error("Failed to delete task"),
    });

    const safeFormatDate = (value, fmt = "MMM dd, yyyy HH:mm") => {
        if (!value) return "N/A";
        try {
            return format(new Date(value), fmt);
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-transparent dark:border-slate-800 p-6">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>

                {(isCreator || isAssignee) && (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(!showActionMenu);
                            }}
                            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            <BsThreeDotsVertical className="w-5 h-5" />
                        </button>

                        <TaskInfoAction
                            showActionMenu={showActionMenu}
                            setShowActionMenu={setShowActionMenu}
                            onEdit={() => setShowEditModal(true)}
                            onDelete={() => setShowDeleteModal(true)}
                            onLeave={leaveTask}
                            task={task}
                            isImportant={isImportant}
                            onToggleImportant={toggleImportant}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                </span>
                {task.project && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-2">
                        <FaProjectDiagram className="w-4 h-4" />
                        {task.project.name}
                    </span>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-transparent dark:border-slate-800">
                    <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                        {task.description || "No description provided"}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-slate-400">
                <div>Created at: {safeFormatDate(task.created_at)}</div>
                <div>Updated at: {safeFormatDate(task.updated_at)}</div>
            </div>

            {showEditModal && (
                <EditTaskInfoModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    task={task}
                    onUpdate={onUpdate}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => deleteTask()}
                    title="Delete Task"
                    message="Are you sure you want to delete this task?"
                    isLoading={deleteLoading}
                />
            )}
        </div>
    );
};

export default TaskInfo;