import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
import { FaExclamationTriangle } from "react-icons/fa";

const Team = () => {
    const { data: teamData, isLoading: loading, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.team(),
        queryFn: async () => (await apiClient.get("/api/team/")).data,
    });
    const teamMembers = Array.isArray(teamData) ? teamData : (teamData?.results || []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">Team Members</h1>
                    <p className="text-gray-600 dark:text-slate-400">The people driving your projects forward.</p>
                </div>

                {loading ? (
                    <LoadingScreen message="Loading team..." height="60vh" />
                ) : error ? (
                    <div className="text-center py-16">
                        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-2">
                            Error Loading Team
                        </h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-4">
                            {error.message}
                        </p>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div>
                        {teamMembers?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Avatar name={member.display_name} url={member.avatar} size={14} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-slate-100 truncate" title={member.display_name}>{member.display_name}</h3>
                                                <a href={`mailto:${member.email}`} className="text-sm text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors" title={member.email}>
                                                    {member.email}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="mt-2 flex-grow">
                                            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Projects</p>
                                            <div className="flex flex-wrap gap-2">
                                                {member.projects && member.projects.length > 0 ? (
                                                    member.projects.map(project => (
                                                        <span key={project.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                            {project.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-slate-500 italic">No Active Projects</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                                No team members found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
