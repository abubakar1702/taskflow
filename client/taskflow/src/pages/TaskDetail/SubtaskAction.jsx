import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { LuUserPlus, LuUserMinus, LuTrash } from "react-icons/lu";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";

const SubtaskAction = ({ task, subtask, onClose, onUpdated, onEdit, onDelete }) => {
    const queryClient = useQueryClient();
    const dropdownRef = useRef(null);
    const { isCreator, currentUser } = useTaskPermissions(task);

    const taskId = task.id;

    const { mutate: doAssign, isPending: isSubmitting } = useMutation({
        mutationFn: ({ assigneeId }) =>
            apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, {
                assignee_id: assigneeId,
                is_completed: false,
            }),
        onSuccess: (_, { successMsg }) => {
            toast.success(successMsg);
            onUpdated();
            onClose();
        },
        onError: (_, { errorMsg }) => toast.error(errorMsg),
    });

    const isAssignedToMe = subtask.assignee?.id === currentUser.id;
    const canModify = isCreator || isAssignedToMe;
    const canEdit = isCreator;
    const canDelete = isCreator;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleEditClick = (e) => {
        e?.preventDefault();
        onEdit();
        onClose();
    };

    const handleDelete = (e) => {
        e?.preventDefault();
        onDelete();
        onClose();
    };

    const handleAssignToMe = (e) => {
        e?.preventDefault();
        doAssign({
            assigneeId: currentUser.id,
            successMsg: "Subtask assigned successfully",
            errorMsg: "Failed to assign subtask. Please try again.",
        });
    };

    const handleUnassign = (e) => {
        e?.preventDefault();
        if (!subtask.assignee) {
            toast.error("This subtask is already unassigned.");
            return;
        }
        doAssign({
            assigneeId: null,
            successMsg: "Subtask unassigned successfully",
            errorMsg: "Failed to unassign subtask. Please try again.",
        });
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 py-2 z-50"
        >
            {/* Edit Option - only if user can modify */}
            {canEdit && (
                <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <svg
                        className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Edit</span>
                </button>
            )}

            {/* Assign to me - only creator can assign to themselves if unassigned */}
            {isCreator && !subtask.assignee && (
                <button
                    type="button"
                    onClick={handleAssignToMe}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuUserPlus className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Assign to me</span>
                </button>
            )}

            {/* Unassign Option - only if assigned and user can modify */}
            {subtask.assignee && canModify && (
                <button
                    type="button"
                    onClick={handleUnassign}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-orange-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuUserMinus className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-orange-650 dark:group-hover:text-orange-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">Unassign</span>
                </button>
            )}

            {/* Divider - only show if delete option will appear */}
            {canDelete && (
                <div className="my-1 border-t border-gray-200 dark:border-slate-700"></div>
            )}

            {/* Delete Option - only if user can delete */}
            {canDelete && (
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuTrash className="w-4 h-4 text-gray-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">Delete</span>
                </button>
            )}
        </div>
    );
};

export default SubtaskAction;