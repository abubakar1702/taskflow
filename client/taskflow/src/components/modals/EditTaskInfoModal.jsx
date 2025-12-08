import { useState, useEffect } from "react";
import { useApi } from "../../components/hooks/useApi";
import { FaTimes, FaSpinner } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { BsSave2 } from "react-icons/bs";

const EditTaskInfoModal = ({ isOpen, onClose, task, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [status, setStatus] = useState("To Do");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");

    const { makeRequest, loading, error } = useApi();

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || "");
            setDescription(task.description || "");
            setPriority(task.priority || "Medium");
            setStatus(task.status || "To Do");
            setDueDate(task.due_date || "");
            setDueTime(task.due_time || "");
        }
    }, [task, isOpen]);

    const hasChanges =
        title !== (task?.title || "") ||
        description !== (task?.description || "") ||
        priority !== (task?.priority || "Medium") ||
        status !== (task?.status || "To Do") ||
        dueDate !== (task?.due_date || "") ||
        dueTime !== (task?.due_time || "");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title,
            description,
            priority,
            status,
            due_date: dueDate || null,
            due_time: dueTime || null,
        };

        try {
            await makeRequest(`/api/tasks/${task.id}/`, "PATCH", payload);
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/6 bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error.message || "An error occurred while updating the task"}
                        </div>
                    )}
                    <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="Task title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="12"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                placeholder="Add a description..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
                                >
                                    <option value="Urgent">Urgent</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
                                <input
                                    type="time"
                                    value={dueTime}
                                    onChange={(e) => setDueTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium shadow-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="edit-task-form"
                        disabled={loading || !hasChanges}
                        className={`px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? <ClipLoader color="#fff" size={20} /> : <span className="flex items-center gap-2"><BsSave2 className="w-5 h-5 mr-2" /> Save Changes</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTaskInfoModal;
