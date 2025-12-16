import React, { useMemo } from 'react';
import { useApi } from '../components/hooks/useApi';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import {
    FaTasks, FaCheckCircle, FaProjectDiagram, FaClock,
    FaPlus, FaCalendarAlt, FaSun
} from 'react-icons/fa';
import { format, isToday, isPast, parseISO } from 'date-fns';
import LoadingScreen from '../components/common/LoadingScreen';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Home = () => {
    const { currentUser } = useUser();
    const { data: tasks = [], loading: tasksLoading } = useApi(`${API_BASE_URL}/api/user-tasks/`, "GET");
    const { data: projects = [], loading: projectsLoading } = useApi(`${API_BASE_URL}/api/projects/`, "GET");

    const stats = useMemo(() => {
        if (!tasks) return { pending: 0, completed: 0, overdue: 0 };

        return tasks.reduce((acc, task) => {
            if (task.status === 'DONE') {
                acc.completed++;
            } else {
                acc.pending++;
                if (task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))) {
                    acc.overdue++;
                }
            }
            return acc;
        }, { pending: 0, completed: 0, overdue: 0 });
    }, [tasks]);

    const todayTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(t => t.status !== 'DONE' && t.due_date && isToday(parseISO(t.due_date)));
    }, [tasks]);

    const recentTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks
            .filter(t => t.status !== 'DONE')
            .filter(t => !t.due_date || !isToday(parseISO(t.due_date)))
            .sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            })
            .slice(0, 5);
    }, [tasks]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (tasksLoading || projectsLoading) {
        return <LoadingScreen message="Loading dashboard..." fullscreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {getGreeting()}, {currentUser?.first_name || 'User'}! 👋
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Here's what's happening with your projects today.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/new-task">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
                                <FaPlus size={14} />
                                <span>New Task</span>
                            </button>
                        </Link>
                        <Link to="/calendar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                                <FaCalendarAlt size={14} />
                                <span>Calendar</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<FaTasks className="text-blue-600" />}
                        label="Pending Tasks"
                        value={stats.pending}
                        color="bg-blue-50"
                        borderColor="border-blue-100"
                    />
                    <StatCard
                        icon={<FaCheckCircle className="text-green-600" />}
                        label="Completed Tasks"
                        value={stats.completed}
                        color="bg-green-50"
                        borderColor="border-green-100"
                    />
                    <StatCard
                        icon={<FaClock className="text-orange-600" />}
                        label="Overdue Tasks"
                        value={stats.overdue}
                        color="bg-orange-50"
                        borderColor="border-orange-100"
                    />
                    <StatCard
                        icon={<FaProjectDiagram className="text-purple-600" />}
                        label="Active Projects"
                        value={projects.length}
                        color="bg-purple-50"
                        borderColor="border-purple-100"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tasks Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Today's Tasks */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FaSun className="text-orange-500" />
                                    <h2 className="text-lg font-bold text-gray-900">Today's Tasks</h2>
                                </div>
                                <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                    {todayTasks.length}
                                </span>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {todayTasks.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {todayTasks.map(task => (
                                            <Link
                                                key={task.id}
                                                to={`/tasks/${task.id}`}
                                                className="block p-4 hover:bg-orange-50/30 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`
                                                            mt-1 w-2 h-2 rounded-full flex-shrink-0
                                                            ${task.priority === 'HIGH' ? 'bg-red-500' :
                                                                task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}
                                                        `} />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {task.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {task.project && (
                                                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {task.project.name}
                                                                    </span>
                                                                )}
                                                                <p className="text-sm text-gray-500 line-clamp-1">
                                                                    {task.description || "No description"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-4">
                                                        {task.due_time && (
                                                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                                {format(parseISO(`2000-01-01T${task.due_time}`), 'h:mm a')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-gray-50/50">
                                        <div className="w-12 h-12 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FaSun size={20} />
                                        </div>
                                        <h3 className="text-gray-900 font-medium">Clear for today!</h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Enjoy your day or pick up some upcoming tasks.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Upcoming Tasks</h2>
                                <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {recentTasks.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {recentTasks.map(task => (
                                            <Link
                                                key={task.id}
                                                to={`/tasks/${task.id}`}
                                                className="block p-4 hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`
                                                            mt-1 w-2 h-2 rounded-full flex-shrink-0
                                                            ${task.priority === 'HIGH' ? 'bg-red-500' :
                                                                task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}
                                                        `} />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {task.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                                                {task.description || "No description"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
                                                            ? 'text-red-600 bg-red-50'
                                                            : 'text-gray-500 bg-gray-100'
                                                            }`}>
                                                            {task.due_date ? format(parseISO(task.due_date), 'MMM d') : 'No Date'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No upcoming tasks. You're all caught up! 🎉
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects Summary */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
                            <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-4 space-y-3">
                            {projects.length > 0 ? (
                                projects.slice(0, 4).map(project => (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {project.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{project.description || "No description"}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    No active projects.
                                </div>
                            )}
                            <Link to="/projects" className="block mt-4">
                                <button className="w-full py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                                    View All Projects
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, borderColor }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default Home;