import TaskCard from "../task/TaskCard";
import { FaSpinner, FaTasks } from "react-icons/fa";

const ProjectTasks = ({ tasks, tasksLoading }) => {
    return (
        <div>
            {tasksLoading ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
                    <FaSpinner className="animate-spin text-3xl text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-slate-400">Loading tasks...</p>
                </div>
            ) : tasks && tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            id={task.id}
                            title={task.title}
                            status={task.status}
                            priority={task.priority}
                            assignees={task.assignees}
                            subtasks={task.subtasks}
                            due_date={task.due_date}
                            due_time={task.due_time}
                            project={task.project}
                            creator={task.creator}
                            total_assets={task.total_assets}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-400 dark:text-slate-500 mb-2">
                        <FaTasks className="text-3xl text-gray-400 dark:text-slate-500 mx-auto mb-3" />No Tasks Yet
                    </h3>
                </div>
            )}
        </div>
    );
};

export default ProjectTasks;