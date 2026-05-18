import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { PRIORITY_DOT_COLORS } from '../constants/uiColors';

const TaskRow = ({ task, isTodayTask = false }) => {
    const dueDate = task.due_date ? parseISO(task.due_date) : null;

    return (
        <Link
            to={`/tasks/${task.id}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 self-center ${
                            PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.default
                        }`}
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            {task.project && (
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                    {task.project.name}
                                </span>
                            )}
                            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1">
                                {task.description || 'No description'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    {isTodayTask ? (
                        task.due_time && (
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                {format(parseISO(`2000-01-01T${task.due_time}`), 'h:mm a')}
                            </span>
                        )
                    ) : (
                        <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                                dueDate && isPast(dueDate) ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                            }`}
                        >
                            {dueDate ? format(dueDate, 'MMM d') : 'No Date'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TaskRow;
