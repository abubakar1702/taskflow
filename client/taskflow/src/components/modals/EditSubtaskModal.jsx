import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import Avatar from "../common/Avatar";
import { FaRegUser, FaCircleInfo, FaUserLargeSlash } from "react-icons/fa6";
import { MdOutlineTask } from "react-icons/md";
import { BsSave2 } from "react-icons/bs";
import { ClipLoader } from 'react-spinners'
import { toast } from "react-toastify";

const EditSubtaskModal = ({ taskId, subtask, creator, assignees = [], onClose, onUpdated }) => {
    const [text, setText] = useState(subtask.text);
    const [assigneeId, setAssigneeId] = useState(subtask.assignee?.id || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { makeRequest } = useApi();

    const filteredAssignees = assignees.filter(a => a.id !== creator?.id);

    const hasChanges = text.trim() !== subtask.text ||
        String(assigneeId ?? "") !== String(subtask.assignee?.id ?? "");

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
            toast.success("Subtask updated successfully");
            onUpdated?.();
            handleClose();
        } catch (error) {
            console.error("Failed to update subtask:", error);
            toast.error("Failed to update subtask. Please try again.");
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
                className={`bg-white rounded-xl w-full max-w-2xl shadow-2xl relative transform transition-all duration-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Subtask Description */}
                    <div className="space-y-2">
                        <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
                            <span className="flex items-center">
                                <MdOutlineTask className="w-4 h-4 mr-2 text-indigo-600" />
                                Subtask Description
                            </span>
                            <span className={`text-xs font-medium ${text.length > 200 ? 'text-red-600' : 'text-gray-500'}`}>
                                {text.length}/200
                            </span>
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
                            <FaCircleInfo className="w-3 h-3 mr-1" />
                            Update the subtask description as needed
                        </p>
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <FaRegUser className="w-4 h-4 mr-2 text-indigo-600" />
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
                                <FaUserLargeSlash className="w-3 h-3 mr-1" />
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
                            disabled={isSubmitting || !text.trim() || !hasChanges || text.length > 200}
                            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transform flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <ClipLoader color="#fff" size={20} />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <BsSave2 className="w-5 h-5" />
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