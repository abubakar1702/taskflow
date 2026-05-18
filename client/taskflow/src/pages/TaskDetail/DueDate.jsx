import { format } from "date-fns";
import { IoCalendarOutline } from "react-icons/io5";
import TaskTimer from "./TaskTimer";

const DueDate = ({ task, onUpdate, isCreator }) => {
    if (!task) return null;

    const now = new Date();
    let dueDate = task.due_date ? new Date(task.due_date) : null;

    if (dueDate && task.due_time) {
        const [hours, minutes] = task.due_time.split(":");
        dueDate.setHours(hours, minutes, 0);
    } else if (dueDate) {
        dueDate.setHours(23, 59, 59, 999);
    }

    const isCompleted = task.status === "Done" || task.status === "Completed";
    const isOverdue = dueDate && dueDate < now && !isCompleted;
    const isDueToday = dueDate && dueDate.toDateString() === now.toDateString() && !isOverdue && !isCompleted;

    let textColor = "text-gray-700 dark:text-slate-200";
    let iconColor = "text-gray-400 dark:text-slate-400";
    let label = null;

    if (isOverdue) {
        textColor = "text-red-650 dark:text-red-400";
        iconColor = "text-red-500 dark:text-red-400";
        label = <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-red-50 dark:bg-red-950/20 text-[10px] font-bold uppercase tracking-wider border border-red-200 dark:border-red-900">(Overdue)</span>;
    } else if (isDueToday) {
        textColor = "text-purple-600 dark:text-purple-400";
        iconColor = "text-purple-500 dark:text-purple-400";
        label = <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-purple-50 dark:bg-purple-950/20 text-[10px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-900">(Today)</span>;
    }

    const formatDateTime = () => {
        if (!dueDate) return "No due date";
        const formattedDate = format(dueDate, "MMM dd, yyyy");
        if (task.due_time) return `${formattedDate} at ${task.due_time.substring(0, 5)}`;
        return formattedDate;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80 p-5">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Due Date</p>
            <div className={`flex items-center ${textColor}`}>
                <IoCalendarOutline className={`w-4 h-4 mr-2 ${iconColor}`} />
                <span className="font-semibold text-sm">{formatDateTime()}</span>
                {label}
            </div>

            <TaskTimer task={task} onUpdate={onUpdate} isCreator={isCreator} />
        </div>
    );
};

export default DueDate;
