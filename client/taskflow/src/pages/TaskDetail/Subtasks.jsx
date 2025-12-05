import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";

const Subtasks = ({ subtasks = [], taskId, refetch }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSubtaskText, setNewSubtaskText] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const { makeRequest } = useApi();

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtaskText.trim() || !taskId) return;

        setIsAdding(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/`, "POST", {
                text: newSubtaskText.trim(),
                is_completed: false,
            });
            setNewSubtaskText("");
            setShowAddForm(false);
            refetch(); // This will refresh the entire task with updated subtasks
        } catch (error) {
            console.error("Failed to add subtask:", error);
            alert("Failed to add subtask. Please try again.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleSubtask = async (subtaskId, currentStatus) => {
        try {
            await makeRequest(`/api/subtasks/${subtaskId}/`, "PATCH", {
                is_completed: !currentStatus,
            });
            refetch(); // This will refresh the entire task with updated subtasks
        } catch (error) {
            console.error("Failed to update subtask:", error);
            alert("Failed to update subtask. Please try again.");
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (!window.confirm("Are you sure you want to delete this subtask?")) return;

        try {
            await makeRequest(`/api/subtasks/${subtaskId}/`, "DELETE");
            refetch(); // This will refresh the entire task with updated subtasks
        } catch (error) {
            console.error("Failed to delete subtask:", error);
            alert("Failed to delete subtask. Please try again.");
        }
    };

    const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
    const totalSubtasks = subtasks.length;

    if (!subtasks.length && !showAddForm) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No subtasks yet</p>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Subtask
                </button>
            </div>
        );
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

            {/* Subtasks list */}
            <div className="space-y-2">
                {subtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
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
                                    <span className="text-xs text-gray-500 mr-2">Assigned to:</span>
                                    <div className="flex items-center">
                                        {subtask.assignee.avatar ? (
                                            <img
                                                src={subtask.assignee.avatar}
                                                alt={subtask.assignee.display_name}
                                                className="w-5 h-5 rounded-full mr-1"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-1">
                                                <span className="text-xs font-semibold text-blue-800">
                                                    {subtask.assignee.display_name?.charAt(0) || "?"}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-600">{subtask.assignee.display_name}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Delete subtask"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Add subtask form */}
            {showAddForm && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Add New Subtask</h3>
                    <form onSubmit={handleAddSubtask} className="space-y-3">
                        <textarea
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            placeholder="Enter subtask description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            required
                            disabled={isAdding}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewSubtaskText("");
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isAdding}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isAdding || !newSubtaskText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAdding ? "Adding..." : "Add Subtask"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add subtask button (when form is hidden) */}
            {!showAddForm && subtasks.length > 0 && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                    + Add Subtask
                </button>
            )}
        </div>
    );
};

export default Subtasks;