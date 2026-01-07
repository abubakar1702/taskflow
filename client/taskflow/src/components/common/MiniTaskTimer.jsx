import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MiniTaskTimer = ({ task }) => {
    const [seconds, setSeconds] = useState(0);

    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;
        const parts = durationStr.split(" ");
        let timeStr = parts.length > 1 ? parts[1] : parts[0];
        const days = parts.length > 1 ? parseInt(parts[0]) : 0;
        const [h, m, s] = timeStr.split(":").map(Number);
        return days * 86400 + h * 3600 + m * 60 + Math.floor(s || 0);
    };

    const formatDisplayTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    useEffect(() => {
        if (!task) return;

        const baseSeconds = parseDuration(task.time_taken);
        let interval;

        if (task.timer_start_time) {
            const startTime = new Date(task.timer_start_time).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diffValues = Math.floor((now - startTime) / 1000);
                setSeconds(baseSeconds + diffValues);
            };

            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setSeconds(baseSeconds);
        }

        return () => clearInterval(interval);
    }, [task]);

    return (
        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg text-sm border border-blue-100 mb-2 last:mb-0">
            <Link to={`/tasks/${task.id}`} className="font-medium text-blue-800 hover:underline truncate max-w-[150px]" title={task.title}>
                {task.title}
            </Link>
            <span className="font-mono font-bold text-blue-600 ml-2">
                {formatDisplayTime(seconds)}
            </span>
        </div>
    );
};

export default MiniTaskTimer;
