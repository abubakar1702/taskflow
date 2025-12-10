import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskInfoAction from "./TaskInfoAction";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaProjectDiagram } from "react-icons/fa";
import { format } from "date-fns";
import EditTaskInfoModal from "../../components/modals/EditTaskInfoModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { useApi } from "../../components/hooks/useApi";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";

const TaskInfo = ({ task, onUpdate }) => {
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { isCreator, isAssignee } = useTaskPermissions(task);

    const navigate = useNavigate();

    const { makeRequest: leaveTask } = useApi();

    const handleLeaveTask = async () => {
        try {
            await leaveTask(`/api/tasks/${task.id}/leave/`, "PATCH");
            navigate("/");
        } catch (err) {
            console.error("Failed to leave task:", err);
        }
    };

    const priorityColors = {
        Urgent: "bg-red-100 text-red-800 border-red-300",
        High: "bg-orange-100 text-orange-800 border-orange-300",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Low: "bg-green-100 text-green-800 border-green-300",
    };

    const statusColors = {
        "To Do": "bg-gray-100 text-gray-800 border-gray-300",
        "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
        Done: "bg-green-100 text-green-800 border-green-300",
    };

    const safeFormatDate = (value, fmt = "MMM dd, yyyy HH:mm") => {
        if (!value) return "N/A";
        try {
            return format(new Date(value), fmt);
        } catch {
            return "N/A";
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(false);
        onUpdate && onUpdate();
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>

                {(isCreator || isAssignee) && (<div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(!showActionMenu);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <BsThreeDotsVertical className="w-5 h-5" />
                    </button>

                    <TaskInfoAction
                        showActionMenu={showActionMenu}
                        setShowActionMenu={setShowActionMenu}
                        onEdit={() => setShowEditModal(true)}
                        onDelete={() => setShowDeleteModal(true)}
                        onLeave={handleLeaveTask}
                        task={task}
                    />
                </div>)}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[task.status]}`}>
                    {task.status}
                </span>

                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>

                {task.project && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-2">
                        <FaProjectDiagram className="w-4 h-4" />
                        {task.project.name}
                    </span>
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {task.description || "No description provided"}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>Created at: {safeFormatDate(task.created_at)}</div>
                <div>Updated at: {safeFormatDate(task.updated_at)}</div>
            </div>

            {showEditModal && (
                <EditTaskInfoModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    task={task}
                    onUpdate={onUpdate}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                    isLoading={false}
                />
            )}
        </div>
    );
};

export default TaskInfo;
