import { useState, useRef, useEffect } from "react";
import { useApi } from "../../components/hooks/useApi";

const SubtaskAction = ({ taskId, subtask, creator, assignees = [], onClose, onUpdated, onEdit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { makeRequest } = useApi();
    const dropdownRef = useRef(null);

    // Get logged-in user
    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // Permission checks
    const isCreator = currentUser.id === creator?.id;
    const isAssignedToMe = subtask.assignee?.id === currentUser.id;

    // User can edit/delete if they are creator OR if subtask is assigned to them OR if it's unassigned
    const canModify = isCreator || isAssignedToMe;

    const canEdit = isCreator

    const canDelete = isCreator

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleEditClick = () => {
        onEdit();
        onClose();
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this subtask?")) return;

        setIsSubmitting(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, "DELETE");
            onUpdated();
            onClose();
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            alert("Failed to delete subtask. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignToMe = async () => {
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

    const handleUnassign = async () => {
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
                    onClick={handleAssignToMe}
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
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Assign to me</span>
                </button>
            )}
            


            {/* Unassign Option - only if assigned and user can modify */}
            {subtask.assignee && canModify && (
                <button
                    onClick={handleUnassign}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <svg
                        className="w-4 h-4 text-gray-500 group-hover:text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                        />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Unassign</span>
                </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-gray-200"></div>

            {/* Delete Option - only if user can modify */}
            {canDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <svg
                        className="w-4 h-4 text-gray-500 group-hover:text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Delete</span>
                </button>
            )}
        </div>
    );
};

export default SubtaskAction;
