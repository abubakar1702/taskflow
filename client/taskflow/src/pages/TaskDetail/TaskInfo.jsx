import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskInfoAction from "./TaskInfoAction";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { format } from "date-fns";
import EditTaskInfoModal from "../../components/modals/EditTaskInfoModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { useApi } from "../../components/hooks/useApi";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";
import { PRIORITY_COLORS, STATUS_COLORS } from "../../components/constants/uiColors";

const TaskInfo = ({ task, onUpdate }) => {
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isImportant, setIsImportant] = useState(false);

    const { isCreator, isAssignee } = useTaskPermissions(task);
    const { data: importantTasks, refetch: refetchImportant } = useApi("/api/important-tasks/");
    const { makeRequest: toggleImportant } = useApi();
    const { makeRequest: leaveTask } = useApi();
    const { makeRequest: deleteTask, loading: deleteLoading } = useApi();

    const navigate = useNavigate();

    useEffect(() => {
        if (importantTasks && task) {
            const important = importantTasks.some(
                t => t.id === task.id || t.task?.id === task.id || t.task_id === task.id
            );
            setIsImportant(important);
        }
    }, [importantTasks, task]);

    const handleToggleImportant = async () => {
        try {
            if (isImportant) {
                await toggleImportant(`/api/important-tasks/${task.id}/`, "DELETE");
                toast.success("Removed from important tasks");
            } else {
                await toggleImportant("/api/important-tasks/", "POST", { task_id: task.id });
                toast.success("Marked as important");
            }
            refetchImportant();
            setIsImportant(!isImportant);
        } catch {
            toast.error("Failed to update importance");
        }
    };

    const handleLeaveTask = async () => {
        try {
            await leaveTask(`/api/tasks/${task.id}/leave/`, "PATCH");
            toast.success("Task left successfully");
            navigate("/tasks");
        } catch {
            toast.error("Failed to leave task");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask(`/api/tasks/${task.id}/`, "DELETE");
            toast.success("Task deleted successfully");
            setShowDeleteModal(false);
            navigate("/tasks");
        } catch {
            toast.error("Failed to delete task");
        }
    };

    const safeFormatDate = (value, fmt = "MMM dd, yyyy HH:mm") => {
        if (!value) return "N/A";
        try {
            return format(new Date(value), fmt);
        } catch {
            return "N/A";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>

                {(isCreator || isAssignee) && (
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(!showActionMenu);
                            }}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                        >
                            <BsThreeDotsVertical className="w-5 h-5" />
                        </button>

                        <TaskInfoAction
                            showActionMenu={showActionMenu}
                            setShowActionMenu={setShowActionMenu}
                            onEdit={() => setShowEditModal(true)}
                            onDelete={() => setShowDeleteModal(true)}
                            onLeave={handleLeaveTask}
                            task={task}
                            isImportant={isImportant}
                            onToggleImportant={handleToggleImportant}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${PRIORITY_COLORS[task.priority]}`}
                >
                    {task.priority}
                </span>

                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[task.status]}`}
                >
                    {task.status}
                </span>

                {task.project && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-2">
                        <FaProjectDiagram className="w-4 h-4" />
                        {task.project.name}
                    </span>
                )}
            </div>


            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {task.description || "No description provided"}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
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
                    onConfirm={handleDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task?"
                    isLoading={deleteLoading}
                />
            )}
        </div>
    );
};

export default TaskInfo;