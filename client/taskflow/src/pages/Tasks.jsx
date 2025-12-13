import React, { useState, useMemo } from "react";
import { useApi } from "../components/hooks/useApi";
import { Link } from "react-router-dom";
import { FaPlus, FaExclamationCircle, FaClipboardList } from "react-icons/fa";
import TaskCard from "../components/task/TaskCard";
import FilterBar from "../components/task/filter/FilterBar";
import LoadingScreen from "../components/common/LoadingScreen";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Tasks = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [filters, setFilters] = useState({
        priority: "",
        status: "",
        due_today: false,
        overdue: false,
    });

    const [sortBy, setSortBy] = useState("Date Created (Desc)");

    const mapSortToApi = (sortLabel) => {
        const sortMapping = {
            "Date Created": "created_at",
            "Date Created (Desc)": "-created_at",
            "Due Date": "due_date",
            "Due Date (Desc)": "-due_date",
        };
        return sortMapping[sortLabel] || "-created_at";
    };

    const queryString = useMemo(() => {
        const query = new URLSearchParams();
        if (filters.priority) query.append("priority", filters.priority);
        if (filters.status) query.append("status", filters.status);
        if (filters.due_today) query.append("due_today", "true");
        if (filters.overdue) query.append("overdue", "true");
        if (activeTab === "Assigned to me") query.append("assigned_to_me", "true");
        if (activeTab === "Created by me") query.append("created_by_me", "true");

        const apiSort = mapSortToApi(sortBy);
        if (apiSort) query.append("ordering", apiSort);

        return query.toString();
    }, [activeTab, filters, sortBy]);

    const {
        data: tasks = [],
        loading,
        error,
    } = useApi(`${API_BASE_URL}/api/tasks/?${queryString}`, "GET", null, [
        queryString,
    ]);

    const onFilterUpdate = (newActiveTab, newFilters, newSortBy) => {
        setActiveTab(newActiveTab);
        setFilters(newFilters);
        setSortBy(newSortBy);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8">
                {/* TITLE + COUNT */}
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Tasks{" "}
                        {!loading && tasks && (
                            <span className="text-gray-400">({tasks.length})</span>
                        )}
                    </h1>

                    <Link to="/new-task/">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            New Task <FaPlus />
                        </button>
                    </Link>
                </div>

                <FilterBar onFilterUpdate={onFilterUpdate} />

                <div className="mt-6 min-h-[50vh] relative">
                    {loading ? (
                        <LoadingScreen message="Loading tasks..." height="60vh" />

                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <FaExclamationCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                            <h3 className="text-lg font-medium text-red-900 mb-2">
                                Failed to load tasks
                            </h3>
                            <p className="text-red-700 mb-4">
                                {error.data?.detail || error.message}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : !tasks || tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <FaClipboardList className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tasks found
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Get started by creating your first task.
                            </p>
                            <Link to="/new-task/">
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    Create Task
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} {...task} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;
