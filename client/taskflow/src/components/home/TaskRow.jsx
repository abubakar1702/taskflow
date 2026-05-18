import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isToday, isValid } from 'date-fns';
import { PRIORITY_DOT_COLORS } from '../constants/uiColors';

const TaskRow = ({ task, isTodayTask = false }) => {
    const dueDate = task.due_date ? parseISO(task.due_date) : null;
    const isDueDateValid = dueDate && isValid(dueDate);

    return (
        <Link
            to={`/tasks/${task.id}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
            <div className="flex items-center justify-between min-w-0 gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 self-center ${
                            PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.default
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 min-w-0">
                            {task.project && (
                                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {task.project.name}
                                </span>
                            )}
                            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-1">
                                {task.description || 'No description'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    {isTodayTask ? (
                        task.due_time ? (
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                                {(() => {
                                    const parsedTime = parseISO(`2000-01-01T${task.due_time}`);
                                    return isValid(parsedTime) ? format(parsedTime, 'h:mm a') : 'No Time';
                                })()}
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                                Today
                            </span>
                        )
                    ) : (
                        <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                                isDueDateValid && isPast(dueDate) && !isToday(dueDate)
                                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                            }`}
                        >
                            {isDueDateValid ? format(dueDate, 'MMM d') : 'No Date'}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TaskRow;
