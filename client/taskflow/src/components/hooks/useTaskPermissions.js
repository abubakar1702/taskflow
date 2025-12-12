import { useUser } from "../../contexts/UserContext";

export const useTaskPermissions = (task) => {
    const { currentUser } = useUser();

    const isCreator = currentUser?.id === task?.creator?.id;

    const canUpload = isCreator || task?.assignees?.some(a => a.id === currentUser?.id);

    const isAssignee =
        Array.isArray(task?.assignees) &&
        task.assignees.some(a => a.id === currentUser?.id);

    return { currentUser, isCreator, isAssignee, canUpload };
};
