import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import Avatar from "../common/Avatar";

const EditSubtaskModal = ({ taskId, subtask, creator, assignees = [], onClose, onUpdated }) => {
    const [text, setText] = useState(subtask.text);
    const [assigneeId, setAssigneeId] = useState(subtask.assignee?.id || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { makeRequest } = useApi();

    const filteredAssignees = assignees.filter(a => a.id !== creator?.id);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || !taskId) return;

        setIsSubmitting(true);
        try {
            await makeRequest(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, "PATCH", {
                text: text.trim(),
                assignee_id: assigneeId || null,
            });
            onUpdated?.();
            handleClose();
        } catch (error) {
            console.error("Failed to update subtask:", error);
            alert("Failed to update subtask. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedAssignee = (creator && String(assigneeId) === String(creator.id))
        ? creator
        : filteredAssignees.find(a => String(a.id) === String(assigneeId));

    return (
        <div
            className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative transform transition-all duration-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white">Edit Subtask</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm group"
                            disabled={isSubmitting}
                        >
                            <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Subtask Description */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Subtask Description
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50 hover:bg-white"
                            rows={4}
                            required
                            disabled={isSubmitting}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Update the subtask description as needed
                        </p>
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Assign To
                        </label>

                        {/* Selected Assignee Display */}
                        {selectedAssignee && (
                            <div className="flex items-center p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl mb-2">
                                {selectedAssignee.avatar ? (
                                    <img
                                        src={selectedAssignee.avatar}
                                        alt={selectedAssignee.display_name}
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                ) : (
                                    <Avatar
                                        name={selectedAssignee.display_name}
                                        size={6}
                                        className="mr-3"
                                    />
                                )}
                                <span className="font-medium text-indigo-900">{selectedAssignee.display_name}</span>
                            </div>
                        )}

                        <select
                            value={assigneeId !== null ? String(assigneeId) : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    setAssigneeId(null);
                                    return;
                                }

                                const allUsers = creator ? [creator, ...filteredAssignees] : filteredAssignees;
                                const user = allUsers.find(u => String(u.id) === val);
                                setAssigneeId(user ? user.id : val);
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
                            disabled={isSubmitting || (!creator && filteredAssignees.length === 0)}
                        >
                            <option value="">Unassigned</option>
                            {creator && (
                                <option key={creator.id} value={creator.id}>
                                    {creator.display_name} (Creator)
                                </option>
                            )}
                            {filteredAssignees.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.display_name}
                                </option>
                            ))}
                        </select>

                        {!creator && filteredAssignees.length === 0 && (
                            <p className="text-xs text-amber-600 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                No assignees available for this task
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !text.trim()}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:scale-105 flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSubtaskModal;