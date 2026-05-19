import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MiniTaskTimer = ({ task, showTitle = true }) => {
    const [seconds, setSeconds] = useState(0);

    const formatDisplayTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    useEffect(() => {
        if (!task) return;

        let interval;
        if (task.active_timer_start) {
            const startTime = new Date(task.active_timer_start).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                setSeconds(Math.floor((now - startTime) / 1000));
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setSeconds(task.total_time_taken || 0);
        }

        return () => clearInterval(interval);
    }, [task]);

    return (
        <div className={`flex items-center ${showTitle ? 'justify-between bg-blue-50 px-3 py-2 border border-blue-100' : 'justify-center'} rounded-lg text-sm mb-2 last:mb-0`}>
            {showTitle && (
                <Link to={`/tasks/${task.id}`} className="font-medium text-blue-800 hover:underline truncate max-w-[150px]" title={task.title}>
                    {task.title}
                </Link>
            )}
            <span className={`font-mono font-bold text-blue-600 ${showTitle ? 'ml-2' : ''}`}>
                {formatDisplayTime(seconds)}
            </span>
        </div>
    );
};

export default MiniTaskTimer;
