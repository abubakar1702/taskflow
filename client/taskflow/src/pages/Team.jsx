import { useApi } from "../components/hooks/useApi";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
import MiniTaskTimer from "../components/common/MiniTaskTimer";
import { FaEnvelope, FaUserShield, FaUserTag, FaExclamationTriangle } from "react-icons/fa";

const Team = () => {
    const { data: teamMembers, loading, error, refetch } = useApi("/api/team/");

    const getRoleBadge = (user) => {
        if (user.is_superuser) {
            return (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaUserShield /> Super Admin
                </span>
            );
        }
        if (user.is_staff) {
            return (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaUserTag /> Staff
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                Member
            </span>
        );
    };

    const activeMembers = teamMembers?.filter(m => m.running_tasks && m.running_tasks.length > 0) || [];
    const otherMembers = teamMembers?.filter(m => !m.running_tasks || m.running_tasks.length === 0) || [];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h1>
                    <p className="text-gray-600">Meet the team behind the magic.</p>
                </div>

                {loading ? (
                    <LoadingScreen message="Loading team..." height="60vh" />
                ) : error ? (
                    <div className="text-center py-16">
                        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Error Loading Team
                        </h2>
                        <p className="text-gray-600 mb-4">
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
                    <div className="space-y-12">
                        {/* Active Members Section */}
                        {activeMembers.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-800">Working Now</h2>
                                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {activeMembers.length} Active
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeMembers.map(member => (
                                        <div key={member.id} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-green-500 border-gray-100 p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={member.display_name} url={member.avatar} size={12} />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{member.display_name}</h3>
                                                        <p className="text-xs text-gray-500">@{member.username}</p>
                                                    </div>
                                                </div>
                                                <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <FaEnvelope />
                                                </a>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Current Tasks</p>
                                                <div className="space-y-2">
                                                    {member.running_tasks.map(task => (
                                                        <MiniTaskTimer key={task.id} task={task} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                                {getRoleBadge(member)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Other Members Section */}
                        {otherMembers.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Team Directory</h2>
                                    <span className="text-gray-500 text-sm">{otherMembers.length} Members</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {otherMembers.map(member => (
                                        <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center">
                                            <div className="mb-4 relative">
                                                <Avatar name={member.display_name} url={member.avatar} size={20} />
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${member.is_active ? 'bg-gray-300' : 'bg-gray-300'}`} title="Offline"></div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{member.display_name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">@{member.username}</p>

                                            <div className="mb-6 flex flex-wrap justify-center gap-2">
                                                {getRoleBadge(member)}
                                            </div>

                                            <div className="mt-auto w-full pt-4 border-t border-gray-100">
                                                <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                                                    <FaEnvelope />
                                                    <span>Email</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {teamMembers?.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
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
