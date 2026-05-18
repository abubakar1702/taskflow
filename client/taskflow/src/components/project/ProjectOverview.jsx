import Avatar from "../common/Avatar";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";

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
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80 p-6">
                <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                    Description
                </h2>
                <p className="text-sm text-gray-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                    {project.description || "No description provided."}
                </p>
            </div>

            {/* Project Info */}
            <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80 p-6">
                <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                    Project Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Created By</p>
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={project.creator.display_name}
                                url={project.creator.avatar}
                                size={9}
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                    {project.creator.display_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                    {project.creator.email}
                                </p>
                             </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Created On</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {formatDate(project.created_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {formatDate(project.updated_at)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Members</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                            <FaUsers className="text-gray-400 dark:text-slate-500" />
                            {project.members.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;