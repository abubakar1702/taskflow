import { useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaUser, FaStar, FaRegStar } from "react-icons/fa";
import { LuSquareArrowOutDownRight } from "react-icons/lu";
import { useTaskPermissions } from "../../components/hooks/useTaskPermissions";
import { toast } from "react-toastify";

const TaskInfoAction = ({ showActionMenu, setShowActionMenu, onEdit, onDelete, onLeave, task, isImportant, onToggleImportant }) => {
    const menuRef = useRef(null);
    const { isCreator } = useTaskPermissions(task);

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
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 transform origin-top-right transition-all animate-fade-in-up"
        >
            <div className="py-1">
                <button
                    onClick={() => {
                        onToggleImportant();
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-500 flex items-center transition-colors duration-150"
                >
                    {isImportant ? (
                        <>
                            <FaStar className="mr-3 w-4 h-4 text-yellow-400" />
                            Unmark Important
                        </>
                    ) : (
                        <>
                            <FaRegStar className="mr-3 w-4 h-4" />
                            Mark as Important
                        </>
                    )}
                </button>

                {isCreator && (<button
                    onClick={() => {
                        onEdit();
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center transition-colors duration-150"
                >
                    <FaEdit className="mr-3 w-4 h-4" />
                    Edit Task
                </button>)}

                {!isCreator && (
                    <button
                        onClick={() => {
                            onLeave();
                            setShowActionMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center transition-colors duration-150"
                    >
                        <LuSquareArrowOutDownRight className="mr-3 w-4 h-4" />
                        Leave Task
                    </button>

                )}

                {isCreator && (<button
                    onClick={() => {
                        onDelete();
                        setShowActionMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150"
                >
                    <FaTrash className="mr-3 w-4 h-4" />
                    Delete Task
                </button>)}
            </div>
        </div>
    );
}

export default TaskInfoAction;
