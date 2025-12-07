import { useState, useRef, useEffect } from "react";
import { useApi } from "../../components/hooks/useApi";
import { LuUserPlus, LuUserMinus, LuTrash } from "react-icons/lu";

const SubtaskAction = ({ taskId, subtask, creator, assignees = [], onClose, onUpdated, onEdit, onDelete }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { makeRequest } = useApi();
    const dropdownRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    const isCreator = currentUser.id === creator?.id;
    const isAssignedToMe = subtask.assignee?.id === currentUser.id;
    const canModify = isCreator || isAssignedToMe;
    const canEdit = isCreator
    const canDelete = isCreator

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

    const handleAssignToMe = async (e) => {
        e?.preventDefault();
        setIsSubmitting(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, "PATCH", {
                assignee_id: currentUser.id,
                is_completed: false,
            });
            onUpdated();
            onClose();
        } catch (error) {
            console.error("Failed to assign subtask:", error);
            alert("Failed to assign subtask. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnassign = async (e) => {
        e?.preventDefault();
        if (!subtask.assignee) {
            alert("This subtask is already unassigned.");
            return;
        }

        setIsSubmitting(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, "PATCH", {
                assignee_id: null,
                is_completed: false,
            });
            onUpdated();
            onClose();
        } catch (error) {
            console.error("Failed to unassign subtask:", error);
            alert("Failed to unassign subtask. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
        >
            {/* Edit Option - only if user can modify */}
            {canEdit && (
                <button
                    type="button"
                    onClick={handleEditClick}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <svg
                        className="w-4 h-4 text-gray-500 group-hover:text-blue-600"
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
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Edit</span>
                </button>
            )}

            {/* Assign to me */}

            {isCreator && !subtask.assignee && (
                <button
                    type="button"
                    onClick={handleAssignToMe}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuUserPlus className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Assign to me</span>
                </button>
            )}



            {/* Unassign Option - only if assigned and user can modify */}
            {subtask.assignee && canModify && (
                <button
                    type="button"
                    onClick={handleUnassign}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuUserMinus className="w-4 h-4 text-gray-500 group-hover:text-orange-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Unassign</span>
                </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-gray-200"></div>

            {/* Delete Option - only if user can modify */}
            {canDelete && (
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <LuTrash className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Delete</span>
                </button>
            )}
        </div>
    );
};

export default SubtaskAction;
