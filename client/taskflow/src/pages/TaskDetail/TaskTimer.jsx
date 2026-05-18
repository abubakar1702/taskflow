import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { toast } from "react-toastify";
import { IoPlay, IoPause, IoStop } from "react-icons/io5";

const TaskTimer = ({ task, onUpdate, isCreator }) => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(task?.id) });

    const { mutate: patchTask, isPending: loading } = useMutation({
        mutationFn: (payload) => apiClient.patch(`/api/tasks/${task.id}/`, payload),
        onSuccess: () => { invalidate(); onUpdate(); },
        onError: (_, __, ctx) => toast.error(ctx?.errMsg || "Timer action failed"),
    });
    const [seconds, setSeconds] = useState(0);

    // Parse duration string to seconds
    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;

        // Handle "DD HH:MM:SS" or "HH:MM:SS"
        const parts = durationStr.split(" ");
        let timeStr = parts.length > 1 ? parts[1] : parts[0]; // Get the HH:MM:SS part
        const days = parts.length > 1 ? parseInt(parts[0]) : 0;

        const [h, m, s] = timeStr.split(":").map(Number);
        return days * 86400 + h * 3600 + m * 60 + Math.floor(s || 0);
    };

    // Format seconds to "DD HH:MM:SS" or "HH:MM:SS"
    const formatTime = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400);
        const remainingSeconds = totalSeconds % 86400;
        const h = Math.floor(remainingSeconds / 3600);
        const m = Math.floor((remainingSeconds % 3600) / 60);
        const s = Math.floor(remainingSeconds % 60);

        const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        return days > 0 ? `${days} ${timeString}` : timeString;
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

            updateTimer(); // Initial update
            interval = setInterval(updateTimer, 1000);
        } else {
            setSeconds(baseSeconds);
        }

        return () => clearInterval(interval);
    }, [task]);

    const handleStart = () => {
        patchTask({ timer_start_time: new Date().toISOString(), status: "In Progress" });
    };

    const handlePause = () => {
        if (!task.timer_start_time) return;
        patchTask({ timer_start_time: null, time_taken: formatTime(seconds) });
    };

    const handleStop = () => {
        patchTask({ status: "To Do", time_taken: formatTime(seconds), timer_start_time: null });
    };

    const isRunning = !!task?.timer_start_time;
    const isPaused = !isRunning && task.status === 'In Progress' && parseDuration(task.time_taken) > 0;

        const hasIncompleteDependencies = task?.dependencies?.some(dep => dep.status !== "Done" && dep.status !== "Completed");

    const getTimeStyle = () => {
        if (isRunning) return "text-green-600 dark:text-green-400 animate-pulse";
        if (isPaused) return "text-amber-500 dark:text-amber-400";
        return "text-gray-700 dark:text-slate-200";
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Time Tracker</p>
            <div className={`flex items-center ${isCreator ? 'justify-between' : 'justify-center'} bg-gray-50 dark:bg-slate-800/20 p-3 rounded-sm border border-gray-200/50 dark:border-slate-800/80 relative overflow-hidden`}>
                <div className="flex flex-col items-start pl-1">
                    <span className={`text-xl font-mono font-bold transition-colors ${getTimeStyle()}`}>
                        {formatDisplayTime(seconds)}
                    </span>
                    {isPaused && <span className="text-[9px] uppercase font-bold text-amber-500 tracking-widest mt-0.5">Paused</span>}
                    {isRunning && <span className="text-[9px] uppercase font-bold text-green-500 tracking-widest mt-0.5">Running</span>}
                </div>

                {isCreator && (
                    <div className="flex items-center space-x-2">
                        {!isRunning ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleStart}
                                    disabled={loading || hasIncompleteDependencies}
                                    className={`p-2 rounded-sm text-white transition shadow-none ${loading || hasIncompleteDependencies ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                                    title={hasIncompleteDependencies ? "Cannot start: unresolved dependencies" : (isPaused ? "Resume Timer" : "Start Timer")}
                                >
                                    <IoPlay className="w-4 h-4 pl-0.5" />
                                </button>
                                {isPaused && (
                                    <button
                                        type="button"
                                        onClick={handleStop}
                                        disabled={loading}
                                        className="p-2 bg-red-600 rounded-sm text-white hover:bg-red-700 transition shadow-none"
                                        title="Stop Timer (Reset)"
                                    >
                                        <IoStop className="w-4 h-4" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePause}
                                    disabled={loading}
                                    className="p-2 bg-amber-500 rounded-sm text-white hover:bg-amber-600 transition shadow-none"
                                    title="Pause Timer"
                                >
                                    <IoPause className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStop}
                                    disabled={loading}
                                    className="p-2 bg-red-650 rounded-sm text-white hover:bg-red-705 transition shadow-none"
                                    title="Stop Timer (Reset)"
                                >
                                    <IoStop className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskTimer;
