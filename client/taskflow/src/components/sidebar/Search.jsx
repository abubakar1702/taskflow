import React from 'react';
import { FiSearch } from "react-icons/fi";

const Search = ({ className }) => {
    return (
        <div className={`flex items-center px-4 transition-all duration-300 ${className}`}>
            <div className="flex items-center bg-gray-100 rounded-full w-full md:w-64 px-4 py-2 gap-2">
                <FiSearch className="text-gray-500 min-w-[16px]" size={16} />
                <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-500"
                />
            </div>
        </div>
    );
};

export default Search;
