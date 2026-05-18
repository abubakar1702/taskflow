import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { QUERY_KEYS } from '../utils/queryKeys';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { FaPlus, FaCalendar, FaChartPie, FaBolt, FaCog, FaBell, FaChartLine } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import TaskList from '../components/modals/TaskList';
import Stat from '../components/home/Stat';
import TodaysTasks from '../components/home/TodaysTasks';
import UpcomingTasks from '../components/home/UpcomingTasks';
import RunningProjects from '../components/home/RunningProjects';

const ProgressGraph = ({ tasks }) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const chartData = last7Days.map((day, idx) => {
        const dayStr = day.toDateString();
        const dayCompletedTasks = (tasks || []).filter(t => 
            t.status === 'Done' && 
            t.completed_at && 
            new Date(t.completed_at).toDateString() === dayStr
        );

        const timely = dayCompletedTasks.filter(t => !t.due_date || new Date(t.completed_at).setHours(0,0,0,0) <= new Date(t.due_date).setHours(0,0,0,0)).length;
        
        const completedLate = dayCompletedTasks.filter(t => t.due_date && new Date(t.completed_at).setHours(0,0,0,0) > new Date(t.due_date).setHours(0,0,0,0)).length;
        const missedDeadline = (tasks || []).filter(t => 
            t.status !== 'Done' && 
            t.due_date && 
            new Date(t.due_date).toDateString() === dayStr && 
            new Date(t.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
        ).length;

        return {
            label: day.toLocaleDateString('en-US', { weekday: 'short' }),
            timely: timely,
            overdue: completedLate + missedDeadline,
        };
    });

    const maxVal = Math.max(...chartData.map(d => Math.max(d.timely, d.overdue, 5)));
    
    // SVG chart dimensions
    const width = 500;
    const height = 160;
    const padding = 25;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Helper to get coordinates
    const getCoords = (index, value) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth;
        const y = padding + chartHeight - (value / maxVal) * chartHeight;
        return { x, y };
    };

    // Build SVG path points
    const timelyPoints = chartData.map((d, i) => getCoords(i, d.timely));
    const overduePoints = chartData.map((d, i) => getCoords(i, d.overdue));
    
    const buildPath = (pts) => {
        if (pts.length === 0) return "";
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const curr = pts[i];
            const next = pts[i + 1];
            const cpX = curr.x + (next.x - curr.x) / 2;
            d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
        }
        return d;
    };

    const timelyPathD = buildPath(timelyPoints);
    const overduePathD = buildPath(overduePoints);

    // Path for fill area under the line
    const fillD = timelyPoints.length > 0 
        ? `${timelyPathD} L ${timelyPoints[timelyPoints.length - 1].x} ${height - padding} L ${timelyPoints[0].x} ${height - padding} Z`
        : "";

    const [activeIdx, setActiveIdx] = useState(6);

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaChartLine className="text-blue-500" />
                    <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">Weekly Activity Trend</h3>
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                    Past 7 Days
                </div>
            </div>

            {/* Sparkline SVG Chart */}
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
                    <defs>
                        {/* Drop shadow for the main line */}
                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.15" />
                        </filter>
                        {/* Area gradient fill */}
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {Array.from({ length: 4 }).map((_, i) => {
                        const yVal = padding + (i / 3) * chartHeight;
                        return (
                            <line
                                key={i}
                                x1={padding}
                                y1={yVal}
                                x2={width - padding}
                                y2={yVal}
                                className="stroke-gray-100 dark:stroke-slate-800/60"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Fill Path */}
                    {fillD && <path d={fillD} fill="url(#area-grad)" />}

                    {/* Stroke Path - Timely */}
                    {timelyPathD && (
                        <path
                            d={timelyPathD}
                            fill="none"
                            className="stroke-emerald-500 dark:stroke-emerald-400"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            filter="url(#shadow)"
                        />
                    )}

                    {/* Stroke Path - Overdue */}
                    {overduePathD && (
                        <path
                            d={overduePathD}
                            fill="none"
                            className="stroke-red-500 dark:stroke-red-400"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            filter="url(#shadow)"
                        />
                    )}

                    {/* Hover highlights and interactive nodes */}
                    {chartData.map((_, idx) => (
                        <g key={idx} className="cursor-pointer" onClick={() => setActiveIdx(idx)}>
                            {/* Interactive broad zone */}
                            <circle cx={timelyPoints[idx].x} cy={height/2} r="100" fill="transparent" />
                            {/* Rendered node Timely */}
                            <circle
                                cx={timelyPoints[idx].x}
                                cy={timelyPoints[idx].y}
                                r={idx === activeIdx ? "6" : "4"}
                                className={`
                                    transition-all duration-150
                                    ${idx === activeIdx 
                                        ? "fill-emerald-500 dark:fill-emerald-400 stroke-white dark:stroke-slate-900 stroke-2" 
                                        : "fill-emerald-400 dark:fill-emerald-300 opacity-60 hover:opacity-100"}
                                `}
                            />
                            {/* Rendered node Overdue */}
                            <circle
                                cx={overduePoints[idx].x}
                                cy={overduePoints[idx].y}
                                r={idx === activeIdx ? "6" : "4"}
                                className={`
                                    transition-all duration-150
                                    ${idx === activeIdx 
                                        ? "fill-red-500 dark:fill-red-400 stroke-white dark:stroke-slate-900 stroke-2" 
                                        : "fill-red-400 dark:fill-red-300 opacity-60 hover:opacity-100"}
                                `}
                            />
                        </g>
                    ))}

                    {/* Axis Labels */}
                    {chartData.map((d, idx) => {
                        const x = padding + (idx / (chartData.length - 1)) * chartWidth;
                        return (
                            <text
                                key={idx}
                                x={x}
                                y={height - 5}
                                textAnchor="middle"
                                className={`
                                    text-[10px] font-bold uppercase tracking-wider transition-colors duration-150
                                    ${idx === activeIdx 
                                        ? "fill-blue-600 dark:fill-blue-400 font-extrabold" 
                                        : "fill-gray-400 dark:fill-slate-500"}
                                `}
                            >
                                {d.label}
                            </text>
                        );
                    })}
                </svg>

                {/* Floating Tooltip Summary Overlay */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-md mt-4">
                    <div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                            Selected Day
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-slate-200">
                            {last7Days[activeIdx].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex gap-6 text-right">
                        <div>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                                Timely Done
                            </span>
                            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                {chartData[activeIdx].timely}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                                Overdue
                            </span>
                            <span className="text-xs font-extrabold text-red-500 dark:text-red-400">
                                {chartData[activeIdx].overdue}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    const { currentUser } = useUser();

    const { data: tasksData = [], isLoading: tasksLoading } = useQuery({
        queryKey: QUERY_KEYS.userTasks(),
        queryFn: async () => (await apiClient.get('/api/user-tasks/')).data,
    });
    const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.results || []);

    const { data: projectsData = [], isLoading: projectsLoading } = useQuery({
        queryKey: QUERY_KEYS.projects(),
        queryFn: async () => (await apiClient.get('/api/projects/')).data,
    });
    const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.results || []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ tasks: [], title: "" });

    const openTasksModal = (taskList, title) => {
        setModalData({ tasks: taskList, title });
        setIsModalOpen(true);
    };

    const stats = useMemo(() => {
        if (!tasks) return { pending: 0, completed: 0, overdue: 0 };
        return tasks.reduce((acc, task) => {
            if (task.status === 'Done') acc.completed++;
            else {
                acc.pending++;
                if (task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).toDateString() !== new Date().toDateString()) {
                    acc.overdue++;
                }
            }
            return acc;
        }, { pending: 0, completed: 0, overdue: 0 });
    }, [tasks]);

    const weeklyStats = useMemo(() => {
        if (!tasks) return { completed: 0, total: 0 };
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        let completed = 0;
        let pending = 0;

        tasks.forEach(task => {
            if (task.status === 'Done') {
                if (task.completed_at && new Date(task.completed_at) >= oneWeekAgo) {
                    completed++;
                }
            } else {
                if (task.due_date) {
                    const due = new Date(task.due_date);
                    if (due >= oneWeekAgo && due <= endOfWeek) {
                        pending++;
                    }
                } else {
                    pending++;
                }
            }
        });
        return { completed, total: completed + pending };
    }, [tasks]);

    const todayTasks = useMemo(() =>
        (tasks || []).filter(t => t.status !== 'Done' && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString())
        , [tasks]);

    const upcomingTasks = useMemo(() =>
        (tasks || []).filter(t => t.status !== 'Done' && (!t.due_date || new Date(t.due_date).toDateString() !== new Date().toDateString()))
        , [tasks]);

    const completionRate = weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (tasksLoading || projectsLoading) return <LoadingScreen message="Loading dashboard..." fullscreen />;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                            {getGreeting()}, {currentUser?.first_name || 'User'}! 👋
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">Here's what's happening with your projects today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/new-task">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
                                <FaPlus size={14} />
                                <span>New Task</span>
                            </button>
                        </Link>
                        <Link to="/calendar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                                <FaCalendar size={14} />
                                <span>Calendar</span>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <Stat stats={stats} projectsLength={projects.length} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tasks Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <TodaysTasks tasks={todayTasks} onViewAll={() => openTasksModal(todayTasks, "Today's Tasks")} />
                        <UpcomingTasks tasks={upcomingTasks} onViewAll={() => openTasksModal(upcomingTasks, "Upcoming Tasks")} />
                    </div>

                    {/* Right Info Column */}
                    <div className="space-y-8">
                        {/* Weekly Productivity progress ring card */}
                        <div className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-lg shadow-sm p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <FaChartPie className="text-blue-500" />
                                <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">Weekly Productivity</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            className="stroke-gray-100 dark:stroke-slate-800"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-500"
                                            strokeWidth="8"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * completionRate) / 100}
                                            strokeLinecap="round"
                                            fill="transparent"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-base font-black text-gray-900 dark:text-white">{completionRate}%</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                        You've completed <span className="font-semibold text-gray-950 dark:text-slate-100">{weeklyStats.completed}</span> tasks out of <span className="font-semibold text-gray-950 dark:text-slate-100">{weeklyStats.total}</span> assigned this week.
                                    </p>
                                    <div className="text-[10px] font-bold py-0.5 px-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-md inline-block">
                                        {completionRate >= 75 ? "Excellent Pace! ⚡" : completionRate >= 40 ? "Keep making progress! 🚀" : "Power through! 💪"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ProgressGraph tasks={tasks} />

                        <RunningProjects projects={projects} />
                    </div>
                </div>
            </div>

            {/* Task List Modal */}
            <TaskList
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tasks={modalData.tasks}
                title={modalData.title}
            />
        </div>
    );
};

export default Home;
