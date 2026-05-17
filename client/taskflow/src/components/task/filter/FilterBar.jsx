import { useState } from "react";
import { IoGrid, IoList } from "react-icons/io5";
import FilterTabs from "./FilterTabs";
import FilterDropdown from "./FilterDropdown";

const FilterBar = ({ onFilterUpdate, viewMode, setViewMode }) => {
    const [activeTab, setActiveTab] = useState("All");

    const [filters, setFilters] = useState({
        priority: "",
        status: "",
        due_today: false,
        overdue: false,
        project_id: "",
    });

    const [sortBy, setSortBy] = useState("Date Created (Desc)");

    const triggerUpdate = (newFilters, newSortBy, newActiveTab) => {
        if (onFilterUpdate) {
            onFilterUpdate(newActiveTab, newFilters, newSortBy);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        triggerUpdate(filters, sortBy, tab);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        triggerUpdate(newFilters, sortBy, activeTab);
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        triggerUpdate(filters, newSortBy, activeTab);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            priority: "",
            status: "",
            due_today: false,
            overdue: false,
            project_id: "",
        };
        setFilters(clearedFilters);
        triggerUpdate(clearedFilters, sortBy, activeTab);
    };

    return (
        <div className="flex justify-between items-center py-2 mb-4">
            <div className="flex space-x-3">
                <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            <div className="flex items-center gap-3">
                {/* View Mode Switcher */}
                <div className="bg-white dark:bg-slate-900 p-0.5 rounded-md border border-gray-200 dark:border-slate-800 flex items-center shadow-sm">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded transition ${viewMode === "list"
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                            }`}
                        title="List View"
                    >
                        <IoList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded transition ${viewMode === "grid"
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                            }`}
                        title="Grid View"
                    >
                        <IoGrid className="w-4 h-4" />
                    </button>
                </div>


                {/* Filter Dropdown */}
                <FilterDropdown
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    setFilters={setFilters}
                    onClearFilters={handleClearFilters}
                />
            </div>
        </div>
    );
};

export default FilterBar;