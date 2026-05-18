import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import ProjectTasks from "../components/project/ProjectTasks";
import { FaStar } from "react-icons/fa";
import LoadingScreen from "../components/common/LoadingScreen";

const Important = () => {
    const { data: importantData, isLoading: loading, error } = useQuery({
        queryKey: QUERY_KEYS.importantTasks(),
        queryFn: async () => (await apiClient.get('/api/important-tasks/')).data,
    });

    const getTasks = () => {
        if (!importantData) return [];
        const rawData = Array.isArray(importantData) ? importantData : (importantData.results || []);
        return rawData.map(item => item.task || item);
    };

    const tasks = getTasks();

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
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
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <FaStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Important Tasks</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Tasks you've marked as important</p>
                </div>
            </div>

            <ProjectTasks tasks={tasks} tasksLoading={loading} />
        </div>
    );
};

export default Important;