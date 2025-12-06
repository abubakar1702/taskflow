import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { PiDotsThreeCircleVertical } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import SubtaskAction from "./SubtaskAction";
import EditSubtaskModal from "../../components/modals/EditSubtaskModal";
import AddSubtaskModal from "../../components/modals/AddSubtaskModal";
import { PiUserCirclePlusLight, PiUserCircleMinusThin } from "react-icons/pi";

const Subtasks = ({ subtasks = [], taskId, creator, assignees = [], refetch }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false);
    const [showSubtaskAction, setShowSubtaskAction] = useState(null);
    const [editingSubtask, setEditingSubtask] = useState(null);
    const { makeRequest } = useApi();

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    const mySubtasks = subtasks.filter(st => currentUser.id && st.assignee?.id === currentUser.id);
    const teamSubtasks = subtasks.filter(st => st.assignee && st.assignee.id !== currentUser.id);
    const unassignedSubtasks = subtasks.filter(st => !st.assignee);

    const handleToggleSubtask = async (subtaskId, currentStatus) => {
        if (!taskId) return;

        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtaskId}/`, "PATCH", {
                is_completed: !currentStatus,
            });
            refetch();
        } catch (error) {
            console.error("Failed to update subtask:", error);
            alert("Failed to update subtask. Please try again.");
        }
    };

    const handleEditSubtask = (subtask) => {
        setEditingSubtask(subtask);
        setShowSubtaskAction(null);
    };

    const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
    const totalSubtasks = subtasks.length;

    if (!subtasks.length && !showAddModal) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No subtasks yet</p>
                <button
                    onClick={() => setShowAddSubtaskModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Subtask
                </button>
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
            refetch();
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
            refetch();
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
                    const isCreator = currentUser.id === creator?.id;
                    const isAssignedToMe = subtask.assignee?.id === currentUser.id;
                    const isMember = assignees.some(a => a.id === currentUser.id);
                    const canToggle = subtask.assignee && isAssignedToMe;
                    const isUnassigned = !subtask.assignee;

                    return (
                        <div
                            key={subtask.id}
                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {canToggle && (
                                <button
                                    onClick={() => handleToggleSubtask(subtask.id, subtask.is_completed)}
                                    className={`w-6 h-6 flex-shrink-0 flex items-center justify-center border-2 rounded mr-3 ${subtask.is_completed
                                        ? "bg-green-500 border-green-500"
                                        : "border-gray-300 hover:border-gray-400"
                                        }`}
                                >
                                    {subtask.is_completed && (
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            )}
                            <div className="flex-grow">
                                <p
                                    className={`font-medium ${subtask.is_completed
                                        ? "text-gray-500 line-through"
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
                                        onClick={() => setShowSubtaskAction(showSubtaskAction === subtask.id ? null : subtask.id)}
                                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-200 rounded transition-colors"
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
                                            onUpdated={refetch}
                                            onEdit={() => handleEditSubtask(subtask)}
                                        />
                                    )}
                                </div>
                            )}

                            {!isCreator && isMember && isAssignedToMe && (
                                <div className="relative">
                                    <button
                                        onClick={() => handleUnassignToMe(subtask.id)}
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
                                        onClick={() => handleAssignToMe(subtask.id)}
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
                    onUpdated={refetch}
                />
            )}

            {/* Add Subtask Modal */}
            {showAddSubtaskModal && (
                <AddSubtaskModal
                    taskId={taskId}
                    creator={creator}
                    assignees={assignees}
                    onClose={() => setShowAddSubtaskModal(false)}
                    onUpdated={refetch}
                />
            )}
        </div>
    );
};

export default Subtasks;