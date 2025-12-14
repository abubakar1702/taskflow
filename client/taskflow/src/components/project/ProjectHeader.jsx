import { useState } from "react";
import { FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApi } from "../hooks/useApi";
import DeleteModal from "../modals/DeleteModal";

const ProjectHeader = ({ project, activeTab, setActiveTab, tasks, assets, onEditClick, isProjectAdmin, isProjectCreator }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { makeRequest: deleteProject, loading: isDeleting } = useApi();

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleDeleteProject = async () => {
        try {
            await deleteProject(`/api/projects/${project.id}/`, "DELETE");
            toast.success("Project deleted successfully");
            navigate("/projects");
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error(error.message || "Failed to delete project");
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {project.name}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>Created {formatDate(project.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    {isProjectAdmin && (
                        <div className="flex items-center">
                            <button
                                onClick={onEditClick}
                                className={`flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 hover:text-blue-700 transition-colors shadow-sm ${isProjectCreator ? "rounded-l-full" : "rounded-full"
                                    }`}
                            >
                                <FaEdit />
                            </button>
                            {isProjectCreator && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-r-full hover:text-red-700 transition-colors shadow-sm -ml-px"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-6">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === "overview"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === "members"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Members ({project.members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === "tasks"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Tasks ({tasks?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("assets")}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === "assets"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Assets ({assets?.length || 0})
                    </button>
                </div>
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                message={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone and will delete all associated tasks and assets.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectHeader;