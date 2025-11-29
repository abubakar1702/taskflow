import React from "react";
import { FiUser } from "react-icons/fi";

const UserMenu = () => {
    return (
        <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <FiUser size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">User</span>
        </button>
    );
};

export default UserMenu;
