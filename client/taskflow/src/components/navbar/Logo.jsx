import React from "react";
import { FiCheckSquare } from "react-icons/fi";

const Logo = () => {
    return (
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <FiCheckSquare size={24} />
            <span>TaskFlow</span>
        </div>
    );
};

export default Logo;
