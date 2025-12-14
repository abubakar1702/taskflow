import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import { FaUsers, FaCalendarAlt } from "react-icons/fa";

const ProjectCard = ({ project }) => {
    const { id, name, description, creator, members, created_at } = project;

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Get the admin members
    const adminMembers = members.filter(member => member.role === "Admin");
    const totalMembers = members.length;

    // Truncate description to 120 characters
    const truncatedDescription = description?.length > 120
        ? description.substring(0, 120) + "..."
        : description;

    return (
        <Link to={`/projects/${id}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 cursor-pointer h-full flex flex-col">
                {/* Header with Project Name */}
                <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                        {name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Created {formatDate(created_at)}</span>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {truncatedDescription}
                    </p>
                )}

                {/* Creator */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Created by</p>
                    <div className="flex items-center gap-2">
                        <Avatar
                            name={creator.display_name}
                            url={creator.avatar}
                            size={8}
                        />
                        <span className="text-sm font-medium text-gray-700">
                            {creator.display_name}
                        </span>
                    </div>
                </div>

                {/* Members Section */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaUsers className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {totalMembers} {totalMembers === 1 ? "Member" : "Members"}
                            </span>
                        </div>

                        {/* Member Avatars */}
                        <div className="flex -space-x-2">
                            {members.slice(0, 5).map((member) => (
                                <div
                                    key={member.id}
                                    className="relative group"
                                    title={`${member.user.display_name} (${member.role})`}
                                >
                                    <Avatar
                                        name={member.user.display_name}
                                        url={member.user.avatar}
                                        size={8}
                                        className="border-2 border-white ring-1 ring-gray-200"
                                    />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {member.user.display_name} ({member.role})
                                    </div>
                                </div>
                            ))}
                            {totalMembers > 5 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold ring-1 ring-gray-200">
                                    +{totalMembers - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;