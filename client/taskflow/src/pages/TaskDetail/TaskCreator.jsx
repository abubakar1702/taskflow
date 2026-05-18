import Avatar from "../../components/common/Avatar";

const TaskCreator = ({ task }) => {
    return (
        <div>
            <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Created by
                </p>

                <div className="flex items-center gap-3">
                    {task.creator?.avatar ? (
                        <img
                            src={task.creator.avatar}
                            alt={task.creator.display_name}
                            className="w-8 h-8 rounded-sm object-cover"
                        />
                    ) : (
                        <Avatar
                            name={task.creator.display_name}
                            size={8}
                            className="rounded-sm"
                        />
                    )}

                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white text-xs">
                            {task.creator?.display_name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5">
                            {task.creator?.email}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCreator;
