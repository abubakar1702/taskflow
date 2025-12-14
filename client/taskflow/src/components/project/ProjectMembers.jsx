import { useState } from "react";
import Avatar from "../common/Avatar";
import { FaCrown, FaUserShield, FaStar } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import AddProjectMemberModal from "../modals/AddProjectMemberModal";
import DeleteModal from "../modals/DeleteModal";
import { useApi } from "../hooks/useApi";
import { toast } from "react-toastify";

const ProjectMembers = ({ project, onProjectUpdated, isProjectAdmin, isProjectCreator }) => {
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const { makeRequest: deleteMember, loading: isDeleting } = useApi();
    const { makeRequest: updateMemberRole, loading: isRoleChangeLoading } = useApi();

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleChangeRole = async (memberId, newRole) => {
        try {
            await updateMemberRole(
                `/api/projects/${project.id}/members/${memberId}/`,
                "PATCH",
                { role: newRole }
            );
            toast.success("Member role updated successfully");
            onProjectUpdated();
        } catch (error) {
            console.error("Failed to update member role:", error);
            toast.error(error.message || "Failed to update member role");
        }
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
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Member":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;

        try {
            await deleteMember(
                `/api/projects/${project.id}/members/${memberToDelete.id}/`,
                "DELETE"
            );
            toast.success("Member removed from project");
            onProjectUpdated();
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error("Failed to remove member:", error);
            toast.error(error.message || "Failed to remove member");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Project Members
                </h2>
                {isProjectAdmin && (
                    <button
                        onClick={() => setIsAddMemberModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <span className="flex items-center gap-2"><FiUserPlus className="w-4 h-4 mr-2" /> Add Member</span>
                    </button>
                )}
            </div>
            <div className="divide-y divide-gray-200">
                {project.members.map((member) => {
                    const canChangeRole = (isProjectCreator && member.user.id !== project.creator.id) ||
                        (isProjectAdmin && member.role !== "Admin" && member.user.id !== project.creator.id);

                    return (
                        <div
                            key={member.id}
                            className="p-6 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        name={member.user.display_name}
                                        url={member.user.avatar}
                                        size={12}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900">
                                                {member.user.display_name}
                                            </p>
                                            {project.creator.id === member.user.id && (
                                                <FaStar className="text-orange-400" title="Project Creator" />
                                            )}
                                            {getRoleIcon(member.role)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {member.user.email}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Joined {formatDate(member.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canChangeRole ? (
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 ${getRoleBadgeColor(member.role)}`}
                                            disabled={isRoleChangeLoading}
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
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
                                                className="text-sm text-gray-500 hover:text-red-600 px-3 py-1 hover:bg-red-50 rounded transition-colors"
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