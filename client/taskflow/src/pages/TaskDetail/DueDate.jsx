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
        textColor = "text-red-600 dark:text-red-400";
        iconColor = "text-red-500 dark:text-red-400";
        label = <span className="ml-2 text-sm font-semibold text-red-600 dark:text-red-400">(Overdue)</span>;
    } else if (isDueToday) {
        textColor = "text-purple-600 dark:text-purple-400";
        iconColor = "text-purple-500 dark:text-purple-400";
        label = <span className="ml-2 text-sm font-semibold text-purple-600 dark:text-purple-400">(Today)</span>;
    }

    const formatDateTime = () => {
        if (!dueDate) return "No due date";
        const formattedDate = format(dueDate, "MMM dd, yyyy");
        if (task.due_time) return `${formattedDate} at ${task.due_time.substring(0, 5)}`;
        return formattedDate;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-transparent dark:border-slate-800 p-4">
            <p className="text-lg py-2 font-semibold text-gray-900 dark:text-white">Due Date</p>
            <div className={`flex items-center ${textColor}`}>
                <IoCalendarOutline className={`w-5 h-5 mr-3 ${iconColor}`} />
                <span className="font-medium text-base">{formatDateTime()}</span>
                {label}
            </div>

            <TaskTimer task={task} onUpdate={onUpdate} isCreator={isCreator} />
        </div>
    );
};

export default DueDate;
