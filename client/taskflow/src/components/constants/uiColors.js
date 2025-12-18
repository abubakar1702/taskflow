export const PRIORITY_COLORS = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
    Urgent: "bg-gray-100 text-gray-800 border-gray-200",
};

export const STATUS_COLORS = {
    "To Do": "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
    "Done": "bg-green-100 text-green-800 border-green-200",
};

export const PRIORITY_DOT_COLORS = {
    High: "bg-red-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
    Urgent: "bg-gray-500",
};

export const DEFAULT_BADGE =
    "bg-gray-100 text-gray-800 border-gray-200";

export const getPriorityColor = (priority) =>
    PRIORITY_COLORS[priority] || DEFAULT_BADGE;

export const getStatusColor = (status) =>
    STATUS_COLORS[status] || DEFAULT_BADGE;