import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';
import { QUERY_KEYS } from '../utils/queryKeys';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { FaPlus, FaCalendar } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import TaskList from '../components/modals/TaskList';
import Stat from '../components/home/Stat';
import TodaysTasks from '../components/home/TodaysTasks';
import UpcomingTasks from '../components/home/UpcomingTasks';
import RunningProjects from '../components/home/RunningProjects';

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

    const todayTasks = useMemo(() =>
        (tasks || []).filter(t => t.status !== 'Done' && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString())
        , [tasks]);

    const upcomingTasks = useMemo(() =>
        (tasks || []).filter(t => t.status !== 'Done' && (!t.due_date || new Date(t.due_date).toDateString() !== new Date().toDateString()))
        , [tasks]);


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

                    {/* Projects Column */}
                    <RunningProjects projects={projects} />
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
