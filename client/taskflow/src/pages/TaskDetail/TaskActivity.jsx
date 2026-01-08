import { FaTimes, FaCheckCircle, FaUserPlus, FaClock, FaEdit, FaTrash, FaPaperclip } from "react-icons/fa";
import { LuSquareActivity } from "react-icons/lu";
import Avatar from "../../components/common/Avatar";

const TaskActivity = ({ isOpen, onClose, taskTitle }) => {
    if (!isOpen) return null;

    // Static activity data for demonstration
    const activities = [
        {
            id: 1,
            type: "status_change",
            user: { display_name: "John Doe", avatar: null },
            action: "changed status from",
            from: "In Progress",
            to: "Done",
            timestamp: "2025-01-07T10:30:00",
        },
        {
            id: 2,
            type: "assignee_added",
            user: { display_name: "Sarah Smith", avatar: null },
            action: "assigned",
            assignee: { display_name: "Mike Johnson", avatar: null },
            timestamp: "2025-01-07T09:15:00",
        },
        {
            id: 3,
            type: "comment",
            user: { display_name: "Emily Brown", avatar: null },
            action: "commented",
            comment: "Great progress on this task! Let's aim to complete the testing phase by tomorrow.",
            timestamp: "2025-01-07T08:45:00",
        },
        {
            id: 4,
            type: "due_date",
            user: { display_name: "John Doe", avatar: null },
            action: "updated due date to",
            date: "Jan 10, 2025",
            timestamp: "2025-01-06T16:20:00",
        },
        {
            id: 5,
            type: "asset_added",
            user: { display_name: "Mike Johnson", avatar: null },
            action: "added attachment",
            fileName: "design_mockup_v2.pdf",
            timestamp: "2025-01-06T14:30:00",
        },
        {
            id: 6,
            type: "priority_change",
            user: { display_name: "Sarah Smith", avatar: null },
            action: "changed priority from",
            from: "Medium",
            to: "High",
            timestamp: "2025-01-06T11:00:00",
        },
        {
            id: 7,
            type: "created",
            user: { display_name: "John Doe", avatar: null },
            action: "created this task",
            timestamp: "2025-01-05T09:00:00",
        },
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case "status_change":
                return <FaCheckCircle className="text-green-500" />;
            case "assignee_added":
                return <FaUserPlus className="text-blue-500" />;
            case "due_date":
                return <FaClock className="text-orange-500" />;
            case "comment":
                return <LuSquareActivity className="text-purple-500" />;
            case "asset_added":
                return <FaPaperclip className="text-gray-500" />;
            case "priority_change":
                return <FaEdit className="text-amber-500" />;
            case "created":
                return <FaCheckCircle className="text-blue-500" />;
            default:
                return <LuSquareActivity className="text-gray-500" />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <LuSquareActivity className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Activity</h2>
                            <p className="text-sm text-gray-500 line-clamp-1">{taskTitle || "Task Activity"}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Activity List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="flex gap-4 relative">
                                {/* Timeline line */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                                )}

                                {/* Icon */}
                                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm relative z-10">
                                    {getActivityIcon(activity.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Avatar
                                                name={activity.user.display_name}
                                                url={activity.user.avatar}
                                                size={6}
                                            />
                                            <span className="font-semibold text-gray-900 text-sm">
                                                {activity.user.display_name}
                                            </span>
                                            <span className="text-gray-600 text-sm">
                                                {activity.action}
                                            </span>
                                            {activity.from && activity.to && (
                                                <span className="text-sm">
                                                    <span className="text-gray-500 line-through">{activity.from}</span>
                                                    {" → "}
                                                    <span className="font-medium text-gray-900">{activity.to}</span>
                                                </span>
                                            )}
                                            {activity.assignee && (
                                                <div className="flex items-center gap-1">
                                                    <Avatar
                                                        name={activity.assignee.display_name}
                                                        url={activity.assignee.avatar}
                                                        size={5}
                                                    />
                                                    <span className="font-medium text-gray-900 text-sm">
                                                        {activity.assignee.display_name}
                                                    </span>
                                                </div>
                                            )}
                                            {activity.date && (
                                                <span className="font-medium text-gray-900 text-sm">
                                                    {activity.date}
                                                </span>
                                            )}
                                            {activity.fileName && (
                                                <span className="font-medium text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded">
                                                    {activity.fileName}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatTimestamp(activity.timestamp)}
                                        </span>
                                    </div>

                                    {/* Comment content */}
                                    {activity.comment && (
                                        <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                                            {activity.comment}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <p className="text-xs text-gray-500 text-center">
                        Showing {activities.length} activities
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TaskActivity;