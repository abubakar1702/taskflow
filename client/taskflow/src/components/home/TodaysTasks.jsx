import { FaSun, FaChevronRight } from 'react-icons/fa';
import TaskRow from './TaskRow';

const TodaysTasks = ({ tasks, onViewAll }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <FaSun className="text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Today's Tasks</h2>
            </div>
            {tasks.length > 5 && onViewAll && (
                <button onClick={onViewAll} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                    View All ({tasks.length}) <FaChevronRight size={10} />
                </button>
            )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            {tasks.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                    {tasks.slice(0, 5).map(task => <TaskRow key={task.id} task={task} isTodayTask />)}
                </div>
            ) : (
                <div className="p-8 text-center bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaSun size={20} />
                    </div>
                    <h3 className="text-gray-900 dark:text-slate-100 font-medium">Clear for today!</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Enjoy your day or pick up some upcoming tasks.</p>
                </div>
            )}
        </div>
    </div>
);

export default TodaysTasks;
