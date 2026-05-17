import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { FaExclamationTriangle } from "react-icons/fa";
import { useState } from "react";
import ProjectHeader from "../../components/project/ProjectHeader";
import ProjectOverview from "../../components/project/ProjectOverview";
import ProjectMembers from "../../components/project/ProjectMembers";
import ProjectTasks from "../../components/project/ProjectTasks";
import ProjectAssets from "../../components/project/ProjectAssets";
import ProjectDependencyGraph from "../../components/project/ProjectDependencyGraph";
import EditProjectModal from "../../components/modals/EditProjectModal";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useUser } from "../../contexts/UserContext";

const ProjectDetail = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { currentUser } = useUser();
    const [activeTab, setActiveTab] = useState("overview");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: project, isLoading: loading, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.project(id),
        queryFn: async () => (await apiClient.get(`/api/projects/${id}/`)).data,
        enabled: !!id,
    });

    const { data: assetsData, isLoading: assetsLoading } = useQuery({
        queryKey: QUERY_KEYS.projectAssets(id),
        queryFn: async () => (await apiClient.get(`/api/projects/${id}/assets/`)).data,
        enabled: !!id,
    });
    const assets = Array.isArray(assetsData) ? assetsData : (assetsData?.results || []);

    const { data: tasksData, isLoading: tasksLoading } = useQuery({
        queryKey: QUERY_KEYS.projectTasks(id),
        queryFn: async () => (await apiClient.get(`/api/tasks/?project_id=${id}`)).data,
        enabled: !!id,
    });
    const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.results || []);

    const isProjectAdmin = currentUser && project?.members?.some(
        (member) => member.user.id === currentUser.id && member.role === "Admin"
    );
    const isProjectCreator = currentUser && project?.creator?.id === currentUser.id;

    const handleProjectUpdated = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(id) });
    };

    const refetchAssets = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projectAssets(id) });
    };

    if (loading) return <LoadingScreen message="Loading project details..." fullscreen />;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FaExclamationTriangle className="text-4xl text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Project</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="min-h-screen bg-gray-50">
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
                {activeTab === "tasks" && <ProjectTasks tasks={tasks} tasksLoading={tasksLoading} />}
                {activeTab === "assets" && (
                    <ProjectAssets
                        assets={assets}
                        assetsLoading={assetsLoading}
                        projectId={project.id}
                        onAssetsUpdated={refetchAssets}
                        isProjectAdmin={isProjectAdmin}
                    />
                )}
                {activeTab === "dependencyMap" && (
                    <ProjectDependencyGraph tasks={tasks} projectId={project.id} />
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;