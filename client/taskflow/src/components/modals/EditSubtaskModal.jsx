import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import Avatar from "../common/Avatar";
import { FaRegUser, FaCircleInfo, FaUserLargeSlash } from "react-icons/fa6";
import { MdOutlineTask } from "react-icons/md";
import { BsSave2 } from "react-icons/bs";
import { ClipLoader } from 'react-spinners'
import { toast } from "react-toastify";

const EditSubtaskModal = ({ taskId, subtask, creator, assignees = [], onClose, onUpdated }) => {
    const queryClient = useQueryClient();
    const [text, setText] = useState(subtask.text);
    const [assigneeId, setAssigneeId] = useState(subtask.assignee?.id || null);
    const [isVisible, setIsVisible] = useState(false);

    const { mutate: updateSubtask, isPending: isSubmitting } = useMutation({
        mutationFn: async (payload) => {
            const response = await apiClient.patch(`/api/tasks/${taskId}/subtasks/${subtask.id}/`, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Subtask updated successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(taskId) });
            onUpdated?.();
            handleClose();
        },
        onError: (error) => {
            console.error("Failed to update subtask:", error);
            toast.error(error.response?.data?.detail || error.message || "Failed to update subtask. Please try again.");
        }
    });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !taskId) return;

        const assigneeChanged = String(assigneeId ?? "") !== String(subtask.assignee?.id ?? "");

        const payload = {
            text: text.trim(),
            assignee_id: assigneeId || null,
        };

        if (assigneeChanged) {
            payload.is_completed = false;
        }

        updateSubtask(payload);
    };

    const selectedAssignee = (creator && String(assigneeId) === String(creator.id))
        ? creator
        : filteredAssignees.find(a => String(a.id) === String(assigneeId));

    return (
        <div
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-sm w-full max-w-xl shadow-none relative transform transition-all duration-200 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Subtask Description */}
                    <div className="space-y-2">
                        <label className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                            <span className="flex items-center">
                                <MdOutlineTask className="w-4 h-4 mr-1.5 text-indigo-605" />
                                Subtask Description
                            </span>
                            <span className={`text-[10px] font-bold ${text.length > 200 ? 'text-red-650' : 'text-gray-400 dark:text-slate-500'}`}>
                                {text.length}/200
                            </span>
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-white text-xs leading-relaxed"
                            rows={4}
                            required
                            disabled={isSubmitting}
                            autoFocus
                        />
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold flex items-center">
                            <FaCircleInfo className="w-3 h-3 mr-1" />
                            Update the subtask description as needed
                        </p>
                    </div>

                    {/* Assign To */}
                    <div className="space-y-2">
                        <label className="flex items-center text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                            <FaRegUser className="w-4 h-4 mr-1.5 text-indigo-650" />
                            Assign To
                        </label>

                        {/* Selected Assignee Display */}
                        {selectedAssignee && (
                            <div className="flex items-center p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/80 rounded-sm mb-2">
                                {selectedAssignee.avatar ? (
                                    <img
                                        src={selectedAssignee.avatar}
                                        alt={selectedAssignee.display_name}
                                        className="w-7 h-7 rounded-sm mr-2.5 object-cover"
                                    />
                                ) : (
                                    <Avatar
                                        name={selectedAssignee.display_name}
                                        size={7}
                                        className="mr-2.5 rounded-sm"
                                    />
                                )}
                                <span className="font-bold text-xs text-indigo-800 dark:text-indigo-305">{selectedAssignee.display_name}</span>
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
                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-slate-800 rounded-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-white cursor-pointer text-xs font-medium"
                            disabled={isSubmitting || (!creator && filteredAssignees.length === 0)}
                        >
                            <option value="" className="dark:bg-slate-900">Unassigned</option>
                            {creator && (
                                <option key={creator.id} value={creator.id} className="dark:bg-slate-900">
                                    {creator.display_name} (Creator)
                                </option>
                            )}
                            {filteredAssignees.map((user) => (
                                <option key={user.id} value={user.id} className="dark:bg-slate-900">
                                    {user.display_name}
                                </option>
                            ))}
                        </select>

                        {!creator && filteredAssignees.length === 0 && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider flex items-center">
                                <FaUserLargeSlash className="w-3 h-3 mr-1" />
                                No assignees available for this task
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2 rounded-sm border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !text.trim() || !hasChanges || text.length > 200}
                            className="px-5 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 border border-transparent shadow-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <ClipLoader color="#fff" size={12} />
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <BsSave2 size={10} />
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