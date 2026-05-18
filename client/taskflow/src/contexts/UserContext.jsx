import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import useAuthStore from "../stores/useAuthStore";
import { useCallback } from "react";

export const useUser = () => {
    const queryClient = useQueryClient();
    const token = useAuthStore(s => s.accessToken);

    const {
        data: currentUser,
        isLoading: loading,
        error: rawError,
        refetch,
    } = useQuery({
        queryKey: QUERY_KEYS.currentUser(),
        queryFn: async () => {
            const response = await apiClient.get("/user/me/");
            return response.data;
        },
        enabled: !!token,
        staleTime: 1000 * 60 * 5,
    });

    const error = rawError ? rawError.message : null;

    const refreshUser = useCallback(() => {
        return refetch();
    }, [refetch]);

    const clearUser = useCallback(() => {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.currentUser() });
    }, [queryClient]);

    return {
        currentUser,
        loading,
        error,
        refreshUser,
        clearUser,
    };
};

export const UserProvider = ({ children }) => {
    return <>{children}</>;
};
