export const useTaskPermissions = (task) => {
    const currentUser = JSON.parse(
        localStorage.getItem("user") ||
        sessionStorage.getItem("user") ||
        "{}"
    );

    const isCreator = currentUser.id === task?.creator?.id;

    const isAssignee =
        Array.isArray(task?.assignees) &&
        task.assignees.some(a => a.id === currentUser.id);

    return { currentUser, isCreator, isAssignee };
};
