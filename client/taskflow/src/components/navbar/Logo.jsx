import React from "react";
import { Link } from "react-router-dom";
import { FiCheckSquare } from "react-icons/fi";

const Logo = () => {
    return (
        <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-xl hover:opacity-80 transition-opacity duration-200"
            aria-label="TaskFlow home"
        >
            <FiCheckSquare size={24} />
            <span>TaskFlow</span>
        </Link>
    );
};

export default Logo;
