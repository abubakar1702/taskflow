import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PRIORITY_DOT_COLORS } from '../constants/uiColors';

const TaskList = ({ isOpen, onClose, tasks, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Link
                                key={task.id}
                                to={`/tasks/${task.id}`}
                                onClick={onClose}
                                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-blue-50/50 hover:border-blue-100 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`}
                                    />
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">{task.title}</h4>
                                        <p className="text-sm text-gray-500 truncate">{task.project?.name || '---'}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="text-sm font-semibold text-gray-700">
                                        {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'No Due Date'}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">No tasks found.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button 
                        onClick={onClose}
                        className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
