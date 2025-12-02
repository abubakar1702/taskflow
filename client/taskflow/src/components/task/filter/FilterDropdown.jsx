import { useState, useRef, useEffect } from "react";
import { FaFilter, FaChevronDown, FaTimes } from "react-icons/fa";

const FilterDropdown = ({ filters, onFilterChange, sortBy, onSortChange, setFilters }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fixed: Only count non-empty string filters and true boolean filters
  const activeFilterCount = [
    filters.priority && filters.priority !== "",
    filters.status && filters.status !== "",
    filters.due_today === true,
    filters.overdue === true,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  const clearAllFilters = () => {
    const clearedFilters = {
      priority: "",
      status: "",
      due_today: false,
      overdue: false,
    };
    setFilters(clearedFilters);

    // Apply cleared filters
    Object.keys(clearedFilters).forEach((key) =>
      onFilterChange(key, clearedFilters[key])
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extracted for reusability
  const selectStyles = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200 hover:border-gray-300 cursor-pointer";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200"
      >
        <FaFilter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-semibold">
            {activeFilterCount}
          </span>
        )}
        <FaChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-10 p-4 space-y-4">

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange("priority", e.target.value)}
              className={selectStyles}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className={selectStyles}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* Quick Filters (Checkboxes) */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Quick Filters</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.due_today}
                  onChange={(e) => onFilterChange("due_today", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="ml-2">Due Today</span>
              </label>

              <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.overdue}
                  onChange={(e) => onFilterChange("overdue", e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="ml-2">Overdue</span>
              </label>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={selectStyles}
            >
              <option value="Date Created (Desc)">Date Created (Desc)</option>
              <option value="Date Created">Date Created (Asc)</option>
              <option value="Due Date">Due Date (Asc)</option>
              <option value="Due Date (Desc)">Due Date (Desc)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <>
              <hr className="border-gray-100" />
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <FaTimes className="w-4 h-4 group-hover:text-white text-red-600" />
                Clear All Filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;