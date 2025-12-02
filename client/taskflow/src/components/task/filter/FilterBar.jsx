import { useState } from "react";
import FilterTabs from "./FilterTabs";
import FilterDropdown from "./FilterDropdown";

const FilterBar = ({ onFilterUpdate }) => {
    const [activeTab, setActiveTab] = useState("All");

    const [filters, setFilters] = useState({
        priority: "",
        status: "",
        due_today: false,
        overdue: false,
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

    return (
        <div className="flex justify-between items-center py-2 mb-4">
            <div className="flex space-x-3">
                <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>

            <div>
                <FilterDropdown
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    setFilters={setFilters}
                />
            </div>
        </div>
    );
};

export default FilterBar;