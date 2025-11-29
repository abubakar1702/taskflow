import React from 'react';
import { FiSearch } from "react-icons/fi";

const Search = ({ className }) => {
    return (
        <div className={`flex items-center px-4 transition-all duration-200 ${className}`}>
            <div className="flex items-center bg-gray-100 rounded-full w-full md:w-64 px-4 py-2 gap-2">
                <FiSearch className="text-gray-500 min-w-[16px]" size={16} />
                <label htmlFor="search-input" className="sr-only">
                    Search tasks
                </label>
                <input
                    id="search-input"
                    type="search"
                    placeholder="Search"
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
                    role="searchbox"
                    aria-label="Search tasks"
                />
            </div>
        </div>
    );
};

export default Search;
