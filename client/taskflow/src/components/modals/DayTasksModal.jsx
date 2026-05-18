import React from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DayTasksModal = ({ isOpen, onClose, date, tasks, currentUser }) => {
    if (!isOpen || !date) return null;

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
            default: return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border-gray-200 dark:border-slate-700';
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 transition-opacity duration-200 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                            {format(date, 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} scheduled
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                            No tasks scheduled for this day.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <Link
                                    to={`/tasks/${task.id}`}
                                    key={task.id}
                                    className="block group"
                                >
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-900 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                    {task.title}
                                                </h3>
                                                
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                                                        {task.priority || 'No Priority'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wide">
                                                        {task.status || 'No Status'}
                                                    </span>
                                                    {task.subtasks?.some(st => st.assignee?.id === currentUser?.id) && (
                                                        <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 inline-block">
                                                            Assigned Subtasks
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <FaExternalLinkAlt className="text-gray-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-sm mt-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DayTasksModal;
