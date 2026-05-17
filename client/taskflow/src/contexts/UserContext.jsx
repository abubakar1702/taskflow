import { createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const queryClient = useQueryClient();

    const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

    const {
        data: currentUser,
        isLoading: loading,
        error: rawError,
        refetch,
    } = useQuery({
        queryKey: QUERY_KEYS.currentUser(),
        queryFn: async () => {
            const response = await apiClient.get("/user/me/");
            const userData = response.data;
            // Keep local storage in sync for offline / cached reads
            localStorage.setItem("user", JSON.stringify(userData));
            return userData;
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5, // 5 minutes — user data rarely changes
        // Fall back to cached user from localStorage on error
        placeholderData: () => {
            try {
                const cached =
                    localStorage.getItem("user") ||
                    sessionStorage.getItem("user");
                return cached ? JSON.parse(cached) : undefined;
            } catch {
                return undefined;
            }
        },
    });

    const error = rawError ? rawError.message : null;

    const refreshUser = useCallback(() => {
        return refetch();
    }, [refetch]);

    const clearUser = useCallback(() => {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.currentUser() });
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
    }, [queryClient]);

    const value = {
        currentUser,
        loading,
        error,
        refreshUser,
        clearUser,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
