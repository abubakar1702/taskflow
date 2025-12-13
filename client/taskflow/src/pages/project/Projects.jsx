import { useState } from "react";
import { useApi } from "../../components/hooks/useApi";
import ProjectCard from "../../components/project/ProjectCard";
import { FaPlus, FaExclamationTriangle } from "react-icons/fa";
import LoadingScreen from "../../components/common/LoadingScreen";
import NewProjectModal from "../../components/modals/NewProjectModal";

const Projects = () => {
    const { data: projects, loading, error, refetch } = useApi("/api/projects/");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProjectCreated = () => {
        refetch();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8">

                {/* Header always visible */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Projects
                        </h1>
                        <p className="text-gray-600">
                            Manage and collaborate on your projects
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <FaPlus />
                        <span>New Project</span>
                    </button>
                </div>

                {/* Projects section with centered loader */}
                <div className="min-h-[50vh] mt-6 relative">

                    {loading ? (
                        <LoadingScreen message="Loading tasks..." height="70vh" />

                    ) : error ? (
                        <div className="text-center py-16">
                            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Error Loading Projects
                            </h2>
                            <p className="text-gray-600 mb-4">
                                {error.message}
                            </p>
                            <button
                                onClick={refetch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No Projects Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Get started by creating your first project
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm mx-auto"
                                >
                                    <FaPlus />
                                    <span>Create Project</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
};

export default Projects;
