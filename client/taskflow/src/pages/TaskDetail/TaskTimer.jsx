import { useState, useEffect } from "react";
import { useApi } from "../../components/hooks/useApi";
import { toast } from "react-toastify";
import { IoPlay, IoPause, IoStop } from "react-icons/io5";

const TaskTimer = ({ task, onUpdate, isCreator }) => {
    const { makeRequest, loading } = useApi();
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

    const handleStart = async () => {
        try {
            await makeRequest(`/api/tasks/${task.id}/`, "PATCH", {
                timer_start_time: new Date().toISOString(),
                status: "In Progress"
            });
            onUpdate();
        } catch (error) {
            toast.error("Failed to start timer");
        }
    };

    const handlePause = async () => {
        try {
            if (!task.timer_start_time) return;

            const durationStr = formatTime(seconds);

            await makeRequest(`/api/tasks/${task.id}/`, "PATCH", {
                timer_start_time: null,
                time_taken: durationStr
            });
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to pause timer");
        }
    };

    const handleStop = async () => {
        try {
            const durationStr = formatTime(seconds);
            const payload = {
                status: "To Do",
                time_taken: durationStr,
                timer_start_time: null
            };

            await makeRequest(`/api/tasks/${task.id}/`, "PATCH", payload);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to stop timer");
        }
    };

    const isRunning = !!task?.timer_start_time;
    const isPaused = !isRunning && task.status === 'In Progress' && parseDuration(task.time_taken) > 0;

    const getTimeStyle = () => {
        if (isRunning) return "text-green-600 animate-pulse";
        if (isPaused) return "text-amber-500";
        return "text-gray-700";
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-lg py-2 font-semibold">Time Tracker</p>
            <div className={`flex items-center ${isCreator ? 'justify-between' : 'justify-center'} bg-gray-50 p-3 rounded-lg relative overflow-hidden`}>
                <div className="flex flex-col items-center">
                    <span className={`text-2xl font-mono font-bold transition-colors ${getTimeStyle()}`}>
                        {formatDisplayTime(seconds)}
                    </span>
                    {isPaused && <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest mt-0.5">Paused</span>}
                    {isRunning && <span className="text-[10px] uppercase font-bold text-green-500 tracking-widest mt-0.5">Running</span>}
                </div>

                {isCreator && (
                    <div className="flex items-center space-x-2">
                        {!isRunning ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleStart}
                                    disabled={loading}
                                    className="p-2 bg-green-500 rounded-full text-white hover:bg-green-600 transition shadow-sm"
                                    title={isPaused ? "Resume Timer" : "Start Timer"}
                                >
                                    <IoPlay className="w-5 h-5 pl-0.5" />
                                </button>
                                {isPaused && (
                                    <button
                                        type="button"
                                        onClick={handleStop}
                                        disabled={loading}
                                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition shadow-sm"
                                        title="Stop Timer (Reset)"
                                    >
                                        <IoStop className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePause}
                                    disabled={loading}
                                    className="p-2 bg-amber-500 rounded-full text-white hover:bg-amber-600 transition shadow-sm"
                                    title="Pause Timer"
                                >
                                    <IoPause className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStop}
                                    disabled={loading}
                                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition shadow-sm"
                                    title="Stop Timer (Reset)"
                                >
                                    <IoStop className="w-5 h-5" />
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
