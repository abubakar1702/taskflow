import Avatar from "../../components/common/Avatar";

const TaskCreator = ({ task }) => {
    return (
        <div>
            <div className="space-y-3">
                <p className="text-sm font-semibold">
                    Created by
                </p>

                <div className="flex items-center gap-3">
                    {task.creator?.avatar ? (
                        <img
                            src={task.creator.avatar}
                            alt={task.creator.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <Avatar
                            name={task.creator.display_name}
                            size={10}
                        />
                    )}

                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-base">
                            {task.creator?.display_name}
                        </span>
                        <span className="text-sm text-gray-500">
                            {task.creator?.email}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCreator;
