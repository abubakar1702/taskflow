import { useApi } from "../components/hooks/useApi";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {teamMembers?.map(member => (
                            <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center">
                                <div className="mb-4">
                                    <Avatar name={member.display_name} url={member.avatar} size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.display_name}</h3>
                                <p className="text-sm text-gray-500 mb-4">@{member.username}</p>

                                <div className="mb-6 flex flex-wrap justify-center gap-2">
                                    {getRoleBadge(member)}
                                </div>

                                <div className="mt-auto w-full pt-4 border-t border-gray-100">
                                    <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                        <FaEnvelope />
                                        <span className="text-sm truncate max-w-[200px]">{member.email}</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
