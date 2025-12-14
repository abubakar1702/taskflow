import Avatar from "../common/Avatar";
import { FaCalendarAlt, FaUsers, FaEdit, FaTrash } from "react-icons/fa";

const ProjectOverview = ({ project }) => {
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Description Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {project.description || "No description provided."}
                </p>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Created By</p>
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={project.creator.display_name}
                                url={project.creator.avatar}
                                size={10}
                            />
                            <div>
                                <p className="font-medium text-gray-900">
                                    {project.creator.display_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {project.creator.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Created On</p>
                        <p className="font-medium text-gray-900">
                            {formatDate(project.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Last Updated</p>
                        <p className="font-medium text-gray-900">
                            {formatDate(project.updated_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Total Members</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                            <FaUsers className="text-gray-400" />
                            {project.members.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;