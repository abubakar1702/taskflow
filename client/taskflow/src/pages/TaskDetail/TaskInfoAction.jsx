import { useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaUser } from "react-icons/fa";
import { LuSquareArrowOutDownRight } from "react-icons/lu";

const TaskInfoAction = ({ showActionMenu, setShowActionMenu }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowActionMenu(false);
            }
        };

        if (showActionMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showActionMenu, setShowActionMenu]);

    if (!showActionMenu) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 transform origin-top-right transition-all animate-fade-in-up"
        >
            <div className="py-1">
                <button
                    onClick={() => {
                        console.log("Edit clicked");
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center transition-colors duration-150"
                >
                    <FaEdit className="mr-3 w-4 h-4" />
                    Edit Task
                </button>
                <button
                    onClick={() => {
                        console.log("Leave Task clicked");
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center transition-colors duration-150"
                >
                    <LuSquareArrowOutDownRight className="mr-3 w-4 h-4" />
                    Leave Task
                </button>
                <button
                    onClick={() => {
                        console.log("Delete clicked");
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150"
                >
                    <FaTrash className="mr-3 w-4 h-4" />
                    Delete Task
                </button>
            </div>
        </div>
    );
}

export default TaskInfoAction;
