import { useState } from "react";
import { FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import DeleteModal from "../modals/DeleteModal";

const ProjectHeader = ({ project, activeTab, setActiveTab, tasks, assets, onEditClick, isProjectAdmin, isProjectCreator }) => {
    const queryClient = useQueryClient();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const { mutate: deleteProjectMutation, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/api/projects/${project.id}/`);
        },
        onSuccess: () => {
            toast.success("Project deleted successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects() });
            navigate("/projects");
        },
        onError: (error) => {
            console.error("Failed to delete project:", error);
            toast.error(error.response?.data?.detail || error.message || "Failed to delete project");
        }
    });

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleDeleteProject = () => {
        deleteProjectMutation();
    };

    return (
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800/80 sticky top-0 z-10 shadow-none">
            <div className="max-w-7xl mx-auto px-6 pt-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
                                {project.name}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                                <FaCalendarAlt className="text-gray-400 dark:text-slate-500" />
                                <span>Created {formatDate(project.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    {isProjectAdmin && (
                        <div className="flex items-center shadow-none">
                            <button
                                onClick={onEditClick}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:text-blue-700 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors ${isProjectCreator ? "rounded-l-sm" : "rounded-sm"
                                    }`}
                            >
                                <FaEdit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </button>
                            {isProjectCreator && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-r-sm hover:text-red-700 dark:hover:text-red-400 dark:hover:bg-slate-800 transition-colors -ml-px"
                                >
                                    <FaTrash className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 border-b border-transparent">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`pb-2.5 px-3 border-b-2 text-sm font-medium transition-colors -mb-px ${activeTab === "overview"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`pb-2.5 px-3 border-b-2 text-sm font-medium transition-colors -mb-px ${activeTab === "members"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                    >
                        Members ({project.members.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("tasks")}
                        className={`pb-2.5 px-3 border-b-2 text-sm font-medium transition-colors -mb-px ${activeTab === "tasks"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                    >
                        Tasks ({tasks?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("assets")}
                        className={`pb-2.5 px-3 border-b-2 text-sm font-medium transition-colors -mb-px ${activeTab === "assets"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                    >
                        Assets ({assets?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("dependencyMap")}
                        className={`pb-2.5 px-3 border-b-2 text-sm font-medium transition-colors -mb-px ${activeTab === "dependencyMap"
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700"
                            }`}
                    >
                        Dependency Map
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