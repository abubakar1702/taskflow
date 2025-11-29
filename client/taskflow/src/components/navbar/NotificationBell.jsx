import React from "react";
import { FiBell } from "react-icons/fi";

const NotificationBell = () => {
    return (
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
    );
};

export default NotificationBell;
