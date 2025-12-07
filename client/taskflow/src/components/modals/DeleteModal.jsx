import { ClipLoader } from "react-spinners";
import { LuTrash } from "react-icons/lu";

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item?",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
                
                {/* Title */}
                <h2 className="text-lg font-semibold mb-2">{title}</h2>

                {/* Message */}
                <p className="text-gray-600 mb-5">{message}</p>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? <span className="flex items-center"><ClipLoader size={20} color="#ffffff" className="mr-2" />Deleting...</span> : <span className="flex items-center"><LuTrash className="mr-2" /> Delete</span>}
                    </button>
                </div>
            </div>  
        </div>
    );
};

export default DeleteModal;
