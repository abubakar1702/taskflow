import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import Avatar from "../../components/common/Avatar";
import DeleteModal from "../../components/modals/DeleteModal";
import AddAssigneeModal from "../../components/modals/AddAssigneeModal";
import { FiUserPlus } from "react-icons/fi";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";

const Assignee = ({ assignees = [], taskId, refetch, project, isCreator }) => {
    const queryClient = useQueryClient();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAssignee, setDeletingAssignee] = useState(null);
    const [showAddAssigneeModal, setShowAddAssigneeModal] = useState(false);

    const { mutate: removeAssignee, isPending: isDeleting } = useMutation({
        mutationFn: (assigneeId) =>
            apiClient.delete(`/api/tasks/${taskId}/assignees/${assigneeId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
            toast.success("Assignee removed successfully");
            setDeletingAssignee(null);
            setShowDeleteModal(false);
        },
        onError: () => toast.error("Failed to remove assignee. Please try again."),
    });

    const openDeleteModal = (assignee) => {
        setDeletingAssignee(assignee);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeletingAssignee(null);
        setShowDeleteModal(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Assignees{" "}
                    <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {assignees.length || 0}
                    </span>
                </h2>
                {isCreator && (
                    <button
                        onClick={() => setShowAddAssigneeModal(true)}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 px-2 py-1 rounded-md flex items-center gap-2 border border-blue-600 dark:border-blue-500"
                    >
                        <FiUserPlus /> Add New
                    </button>
                )}
            </div>

            {assignees.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-slate-400">No assignees yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignees.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {a.avatar ? (
                                    <img src={a.avatar} alt={a.display_name} className="w-10 h-10 rounded-full" />
                                ) : (
                                    <Avatar name={a.display_name} size={10} />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{a.display_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{a.email}</p>
                                </div>
                            </div>

                            {isCreator && (
                                <button
                                    onClick={() => openDeleteModal(a)}
                                    className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-2"
                                >
                                    <FaXmark size={20} title="Remove Assignee" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={() => removeAssignee(deletingAssignee?.id)}
                title="Remove Assignee"
                message={
                    deletingAssignee
                        ? `Are you sure you want to remove ${deletingAssignee.display_name} from this task?`
                        : "Are you sure?"
                }
                isLoading={isDeleting}
            />

            <AddAssigneeModal
                isOpen={showAddAssigneeModal}
                onClose={() => setShowAddAssigneeModal(false)}
                taskId={taskId}
                project={project}
                currentAssignees={assignees}
                onAdd={() => {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
                    setShowAddAssigneeModal(false);
                }}
            />
        </div>
    );
};

export default Assignee;
