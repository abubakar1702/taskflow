import { useState, useEffect, useContext } from "react";
import { useApi } from "../hooks/useApi";
import Avatar from "../common/Avatar";
import { FaPlus, FaRegUser, FaCircleInfo } from "react-icons/fa6";
import { MdOutlineTask } from "react-icons/md";
import { ClipLoader } from "react-spinners";

const AddSubtaskModal = ({ taskId, creator, assignees = [], onClose, onUpdated }) => {
    const [text, setText] = useState("");
    const [assigneeId, setAssigneeId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [canUnassign, setCanUnassign] = useState(false);
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
            await makeRequest(`/api/tasks/${taskId}/subtasks/`, "POST", {
                text: text.trim(),
                assignee_id: assigneeId || null,
                is_completed: false,
            });
            setText("");
            setAssigneeId(null);
            onUpdated?.();
            handleClose();
        } catch (error) {
            console.error("Failed to add subtask:", error);
            alert("Failed to add subtask. Please try again.");
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <MdOutlineTask className="w-4 h-4 mr-2 text-blue-600" />
                            Subtask Description
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-gray-50 hover:bg-white"
                            rows={4}
                            required
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 flex items-center">
                            <FaCircleInfo className="w-3 h-3 mr-1" />
                            Be specific about what needs to be accomplished
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                            <FaRegUser className="w-4 h-4 mr-2 text-blue-600" />
                            Assign To
                        </label>

                        {selectedAssignee && (
                            <div className="flex items-center p-3 bg-blue-50 border-2 border-blue-200 rounded-xl mb-2">
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
                                <span className="font-medium text-blue-900">{selectedAssignee.display_name}</span>
                            </div>
                        )}

                        <select
                            value={assigneeId || ""}
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
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
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

                        <label className="flex items-center mt-2 text-gray-700"><input onChange={(e)=> setCanUnassign(e.target.checked)} checked={canUnassign} className="mr-2" type="checkbox" />Can not unassign this subtask</label>

                        {!creator && filteredAssignees.length === 0 && (
                            <p className="text-xs text-amber-600 flex items-center">
                                No assignees available for this task
                            </p>
                        )}
                    </div>
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
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <ClipLoader size={20} color="#ffffff" className="mr-2" />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <FaPlus className="w-5 h-5" />
                                    <span>Add Subtask</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubtaskModal;
