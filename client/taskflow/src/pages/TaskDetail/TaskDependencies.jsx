import { useNavigate } from "react-router-dom";
import { TbArrowsExchange } from "react-icons/tb";
import { getPriorityColor, getStatusColor } from "../../components/constants/uiColors";

const DependencyItem = ({ task }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="w-full text-left flex items-start gap-3 p-3 rounded-sm border border-gray-200/50 dark:border-slate-800 hover:bg-gray-50/70 dark:hover:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-colors group"
        >
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate group-hover:text-blue-605 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                        {task.status}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </span>
                </div>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
};

const TaskDependencies = ({ task }) => {
    const dependencies = task?.dependencies || [];
    const blocking = task?.blocking || [];

    if (dependencies.length === 0 && blocking.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-none border border-gray-200 dark:border-slate-800/80 p-5">
            <div className="flex items-center gap-2 mb-4">
                <TbArrowsExchange className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">Dependencies</h3>
            </div>

            {dependencies.length > 0 && (
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                        Blocked by ({dependencies.length})
                    </p>
                    <div className="space-y-2">
                        {dependencies.map(dep => (
                            <DependencyItem key={dep.id} task={dep} />
                        ))}
                    </div>
                </div>
            )}

            {blocking.length > 0 && (
                <div>
                    {dependencies.length > 0 && (
                        <div className="h-px bg-gray-200 dark:bg-slate-800 mb-4" />
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                        Blocking ({blocking.length})
                    </p>
                    <div className="space-y-2">
                        {blocking.map(dep => (
                            <DependencyItem key={dep.id} task={dep} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDependencies;
