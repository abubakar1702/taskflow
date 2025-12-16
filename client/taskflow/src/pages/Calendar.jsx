import React, { useState, useMemo } from 'react';
import { useApi } from '../components/hooks/useApi';

import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    isToday, parseISO
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';
import DayTasksModal from '../components/modals/DayTasksModal';
import { useUser } from '../contexts/UserContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Calendar() {
    const { currentUser } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: tasks = [], loading, error } = useApi(`${API_BASE_URL}/api/user-tasks/`, "GET");

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate]);

    const tasksByDate = useMemo(() => {
        if (!tasks) return {};
        const map = {};
        tasks.forEach(task => {
            if (task.due_date) {
                const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd');
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push(task);
            }
        });
        return map;
    }, [tasks]);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const urlToToday = () => setCurrentDate(new Date());

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setIsModalOpen(true);
    };

    const frameTasks = (day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        return tasksByDate[dayKey] || [];
    };

    const hasAssignedSubtask = (tasks) => {
        if (!tasks || !currentUser) return false;
        return tasks.some(task =>
            Array.isArray(task.subtasks) &&
            task.subtasks.some(subtask => subtask.assignee?.id === currentUser.id)
        );
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <LoadingScreen message="Loading calendar..." fullscreen />;

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                Error loading tasks: {error.message}
            </div>
        );
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 font-sans text-gray-900">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100 sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-blue-600 p-3 rounded-xl text-white">
                        <FaCalendarAlt className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {format(currentDate, 'MMMM yyyy')}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">Manage your schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white hover:shadow-md rounded-lg text-gray-600 transition-all duration-200"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={urlToToday}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white hover:shadow-md rounded-lg text-gray-600 transition-all duration-200"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {weekDays.map(day => (
                        <div key={day} className="py-4 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-fr">
                    {calendarDays.map(day => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayTasks = tasksByDate[dayKey] || [];
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isTodayDate = isToday(day);
                        const hasUserSubtasks = hasAssignedSubtask(dayTasks);

                        return (
                            <div
                                key={dayKey}
                                onClick={() => handleDayClick(day)}
                                className={`
                            min-h-[100px] p-2 border-r border-b border-gray-100 transition-colors duration-200
                            ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                            ${isTodayDate ? 'bg-blue-50/50' : ''}
                            ${hasUserSubtasks ? 'border bg-blue-200' : ''}
                            hover:bg-gray-50 relative group cursor-pointer
                        `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span
                                        className={`
                                    text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                                    ${isTodayDate ? 'bg-blue-600 text-white' : 'text-gray-700'}
                                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                                `}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <span className="text-xs font-bold text-gray-400">
                                            {dayTasks.length}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div
                                            key={task.id}
                                            className={`
                                        block px-2 py-1 rounded-md text-xs font-medium border truncate transition-all duration-200 hover:opacity-80
                                        ${getPriorityColor(task.priority)}
                                    `}
                                            title={task.title}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-xs text-center font-medium text-gray-400 hover:text-gray-600 transition-colors">
                                            +{dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDay && (
                <DayTasksModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    date={selectedDay}
                    tasks={frameTasks(selectedDay)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

export default Calendar;