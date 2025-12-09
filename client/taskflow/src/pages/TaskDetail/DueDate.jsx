import { format } from "date-fns";
import { IoCalendarOutline } from "react-icons/io5";

const DueDate = ({ task }) => {
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

    let textColor = "text-gray-700";
    let iconColor = "text-gray-400";
    let label = null;

    if (isOverdue) {
        textColor = "text-red-600";
        iconColor = "text-red-500";
        label = <span className="ml-2 text-sm font-semibold text-red-600">(Overdue)</span>;
    } else if (isDueToday) {
        textColor = "text-purple-600";
        iconColor = "text-purple-500";
        label = <span className="ml-2 text-sm font-semibold text-purple-600">(Today)</span>;
    }

    const formatDateTime = () => {
        if (!dueDate) return "No due date";
        const formattedDate = format(dueDate, "MMM dd, yyyy");
        if (task.due_time) return `${formattedDate} at ${task.due_time.substring(0, 5)}`;
        return formattedDate;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <p className="text-lg py-2 font-semibold">Due Date</p>
            <div className={`flex items-center ${textColor}`}>
                <IoCalendarOutline className={`w-5 h-5 mr-3 ${iconColor}`} />
                <span className="font-medium text-base">{formatDateTime()}</span>
                {label}
            </div>
        </div>
    );
};

export default DueDate;
