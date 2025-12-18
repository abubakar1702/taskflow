import { FaChevronRight } from 'react-icons/fa';
import TaskRow from './TaskRow';

const UpcomingTasks = ({ tasks, onViewAll }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Tasks</h2>
            {tasks.length > 5 && onViewAll && (
                <button onClick={onViewAll} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View All ({tasks.length}) <FaChevronRight size={10} />
                </button>
            )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tasks.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {tasks.slice(0, 5).map(task => <TaskRow key={task.id} task={task} />)}
                </div>
            ) : (
                <div className="p-8 text-center text-gray-500">No upcoming tasks. You're all caught up! 🎉</div>
            )}
        </div>
    </div>
);

export default UpcomingTasks;
