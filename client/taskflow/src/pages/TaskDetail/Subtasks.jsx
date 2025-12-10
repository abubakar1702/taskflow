import { useState, useEffect } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { PiDotsThreeCircleVertical } from "react-icons/pi";
import SubtaskAction from "./SubtaskAction";
import EditSubtaskModal from "../../components/modals/EditSubtaskModal";
import AddSubtaskModal from "../../components/modals/AddSubtaskModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { PiUserCirclePlusLight, PiUserCircleMinusThin } from "react-icons/pi";
import { FiCheckCircle } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";

const Subtasks = ({ taskId, creator, assignees = [], refetch }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
    const [showSubtaskAction, setShowSubtaskAction] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const [deletingSubtask, setDeletingSubtask] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const { makeRequest } = useApi();

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const isCreator = currentUser.id === creator?.id;


    const fetchSubtasks = async () => {
        try {
            const response = await makeRequest(`/api/tasks/${taskId}/subtasks/`, "GET");
            setSubtasks(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Failed to fetch subtasks:", error);
            setSubtasks([]);
        }
    };

    useEffect(() => {
        fetchSubtasks();
    }, [taskId]);

    const mySubtasks = subtasks.filter(st => currentUser.id && st.assignee?.id === currentUser.id);
    const teamSubtasks = subtasks.filter(st => st.assignee && st.assignee.id !== currentUser.id);
    const unassignedSubtasks = subtasks.filter(st => !st.assignee);



    console.log(subtasks)

    const handleToggleSubtask = async (subtaskId, currentStatus) => {
        if (!taskId) return;

        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, "PATCH", {
                is_completed: !currentStatus,
            });
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to update subtask:", error);
            alert("Failed to update subtask. Please try again.");
        }
    };

    const handleEditSubtask = (subtask) => {
        setEditingSubtask(subtask);
        setShowSubtaskAction(null);
    };

    const handleDeleteSubtask = (subtask) => {
        setDeletingSubtask(subtask);
        setShowSubtaskAction(null);
    };

    const confirmDeleteSubtask = async () => {
        if (!deletingSubtask) return;

        setIsDeleting(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${deletingSubtask.id}/`, "DELETE");
            fetchSubtasks();
            setDeletingSubtask(null);
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            alert("Failed to delete subtask. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
    const totalSubtasks = subtasks.length;

    if (!subtasks.length && !showAddModal) {
        return (
            <div className="text-center py-4">
                <p className="text-xl font-semibold text-gray-500 mb-4">No subtasks yet</p>
            </div>
        );
    }

    const handleAssignToMe = async (subtaskId) => {
        console.log("handleAssignToMe triggered", { subtaskId, taskId, currentUser });

        if (!taskId) {
            console.error("Missing taskId");
            return;
        }

        if (!currentUser || !currentUser.id) {
            console.error("Missing user ID", currentUser);
            return;
        }

        try {
            console.log("Sending request to assign subtask...");
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, "PATCH", {
                assignee_id: currentUser.id,
                is_completed: false,
            });
            console.log("Subtask assigned successfully");
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to assign subtask:", error);
            if (error.data) {
                console.error("Error details:", JSON.stringify(error.data, null, 2));
            }
            alert("Failed to assign subtask. Please try again.");
        }
    };

    const handleUnassignToMe = async (subtaskId) => {
        console.log("handleUnassignToMe triggered", { subtaskId, taskId, currentUser });

        if (!taskId) {
            console.error("Missing taskId");
            return;
        }

        if (!currentUser || !currentUser.id) {
            console.error("Missing user ID", currentUser);
            return;
        }

        try {
            console.log("Sending request to unassign subtask...");
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, "PATCH", {
                assignee_id: null,
                is_completed: false,
            });
            console.log("Subtask unassigned successfully");
            fetchSubtasks();
        } catch (error) {
            console.error("Failed to unassign subtask:", error);
            if (error.data) {
                console.error("Error details:", JSON.stringify(error.data, null, 2));
            }
            alert("Failed to unassign subtask. Please try again.");
        }

    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Subtasks</h2>
                </div>
                {isCreator && (
                    <div>
                        <button onClick={() => setShowAddSubtaskModal(true)} className="flex items-center px-2 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                            <FaPlus className="mr-2" /> Add Subtask
                        </button>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {totalSubtasks > 0 && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            {completedSubtasks} of {totalSubtasks} completed
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                            {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Render subtask items helper function */}
            {(() => {
                const renderSubtask = (subtask) => {
                    const isAssignedToMe = subtask.assignee?.id === currentUser.id;
                    const isMember = assignees.some(a => a.id === currentUser.id);
                    const canToggle = subtask.assignee && isAssignedToMe;
                    const isUnassigned = !subtask.assignee;

                    return (
                        <div
                            key={subtask.id}
                            className={`${subtask.is_completed ? "border border-green-400 flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" : ""}flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors`}
                        >
                            {canToggle && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleToggleSubtask(subtask.id, subtask.is_completed);
                                    }}
                                    className={`w-6 h-6 flex-shrink-0 flex items-center justify-center border-2 rounded-full mr-3 ${subtask.is_completed
                                        ? "bg-green-500 border-green-500"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    {subtask.is_completed && (
                                        <FiCheckCircle color="white" />
                                    )}
                                </button>
                            )}
                            <div className="flex-grow">
                                <p
                                    className={`font-medium ${subtask.is_completed
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                        }`}
                                >
                                    {subtask.text}
                                </p>
                                {subtask.assignee && (
                                    <div className="flex items-center mt-1">
                                        <div className="flex items-center">
                                            {subtask.assignee.avatar ? (
                                                <img
                                                    src={subtask.assignee.avatar}
                                                    alt={subtask.assignee.display_name}
                                                    className="w-5 h-5 rounded-full mr-1"
                                                />
                                            ) : (
                                                <Avatar
                                                    name={subtask.assignee.display_name}
                                                    size={4}
                                                    className="mr-1"
                                                />
                                            )}
                                            <span className="text-xs text-gray-600">{subtask.assignee.display_name}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action menu - only for creator or assignee of the subtask */}
                            {isCreator && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowSubtaskAction(showSubtaskAction === subtask.id ? null : subtask.id);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-200 rounded-full transition-colors"
                                        title="Subtask actions"
                                    >
                                        <PiDotsThreeCircleVertical className="w-5 h-5" />
                                    </button>

                                    {showSubtaskAction === subtask.id && (
                                        <SubtaskAction
                                            taskId={taskId}
                                            subtask={subtask}
                                            creator={creator}
                                            assignees={assignees}
                                            onClose={() => setShowSubtaskAction(null)}
                                            onUpdated={() => {
                                                fetchSubtasks();
                                            }}
                                            onEdit={() => handleEditSubtask(subtask)}
                                            onDelete={() => handleDeleteSubtask(subtask)}
                                        />
                                    )}
                                </div>
                            )}

                            {!isCreator && isMember && isAssignedToMe && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleUnassignToMe(subtask.id);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                        title="Subtask actions"
                                    >
                                        <PiUserCircleMinusThin className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {isUnassigned && isMember && !isCreator && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAssignToMe(subtask.id);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                        title="Subtask actions"
                                    >
                                        <PiUserCirclePlusLight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                };

                return (
                    <div className="space-y-6">
                        {/* My Subtasks */}
                        {mySubtasks.length > 0 && (
                            <div>
                                <div className="flex items-center mb-3">
                                    <h3 className="text-sm font-semibold text-blue-900">Assigned to You</h3>
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                        {mySubtasks.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {mySubtasks.map(renderSubtask)}
                                </div>
                            </div>
                        )}

                        {/* Team Subtasks */}
                        {teamSubtasks.length > 0 && (
                            <div>
                                <div className="flex items-center mb-3">
                                    <h3 className="text-sm font-semibold text-purple-900">Team</h3>
                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                        {teamSubtasks.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {teamSubtasks.map(renderSubtask)}
                                </div>
                            </div>
                        )}


                        {/* Unassigned Subtasks */}
                        {unassignedSubtasks.length > 0 && (
                            <div>
                                <div className="flex items-center mb-3">
                                    <h3 className="text-sm font-semibold text-gray-700">Unassigned</h3>
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                        {unassignedSubtasks.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {unassignedSubtasks.map(renderSubtask)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Edit Subtask Modal */}
            {editingSubtask && (
                <EditSubtaskModal
                    taskId={taskId}
                    subtask={editingSubtask}
                    creator={creator}
                    assignees={assignees}
                    onClose={() => setEditingSubtask(null)}
                    onUpdated={() => {
                        fetchSubtasks();
                    }}
                />
            )}

            {/* Add Subtask Modal */}
            {showAddSubtaskModal && (
                <AddSubtaskModal
                    taskId={taskId}
                    creator={creator}
                    assignees={assignees}
                    onClose={() => setShowAddSubtaskModal(false)}
                    onUpdated={() => {
                        fetchSubtasks();
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={!!deletingSubtask}
                onClose={() => setDeletingSubtask(null)}
                onConfirm={confirmDeleteSubtask}
                title="Delete Subtask"
                message="Are you sure you want to delete this subtask? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Subtasks;