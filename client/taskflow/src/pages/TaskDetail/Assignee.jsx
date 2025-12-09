import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import DeleteModal from "../../components/modals/DeleteModal";

const Assignee = ({ assignees = [], taskId, refetch }) => {
    const { makeRequest: removeAssignee } = useApi();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAssignee, setDeletingAssignee] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (assignee) => {
        setDeletingAssignee(assignee);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeletingAssignee(null);
        setShowDeleteModal(false);
    };

    const confirmDeleteAssignee = async () => {
        if (!deletingAssignee) return;

        try {
            setIsDeleting(true);

            await removeAssignee(
                `/api/tasks/${taskId}/assignees/${deletingAssignee.id}/`,
                "DELETE"
            );

            setIsDeleting(false);
            closeDeleteModal();
            refetch();

        } catch (err) {
            setIsDeleting(false);
            console.error("Failed to remove assignee:", err);
            alert("Failed to remove assignee. Please try again.");
        }
    };

    if (!assignees.length) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">No assignees yet</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {assignees.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {a.avatar ? (
                                <img
                                    src={a.avatar}
                                    alt={a.display_name}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <Avatar name={a.display_name} size={10} />
                            )}
                            <div>
                                <p className="font-medium">{a.display_name}</p>
                                <p className="text-sm text-gray-500">{a.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => openDeleteModal(a)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <svg
                                className="w-5 h-5"
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
                        </button>
                    </div>
                ))}
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteAssignee}
                title="Remove Assignee"
                message={
                    deletingAssignee
                        ? `Are you sure you want to remove ${deletingAssignee.display_name} from this task?`
                        : "Are you sure?"
                }
                isLoading={isDeleting}
            />
        </>
    );
};

export default Assignee;
