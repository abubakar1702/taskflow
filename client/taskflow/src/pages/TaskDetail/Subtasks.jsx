import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import Avatar from "../../components/common/Avatar";
import { PiDotsThreeCircleVertical } from "react-icons/pi";
import SubtaskAction from "./SubtaskAction";
import EditSubtaskModal from "../../components/modals/EditSubtaskModal";
import AddSubtaskModal from "../../components/modals/AddSubtaskModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { PiUserCirclePlusLight, PiUserCircleMinusThin } from "react-icons/pi";
import { FiCheckCircle } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const Subtasks = ({ task }) => {
    const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
    const [showSubtaskAction, setShowSubtaskAction] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const [deletingSubtask, setDeletingSubtask] = useState(null);

    const queryClient = useQueryClient();
    const { isCreator, currentUser } = useTaskPermissions(task);

    const taskId = task.id;
    const creator = task.creator;
    const assignees = task.assignees || [];

    // ── Fetch subtasks ───────────────────────────────────────────────────────
    const { data: subtasksData, isLoading } = useQuery({
        queryKey: QUERY_KEYS.subtasks(taskId),
        queryFn: async () => (await apiClient.get(`/api/tasks/${taskId}/subtasks/`)).data,
        enabled: !!taskId,
    });
    const subtasks = Array.isArray(subtasksData) ? subtasksData : (subtasksData?.results || []);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subtasks(taskId) });

    // ── Mutations ────────────────────────────────────────────────────────────
    const { mutate: toggleSubtask } = useMutation({
        mutationFn: ({ subtaskId, currentStatus }) =>
            apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, {
                is_completed: !currentStatus,
            }),
        onSuccess: () => { invalidate(); toast.success("Subtask updated successfully"); },
        onError: () => toast.error("Failed to update subtask. Please try again."),
    });

    const { mutate: deleteSubtask, isPending: isDeleting } = useMutation({
        mutationFn: (subtaskId) =>
            apiClient.delete(`/api/tasks/${taskId}/subtasks/${subtaskId}/`),
        onSuccess: () => {
            invalidate();
            toast.success("Subtask deleted successfully");
            setDeletingSubtask(null);
        },
        onError: () => toast.error("Failed to delete subtask. Please try again."),
    });

    const { mutate: assignToMe } = useMutation({
        mutationFn: (subtaskId) =>
            apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, {
                assignee_id: currentUser.id,
                is_completed: false,
            }),
        onSuccess: () => { invalidate(); toast.success("Subtask assigned successfully"); },
        onError: () => toast.error("Failed to assign subtask. Please try again."),
    });

    const { mutate: unassignFromMe } = useMutation({
        mutationFn: (subtaskId) =>
            apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, {
                assignee_id: null,
                is_completed: false,
            }),
        onSuccess: () => { invalidate(); toast.success("Subtask unassigned successfully"); },
        onError: () => toast.error("Failed to unassign subtask. Please try again."),
    });

    // ── Derived state ────────────────────────────────────────────────────────
    const mySubtasks = subtasks.filter((st) => currentUser?.id && st.assignee?.id === currentUser.id);
    const teamSubtasks = subtasks.filter((st) => st.assignee && st.assignee.id !== currentUser?.id);
    const unassignedSubtasks = subtasks.filter((st) => !st.assignee);
    const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
    const totalSubtasks = subtasks.length;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <ClipLoader aria-label="Loading subtasks" color="#3b82f6" size={40} />
            </div>
        );
    }

    // ── Render subtask row ───────────────────────────────────────────────────
    const renderSubtask = (subtask) => {
        const isAssignedToMe = subtask.assignee?.id === currentUser?.id;
        const isMember = assignees.some((a) => a.id === currentUser?.id);
        const canToggle = subtask.assignee && isAssignedToMe;
        const isUnassigned = !subtask.assignee;

        return (
            <div
                key={subtask.id}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                    subtask.is_completed
                        ? "border border-green-400 bg-gray-50 hover:bg-gray-100"
                        : "border border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
            >
                {canToggle && (
                    <button
                        type="button"
                        onClick={() => toggleSubtask({ subtaskId: subtask.id, currentStatus: subtask.is_completed })}
                        className={`w-6 h-6 flex-shrink-0 flex items-center justify-center border-2 rounded-full mr-3 ${
                            subtask.is_completed
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                        {subtask.is_completed && <FiCheckCircle color="white" />}
                    </button>
                )}

                <div className="flex-grow">
                    <p className={`font-medium ${subtask.is_completed ? "text-gray-500" : "text-gray-900"}`}>
                        {subtask.text}
                    </p>
                    {subtask.assignee && (
                        <div className="flex items-center mt-1">
                            {subtask.assignee.avatar ? (
                                <img src={subtask.assignee.avatar} alt={subtask.assignee.display_name} className="w-5 h-5 rounded-full mr-1" />
                            ) : (
                                <Avatar name={subtask.assignee.display_name} size={4} className="mr-1" />
                            )}
                            <span className="text-xs text-gray-600">{subtask.assignee.display_name}</span>
                        </div>
                    )}
                </div>

                {/* Creator action menu */}
                {isCreator && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowSubtaskAction(showSubtaskAction === subtask.id ? null : subtask.id)}
                            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <PiDotsThreeCircleVertical className="w-5 h-5" />
                        </button>
                        {showSubtaskAction === subtask.id && (
                            <SubtaskAction
                                task={task}
                                subtask={subtask}
                                onClose={() => setShowSubtaskAction(null)}
                                onUpdated={invalidate}
                                onEdit={() => { setEditingSubtask(subtask); setShowSubtaskAction(null); }}
                                onDelete={() => { setDeletingSubtask(subtask); setShowSubtaskAction(null); }}
                            />
                        )}
                    </div>
                )}

                {/* Unassign button */}
                {!isCreator && isMember && isAssignedToMe && (
                    <button
                        type="button"
                        onClick={() => unassignFromMe(subtask.id)}
                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Unassign from me"
                    >
                        <PiUserCircleMinusThin className="w-5 h-5" />
                    </button>
                )}

                {/* Assign to me button */}
                {isUnassigned && isMember && !isCreator && (
                    <button
                        type="button"
                        onClick={() => assignToMe(subtask.id)}
                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Assign to me"
                    >
                        <PiUserCirclePlusLight className="w-5 h-5" />
                    </button>
                )}
            </div>
        );
    };

    // ── JSX ──────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Subtasks</h2>
                {isCreator && (
                    <button
                        onClick={() => setShowAddSubtaskModal(true)}
                        className="flex items-center px-2 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                        <FaPlus className="mr-2" /> Add Subtask
                    </button>
                )}
            </div>

            {totalSubtasks > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            {completedSubtasks} of {totalSubtasks} completed
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                            {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {totalSubtasks === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No subtasks yet. Click "Add Subtask" to create one.</p>
                </div>
            )}

            {totalSubtasks > 0 && (
                <div className="space-y-6">
                    {mySubtasks.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h3 className="text-sm font-semibold text-blue-900">Assigned to You</h3>
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{mySubtasks.length}</span>
                            </div>
                            <div className="space-y-2">{mySubtasks.map(renderSubtask)}</div>
                        </div>
                    )}
                    {teamSubtasks.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h3 className="text-sm font-semibold text-purple-900">Team</h3>
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{teamSubtasks.length}</span>
                            </div>
                            <div className="space-y-2">{teamSubtasks.map(renderSubtask)}</div>
                        </div>
                    )}
                    {unassignedSubtasks.length > 0 && (
                        <div>
                            <div className="flex items-center mb-3">
                                <h3 className="text-sm font-semibold text-gray-700">Unassigned</h3>
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{unassignedSubtasks.length}</span>
                            </div>
                            <div className="space-y-2">{unassignedSubtasks.map(renderSubtask)}</div>
                        </div>
                    )}
                </div>
            )}

            {editingSubtask && (
                <EditSubtaskModal
                    taskId={taskId}
                    subtask={editingSubtask}
                    creator={creator}
                    assignees={assignees}
                    onClose={() => setEditingSubtask(null)}
                    onUpdated={invalidate}
                />
            )}

            {showAddSubtaskModal && (
                <AddSubtaskModal
                    taskId={taskId}
                    creator={creator}
                    assignees={assignees}
                    onClose={() => setShowAddSubtaskModal(false)}
                    onUpdated={invalidate}
                />
            )}

            <DeleteModal
                isOpen={!!deletingSubtask}
                onClose={() => setDeletingSubtask(null)}
                onConfirm={() => deleteSubtask(deletingSubtask.id)}
                title="Delete Subtask"
                message="Are you sure you want to delete this subtask? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Subtasks;