import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { BsSave2 } from "react-icons/bs";
import { FaLayerGroup, FaAlignLeft } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const { makeRequest } = useApi(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (project && isOpen) {
            setName(project.name || "");
            setDescription(project.description || "");
        }
    }, [project, isOpen]);

    const hasChanges =
        name !== (project?.name || "") ||
        description !== (project?.description || "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            await makeRequest(
                `/api/projects/${project.id}/`,
                "PATCH",
                { name, description }
            );
            toast.success("Project updated successfully");
            onProjectUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to update project:", err);
            setError(err.message || "Failed to update project");
            toast.error("Failed to update project. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                    <span className="font-semibold uppercase text-gray-700 tracking-wider">Edit Project</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                    >
                        <FaXmark className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Project Name */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <FaLayerGroup className="w-4 h-4 mr-2 text-indigo-500" />
                                    Project Name
                                </label>
                                <span
                                    className={`text-xs font-medium ${name.length >= 100
                                        ? 'text-red-600'
                                        : 'text-gray-500'
                                        }`}
                                >
                                    {name.length}/100
                                </span>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                                placeholder="Enter project name"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FaAlignLeft className="w-4 h-4 mr-2 text-indigo-500" />
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="8"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder-gray-400"
                                placeholder="Enter project description..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium shadow-sm"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="edit-project-form"
                        disabled={isLoading || !hasChanges || !name.trim()}
                        className={`px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[140px] ${(!hasChanges || !name.trim()) ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <ClipLoader color="#fff" size={20} className="mr-2" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <BsSave2 className="w-5 h-5 mr-2" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProjectModal;
