import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import DeleteModal from "../../components/modals/DeleteModal";
import AddAssigneeModal from "../../components/modals/AddAssigneeModal";
import { FiUserPlus } from "react-icons/fi";
import { FaXmark } from "react-icons/fa6";

const Assignee = ({ assignees = [], taskId, refetch, project, isCreator }) => {
    const { makeRequest: removeAssignee } = useApi();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAssignee, setDeletingAssignee] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showAddAssigneeModal, setShowAddAssigneeModal] = useState(false);

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

    const openAddModal = () => setShowAddAssigneeModal(true);

    return (
        <div>
            {/* Header with Add button */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold">
                    Assignees{" "}
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {assignees.length || 0}
                    </span>
                </h2>
                {isCreator && (<button
                    onClick={openAddModal}
                    className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md flex items-center gap-2 border border-blue-600"
                >
                    <FiUserPlus /> Add New
                </button>)}
            </div>

            {/* Assignee list */}
            {assignees.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-gray-500">No assignees yet</p>
                </div>
            ) : (
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

                            {isCreator && (<button
                                onClick={() => openDeleteModal(a)}
                                className="text-gray-500 hover:text-gray-700 p-2"
                            >
                                <FaXmark size={20} title="Remove Assignee" />
                            </button>)}
                        </div>
                    ))}
                </div>
            )}

            {/* Delete modal */}
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

            {/* Add Assignee modal */}
            <AddAssigneeModal
                isOpen={showAddAssigneeModal}
                onClose={() => setShowAddAssigneeModal(false)}
                taskId={taskId}
                project={project}
                currentAssignees={assignees}
                onAdd={() => {
                    refetch();
                    setShowAddAssigneeModal(false);
                }}
            />
        </div>
    );
};

export default Assignee;
