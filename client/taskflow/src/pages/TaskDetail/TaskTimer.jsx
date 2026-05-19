import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { toast } from "react-toastify";
import { IoPlay, IoPause, IoStop } from "react-icons/io5";

const TaskTimer = ({ task, onUpdate }) => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(task?.id) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.runningTasks() });
    };

    const { mutate: startTimer, isPending: starting } = useMutation({
        mutationFn: () => apiClient.post(`/api/tasks/${task.id}/timer/start/`),
        onSuccess: () => { invalidate(); onUpdate(); },
        onError: (err) => toast.error(err.response?.data?.detail || "Failed to start timer"),
    });

    const { mutate: stopTimer, isPending: stopping } = useMutation({
        mutationFn: (actionObj) => apiClient.post(`/api/tasks/${task.id}/timer/stop/`, actionObj || {}),
        onSuccess: () => { invalidate(); onUpdate(); },
        onError: (err) => toast.error(err.response?.data?.detail || "Failed to stop timer"),
    });

    const loading = starting || stopping;
    const [seconds, setSeconds] = useState(0);

    const formatDisplayTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    useEffect(() => {
        if (!task) return;

        const baseSeconds = task.total_time_taken || 0;
        let interval;

        if (task.active_timer_start) {
            const startTime = new Date(task.active_timer_start).getTime();

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

    const handleStart = () => startTimer();
    const handleStop = () => stopTimer();

    const isRunning = !!task?.active_timer_start;
    const isPaused = !isRunning && task?.total_time_taken > 0;
    const hasIncompleteDependencies = task?.dependencies?.some(dep => dep.status !== "Done" && dep.status !== "Completed");

    const getTimeStyle = () => {
        if (isRunning) return "text-green-600 dark:text-green-400 animate-pulse";
        if (isPaused) return "text-gray-500 dark:text-slate-400";
        return "text-gray-700 dark:text-slate-200";
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Time Tracker</p>
            <div className={`flex items-center justify-between bg-gray-50 dark:bg-slate-800/20 p-3 rounded-sm border border-gray-200/50 dark:border-slate-800/80 relative overflow-hidden`}>
                <div className="flex flex-col items-start pl-1">
                    <span className={`text-xl font-mono font-bold transition-colors ${getTimeStyle()}`}>
                        {formatDisplayTime(seconds)}
                    </span>
                    {isPaused && <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">Stopped</span>}
                    {isRunning && <span className="text-[9px] uppercase font-bold text-green-500 tracking-widest mt-0.5">Running</span>}
                </div>

                <div className="flex items-center space-x-2">
                    {!isRunning ? (
                        <button
                            type="button"
                            onClick={handleStart}
                            disabled={loading || hasIncompleteDependencies}
                            className={`p-2 rounded-sm text-white transition shadow-none ${loading || hasIncompleteDependencies ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                            title={hasIncompleteDependencies ? "Cannot start: unresolved dependencies" : "Start My Timer"}
                        >
                            <IoPlay className="w-4 h-4 pl-0.5" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={loading}
                            className="p-2 bg-red-600 rounded-sm text-white hover:bg-red-700 transition shadow-none"
                            title="Stop My Timer"
                        >
                            <IoStop className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskTimer;
