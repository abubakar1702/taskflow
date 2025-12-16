import React from 'react';
import { useApi } from "../components/hooks/useApi";
import ProjectTasks from "../components/project/ProjectTasks";
import { FaStar } from "react-icons/fa";
import LoadingScreen from "../components/common/LoadingScreen";

const Important = () => {
    const { data: importantData, loading, error } = useApi('/api/important-tasks/');

    const getTasks = () => {
        if (!importantData) return [];
        return importantData.map(item => item.task || item);
    };

    const tasks = getTasks();

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Error loading important tasks: {error.message}
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen fullscreen />;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-yellow-100 rounded-full">
                    <FaStar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Important Tasks</h1>
                    <p className="text-gray-500 mt-1">Tasks you've marked as important</p>
                </div>
            </div>

            <ProjectTasks tasks={tasks} tasksLoading={loading} />
        </div>
    );
};

export default Important;