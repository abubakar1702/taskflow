import { create } from 'zustand';

export const useUIStore = create((set) => ({
    isSidebarCollapsed: false,
    theme: localStorage.getItem('theme') || 'light',
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (val) => set({ isSidebarCollapsed: val }),
    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({ theme });
    }
}));
