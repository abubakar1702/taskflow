import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import LoadingScreen from "../components/common/LoadingScreen";
import { FaClock, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import MiniTaskTimer from "../components/common/MiniTaskTimer";

const RunningTasks = () => {
    const {
        data: tasksData,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: QUERY_KEYS.runningTasks(),
        queryFn: async () => (await apiClient.get("/api/tasks/running/")).data,
        refetchInterval: 1000 * 60,
    });
    const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.results || []);

    if (loading) return <LoadingScreen message="Loading running tasks..." height="60vh" />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-1">Failed to load tasks</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-4">{error.message}</p>
                <button onClick={refetch} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950/50 px-4 py-8 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <FaClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                            In Progress Tasks
                            <span className="ml-2 text-gray-500 dark:text-slate-400 font-medium">({tasks?.length || 0})</span>
                        </h1>
                        <p className="text-gray-600 dark:text-slate-400">Tasks currently being worked on.</p>
                    </div>
                </div>

                {!tasks || tasks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm py-20 text-center">
                        <FaClock className="mx-auto text-gray-300 dark:text-slate-600 w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">No active tasks</h3>
                        <p className="text-gray-500 dark:text-slate-400">Nothing is running right now.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700/50">
                        {tasks.map((task) => (
                            <div key={task.id} className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <Link to={`/tasks/${task.id}`} className="text-lg font-semibold text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate">
                                            {task.title}
                                        </Link>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                                        <span className="font-medium text-gray-700 dark:text-slate-300">{task.project?.name || "No Project"}</span>
                                        <span className="text-gray-300 dark:text-slate-600">•</span>
                                        <Avatar name={task.creator.display_name} url={task.creator.avatar} size={6} />
                                        <span className="text-gray-300 dark:text-slate-600">•</span>
                                        <div>
                                            {task.assignees?.length ? (
                                                <div className="flex items-center -space-x-2">
                                                    {task.assignees.slice(0, 3).map((user, index) => (
                                                        <div key={user.id} className="relative ring-2 ring-white dark:ring-slate-800 rounded-full" style={{ zIndex: 3 - index }}>
                                                            <Avatar name={user.display_name} url={user.avatar} size={6} />
                                                        </div>
                                                    ))}
                                                    {task.assignees.length > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-slate-300">
                                                            +{task.assignees.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 dark:text-slate-500 italic">Unassigned</span>
                                            )}
                                        </div>
                                        <span className="text-gray-300 dark:text-slate-600">•</span>
                                        <span>{new Date(task.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end md:min-w-[150px]">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${task.timer_start_time ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800" : "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800"}`}>
                                        <FaClock className={`w-4 h-4 ${task.timer_start_time ? "text-blue-600 dark:text-blue-400 animate-spin-slow" : "text-amber-500 dark:text-amber-400"}`} />
                                        <span className={`font-mono text-lg font-bold ${task.timer_start_time ? "text-blue-700 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                                            <MiniTaskTimer task={task} showTitle={false} />
                                        </span>
                                        {!task.timer_start_time && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Paused</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RunningTasks;