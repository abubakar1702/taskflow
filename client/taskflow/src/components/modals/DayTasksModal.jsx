import React from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DayTasksModal = ({ isOpen, onClose, date, tasks, currentUser }) => {
    if (!isOpen || !date) return null;

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 transition-opacity duration-200 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {format(date, 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} scheduled
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
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
                                    <div className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 bg-white group-hover:bg-blue-50/30">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                                                    {task.title}
                                                </h3>
                                                
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                                                        {task.priority || 'No Priority'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                        {task.status || 'No Status'}
                                                    </span>
                                                    {task.subtasks?.some(st => st.assignee?.id === currentUser?.id) && (
                                                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 inline-block">
                                                            Assigned Subtasks
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <FaExternalLinkAlt className="text-gray-300 group-hover:text-blue-500 transition-colors text-sm mt-1" />
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
