import React, { useState, useEffect } from "react";
import { FiSearch, FiX, FiSun, FiMoon } from "react-icons/fi";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import Search from "../common/Search";

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark" || 
            (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center p-4 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex items-center gap-8">
                <Logo />
            </div>

            {/* Mobile Search Bar Overlay */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white p-4 shadow-md border-b border-gray-200 md:hidden z-50">
                    <Search className="w-full !px-0" />
                </div>
            )}
            <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                    <Search />
                </div>
                {/* Mobile Search Icon */}
                <button
                    className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label={isSearchOpen ? "Close search" : "Open search"}
                    aria-expanded={isSearchOpen}
                >
                    {isSearchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
                </button>

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-200 flex items-center justify-center"
                    aria-label="Toggle dark mode"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <FiSun size={20} className="text-amber-400" /> : <FiMoon size={20} />}
                </button>

                <NotificationBell />
                <UserMenu />
            </div>
        </nav>
    );
};

export default Navbar;
