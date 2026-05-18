import { useState } from "react";
import Avatar from "../common/Avatar";
import { FaCrown, FaUserShield, FaStar } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import AddProjectMemberModal from "../modals/AddProjectMemberModal";
import DeleteModal from "../modals/DeleteModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../utils/apiClient";
import { QUERY_KEYS } from "../../utils/queryKeys";
import { toast } from "react-toastify";

const ProjectMembers = ({ project, onProjectUpdated, isProjectAdmin, isProjectCreator }) => {
    const queryClient = useQueryClient();
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    const { mutate: updateMemberRole, isPending: isRoleChangeLoading } = useMutation({
        mutationFn: async ({ memberId, newRole }) => {
            const response = await apiClient.patch(`/api/projects/${project.id}/members/${memberId}/`, { role: newRole });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Member role updated successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(project.id) });
            onProjectUpdated();
        },
        onError: (error) => {
            console.error("Failed to update member role:", error);
            toast.error(error.response?.data?.detail || error.message || "Failed to update member role");
        }
    });

    const { mutate: removeMember, isPending: isDeleting } = useMutation({
        mutationFn: async (memberId) => {
            await apiClient.delete(`/api/projects/${project.id}/members/${memberId}/`);
        },
        onSuccess: () => {
            toast.success("Member removed from project");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.project(project.id) });
            onProjectUpdated();
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
        },
        onError: (error) => {
            console.error("Failed to remove member:", error);
            toast.error(error.response?.data?.detail || error.message || "Failed to remove member");
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

    const handleChangeRole = (memberId, newRole) => {
        updateMemberRole({ memberId, newRole });
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case "Admin":
                return <FaCrown className="text-yellow-500" />;
            case "Member":
                return <FaUserShield className="text-blue-500" />;
            default:
                return null;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "Admin":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800";
            case "Member":
                return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
        }
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!memberToDelete) return;
        removeMember(memberToDelete.id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-sm shadow-none border border-gray-200 dark:border-slate-800/80">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100 uppercase tracking-wider">
                    Project Members
                </h2>
                {isProjectAdmin && (
                    <button
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-xs font-semibold"
                    >
                        <span className="flex items-center gap-1.5"><FiUserPlus className="w-3.5 h-3.5" /> Add Member</span>
                    </button>
                )}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
                {project.members.map((member) => {
                    const canChangeRole = (isProjectCreator && member.user.id !== project.creator.id) ||
                        (isProjectAdmin && member.role !== "Admin" && member.user.id !== project.creator.id);

                    return (
                        <div
                            key={member.id}
                            className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={member.user.display_name}
                                        url={member.user.avatar}
                                        size={10}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                                {member.user.display_name}
                                            </p>
                                            {project.creator.id === member.user.id && (
                                                <FaStar className="text-orange-400" title="Project Creator" />
                                            )}
                                            {getRoleIcon(member.role)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                            {member.user.email}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                            Joined {formatDate(member.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canChangeRole ? (
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                            className={`px-2 py-0.5 rounded-sm text-xs font-semibold border cursor-pointer outline-none focus:ring-1 focus:ring-blue-500 ${getRoleBadgeColor(member.role)}`}
                                            disabled={isRoleChangeLoading}
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`px-2 py-0.5 rounded-sm text-xs font-semibold border ${getRoleBadgeColor(
                                                member.role
                                            )}`}
                                        >
                                            {member.role}
                                        </span>
                                    )}

                                    {(isProjectCreator
                                        ? member.user.id !== project.creator.id
                                        : (isProjectAdmin && member.role !== "Admin" && member.user.id !== project.creator.id)
                                    ) && (
                                            <button
                                                onClick={() => handleDeleteClick(member)}
                                                className="text-xs text-gray-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-900 rounded-sm transition-colors font-medium"
                                            >
                                                Remove
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddProjectMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                projectId={project.id}
                currentMembers={project.members}
                onMemberAdded={onProjectUpdated}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Member"
                message={`Are you sure you want to remove ${memberToDelete?.user.display_name} from this project?`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProjectMembers;