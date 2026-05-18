import { create } from 'zustand';

// Read initial state from whichever storage holds a token (localStorage = "keep me in")
const getInitialState = () => {
    const keepLoggedIn = !!localStorage.getItem('accessToken');
    const storage = keepLoggedIn ? localStorage : sessionStorage;
    try {
        const raw = storage.getItem('user');
        return {
            user: raw ? JSON.parse(raw) : null,
            accessToken: storage.getItem('accessToken'),
            refreshToken: storage.getItem('refreshToken'),
            keepLoggedIn,
        };
    } catch {
        return { user: null, accessToken: null, refreshToken: null, keepLoggedIn: false };
    }
};

const useAuthStore = create((set, get) => ({
    ...getInitialState(),

    /** Called after a successful login / token exchange */
    setAuth: ({ user, accessToken, refreshToken, keepLoggedIn = false }) => {
        const storage = keepLoggedIn ? localStorage : sessionStorage;
        const other  = keepLoggedIn ? sessionStorage : localStorage;

        storage.setItem('accessToken', accessToken);
        if (refreshToken) storage.setItem('refreshToken', refreshToken);
        storage.setItem('user', JSON.stringify(user));

        // Clear the other storage so stale tokens don't linger
        ['accessToken', 'refreshToken', 'user'].forEach(k => other.removeItem(k));

        set({ user, accessToken, refreshToken, keepLoggedIn });
    },

    /** Called by the axios refresh interceptor after a silent token refresh */
    setAccessToken: (accessToken) => {
        const storage = get().keepLoggedIn ? localStorage : sessionStorage;
        storage.setItem('accessToken', accessToken);
        set({ accessToken });
    },

    /** Full logout — wipes both storages */
    clearAuth: () => {
        ['accessToken', 'refreshToken', 'user'].forEach(k => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        set({ user: null, accessToken: null, refreshToken: null, keepLoggedIn: false });
    },

    isAuthenticated: () => {
        const { user, accessToken } = get();
        return !!user && !!accessToken;
    },
}));

export default useAuthStore;
