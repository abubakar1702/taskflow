import React, { useEffect, useState, useRef } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Avatar, { useAvatar } from "../common/Avatar";

const UserMenu = () => {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fromLocal = localStorage.getItem("user");
        const fromSession = sessionStorage.getItem("user");

        const parsed = fromLocal
            ? JSON.parse(fromLocal)
            : fromSession
                ? JSON.parse(fromSession)
                : null;

        setUser(parsed);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");

        navigate("/login");
    };

    const { avatarUrl, initials } = useAvatar(
        user?.name || user?.email || "User",
        user?.avatar
    );

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full hover:ring-2 hover:ring-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="User menu"
            >
                <Avatar
                    name={user?.name || user?.email || "User"}
                    url={user?.avatar}
                    size={8}
                    className="shadow-md"
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={user?.name || user?.email || "User"}
                                url={user?.avatar}
                                size={10}
                                className="shadow-md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                // navigate("/profile");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <FiSettings className="text-gray-500" size={18} />
                            <span>Settings</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FiLogOut className="text-red-600" size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
