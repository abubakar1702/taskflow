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
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700 transition-colors px-4 py-3 cursor-pointer h-full flex flex-col">
                {/* Header with Priority and Status */}
                <div className="space-x-2 mb-2">
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_COLORS[priority]}`}
                    >
                        {priority}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[status]}`}
                    >
                        {status}
                    </span>
                </div>

                {/* Task Title */}
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2 leading-snug">
                    {title}
                </h3>

                {/* Project Name */}
                {project && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Project:</span> <span className="text-gray-700 dark:text-slate-300">{project.name}</span>
                    </p>
                )}

                {/* Task Creator */}
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Created by:</span> <span className="text-gray-700 dark:text-slate-300">{creator.display_name}</span>
                </p>

                {/* Subtasks Progress */}
                {totalSubtasks > 0 && (
                    <div className="mb-2.5 mt-1.5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                Subtasks
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-sm h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-sm transition-all duration-300"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Due Date & Time */}
                {due_date && (
                    <div
                        className={`flex items-center gap-4 text-xs mb-2 mt-auto pt-1.5 ${isOverdue() ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-slate-400"
                            }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <FaCalendarAlt className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                            <span>{formatDate(due_date)}</span>
                        </div>
                        {due_time && (
                            <div className="flex items-center gap-1.5">
                                <FaClock className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                                <span>{formatTime(due_time)}</span>
                            </div>
                        )}
                        {isOverdue() && (
                            <span className="font-bold text-red-600 uppercase tracking-wider text-[10px]">Overdue</span>
                        )}
                    </div>
                )}

                {/* Assignees */}
                {assignees.length > 0 && (
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800/80 pt-2.5 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                                {assignees.slice(0, 4).map((assignee, index) => (
                                    <div
                                        key={assignee.id}
                                        className="relative group"
                                        title={assignee.display_name}
                                    >
                                        <Avatar
                                            name={assignee.display_name}
                                            url={assignee.avatar}
                                            size={6}
                                            className="border border-white dark:border-slate-900 rounded-full"
                                        />
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {assignee.display_name}
                                        </div>
                                    </div>
                                ))}
                                {assignees.length > 4 && (
                                    <div className="w-6 h-6 rounded-full border border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-300 text-[10px] font-bold">
                                        +{assignees.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            {total_assets > 0 && (<span className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500 text-xs font-semibold"><FaPaperclip size={12} />{total_assets}</span>)}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default TaskCard;