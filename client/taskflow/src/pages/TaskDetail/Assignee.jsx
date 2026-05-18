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
                <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Assignees{" "}
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-sm border border-blue-200 dark:border-blue-900">
                        {assignees.length || 0}
                    </span>
                </h2>
                {isCreator && (
                    <button
                        onClick={() => setShowAddAssigneeModal(true)}
                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-2 py-1 rounded-sm flex items-center gap-1.5 border border-blue-600 dark:border-blue-500 text-xs font-semibold"
                    >
                        <FiUserPlus /> Add New
                    </button>
                )}
            </div>

            {assignees.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-xs text-gray-450 dark:text-slate-400 font-medium">No assignees yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignees.map((a) => (
                        <div
                            key={a.id}
                            className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-slate-800/20 border border-gray-200/40 dark:border-slate-800/80 rounded-sm hover:bg-gray-100/70 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {a.avatar ? (
                                    <img src={a.avatar} alt={a.display_name} className="w-8 h-8 rounded-sm object-cover" />
                                ) : (
                                    <Avatar name={a.display_name} size={8} className="rounded-sm" />
                                )}
                                <div>
                                    <p className="font-bold text-xs text-gray-800 dark:text-slate-100">{a.display_name}</p>
                                    <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">{a.email}</p>
                                </div>
                            </div>

                            {isCreator && (
                                <button
                                    onClick={() => openDeleteModal(a)}
                                    className="text-gray-400 hover:text-red-650 dark:text-slate-500 dark:hover:text-red-400 p-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <FaXmark size={14} title="Remove Assignee" />
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
