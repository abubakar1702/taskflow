import { Link } from "react-router-dom";
import Avatar from "../common/Avatar"
import {
    FaClock,
    FaCalendarAlt,
    FaPaperclip,
} from "react-icons/fa";
import { PRIORITY_COLORS, STATUS_COLORS } from "../constants/uiColors";

const TaskCard = ({
    id,
    title,
    status,
    priority,
    assignees = [],
    subtasks = [],
    due_date,
    due_time,
    project,
    creator,
    total_assets,
}) => {
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const completedSubtasks = subtasks.filter((st) => st.is_completed).length;
    const totalSubtasks = subtasks.length;
    const completionPercentage =
        totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const isOverdue = () => {
        if (!due_date) return false;
        const now = new Date();
        const dueDateTime = new Date(`${due_date}T${due_time || "23:59:59"}`);
        return now > dueDateTime && status !== "Done";
    };

    return (
        <Link to={`/tasks/${id}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5 cursor-pointer h-full flex flex-col">
                {/* Header with Priority and Status */}
                <div className="space-x-2 mb-3">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[priority]}`}
                    >
                        {priority}
                    </span>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
                    >
                        {status}
                    </span>
                </div>

                {/* Task Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {title}
                </h3>

                {/* Project Name */}
                {project && (
                    <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Project:</span> {project.name}
                    </p>
                )}

                {/* Task Creator */}
                <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Created by:</span> {creator.display_name}
                </p>

                {/* Subtasks Progress */}
                {totalSubtasks > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 font-medium">
                                Subtasks
                            </span>
                            <span className="text-xs text-gray-500">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Due Date & Time */}
                {due_date && (
                    <div
                        className={`flex items-center gap-4 text-xs mb-4 ${isOverdue() ? "text-red-600" : "text-gray-600"
                            }`}
                    >
                        <div className="flex items-center gap-1">
                            <FaCalendarAlt />
                            <span>{formatDate(due_date)}</span>
                        </div>
                        {due_time && (
                            <div className="flex items-center gap-1">
                                <FaClock />
                                <span>{formatTime(due_time)}</span>
                            </div>
                        )}
                        {isOverdue() && (
                            <span className="font-semibold text-red-600">Overdue</span>
                        )}
                    </div>
                )}

                {/* Assignees */}
                {assignees.length > 0 && (
                    <div className="flex justify-between items-center border-t pt-3 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {assignees.slice(0, 4).map((assignee, index) => (
                                    <div
                                        key={assignee.id}
                                        className="relative group"
                                        title={assignee.display_name}
                                    >
                                        <Avatar
                                            name={assignee.display_name}
                                            url={assignee.avatar}
                                            size={8}
                                            className="border-2 border-white"
                                        />
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {assignee.display_name}
                                        </div>
                                    </div>
                                ))}
                                {assignees.length > 4 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
                                        +{assignees.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            {total_assets > 0 && (<span className="flex items-center gap-2 text-gray-400"><FaPaperclip size={16} />{total_assets}</span>)}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default TaskCard;