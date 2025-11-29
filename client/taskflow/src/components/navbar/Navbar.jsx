import React, { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

import Search from "../sidebar/Search";

const Navbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center gap-8">
                <Logo />
            </div>

            {/* Mobile Search Bar Overlay */}
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white p-4 shadow-md border-b border-gray-200 md:hidden animate-in slide-in-from-top-2">
                    <Search className="w-full !px-0" />
                </div>
            )}
            <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                    <Search />
                </div>
                {/* Mobile Search Icon */}
                <button
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label={isSearchOpen ? "Close search" : "Open search"}
                    aria-expanded={isSearchOpen}
                >
                    {isSearchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
                </button>
                <NotificationBell />
                <UserMenu />
            </div>
        </nav>
    );
};

export default Navbar;
