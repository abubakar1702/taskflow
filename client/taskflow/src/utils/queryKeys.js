/**
 * Centralised TanStack Query key registry.
 * Use these everywhere instead of inline string arrays to avoid typos
 * and to enable precise cache invalidation.
 */
export const QUERY_KEYS = {
    // Users
    currentUser: () => ['current-user'],

    // Tasks
    tasks: (params = '') => ['tasks', params],
    task: (id) => ['task', String(id)],
    runningTasks: () => ['tasks', 'running'],
    userTasks: () => ['user-tasks'],
    importantTasks: () => ['important-tasks'],
    taskActivity: (id) => ['task-activity', String(id)],

    // Subtasks
    subtasks: (taskId) => ['subtasks', String(taskId)],

    // Projects
    projects: () => ['projects'],
    project: (id) => ['project', String(id)],
    projectAssets: (id) => ['project', String(id), 'assets'],
    projectTasks: (id) => ['project', String(id), 'tasks'],

    // Team
    team: () => ['team'],

    // Notifications
    notifications: () => ['notifications'],

    // Notes
    notes: () => ['notes'],
    note: (id) => ['note', String(id)],
};
