import { useParams } from "react-router-dom";
import { useApi } from "../../components/hooks/useApi";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { useState } from "react";
import ProjectHeader from "../../components/project/ProjectHeader";
import ProjectOverview from "../../components/project/ProjectOverview";
import ProjectMembers from "../../components/project/ProjectMembers";
import ProjectTasks from "../../components/project/ProjectTasks";
import ProjectAssets from "../../components/project/ProjectAssets";
import EditProjectModal from "../../components/modals/EditProjectModal";

import LoadingScreen from "../../components/common/LoadingScreen";
import { useUser } from "../../contexts/UserContext";

const ProjectDetail = () => {
    const { id } = useParams();
    const { data: project, loading, error, refetch } = useApi(
        `/api/projects/${id}/`
    );

    const { data: assets, loading: assetsLoading, refetch: refetchAssets } = useApi(
        `/api/projects/${id}/assets/`
    );

    const { data: tasks, loading: tasksLoading } = useApi(
        `/api/tasks/?project_id=${id}`
    );

    const { currentUser } = useUser();
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isProjectAdmin = currentUser && project?.members?.some(
        (member) => member.user.id === currentUser.id && member.role === "Admin"
    );

    const isProjectCreator = currentUser && project?.creator?.id === currentUser.id;

    const handleProjectUpdated = () => {
        refetch();
    };

    if (loading) {
        return (
            <LoadingScreen message="Loading project details..." fullscreen />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaExclamationTriangle className="text-4xl text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Error Loading Project
                    </h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <ProjectHeader
                project={project}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tasks={tasks}
                assets={assets}
                onEditClick={() => setIsEditModalOpen(true)}
                isProjectAdmin={isProjectAdmin}
                isProjectCreator={isProjectCreator}
            />

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={project}
                onProjectUpdated={handleProjectUpdated}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === "overview" && <ProjectOverview project={project} />}
                {activeTab === "members" && (
                    <ProjectMembers
                        project={project}
                        onProjectUpdated={handleProjectUpdated}
                        isProjectAdmin={isProjectAdmin}
                        isProjectCreator={isProjectCreator}
                    />
                )}
                {activeTab === "tasks" && (
                    <ProjectTasks tasks={tasks} tasksLoading={tasksLoading} />
                )}
                {activeTab === "assets" && (
                    <ProjectAssets
                        assets={assets}
                        assetsLoading={assetsLoading}
                        projectId={project.id}
                        onAssetsUpdated={refetchAssets}
                        isProjectAdmin={isProjectAdmin}
                    />
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;