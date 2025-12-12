import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/user/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data;
            setCurrentUser(userData);

            localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setError(err.message);
            const cachedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (cachedUser) {
                try {
                    setCurrentUser(JSON.parse(cachedUser));
                } catch (parseErr) {
                    console.error("Failed to parse cached user:", parseErr);
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);
    const refreshUser = useCallback(() => {
        return fetchUser();
    }, [fetchUser]);

    const clearUser = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        refreshUser,
        clearUser
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
