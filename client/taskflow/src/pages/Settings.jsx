import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../utils/apiClient";
import { QUERY_KEYS } from "../utils/queryKeys";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
import { FaLock, FaUser, FaBell } from "react-icons/fa";
import { toast } from "react-toastify";
import Profile from "../components/settings/Profile";
import PasswordReset from "../components/settings/PasswordReset";
import NotificationSettings from "../components/settings/NotificationSettings";

const Settings = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("profile");

    const { data: user, isLoading: fetching, error, refetch } = useQuery({
        queryKey: QUERY_KEYS.currentUser(),
        queryFn: async () => (await apiClient.get("/user/me/")).data,
        staleTime: 1000 * 60 * 5,
    });

    // Generic mutation wrapper exposed to child components
    const { mutateAsync: makeRequest } = useMutation({
        mutationFn: ({ url, method = "PATCH", data }) =>
            apiClient({ method, url, data }).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser() });
        },
    });

    // Adapter so Profile/PasswordReset keep the same makeRequest(url, method, body) signature
    const makeRequestAdapter = (url, method, body) =>
        makeRequest({ url, method, data: body });

    if (fetching) return <LoadingScreen message="Loading settings..." />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-full mb-4">
                    <FaLock className="text-red-500 dark:text-red-400 text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">Unavailable</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6">Could not load your profile settings.</p>
                <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950/50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your profile, account preferences, and security settings.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-md shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                    {/* Tab Header Row */}
                    <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 px-4 pt-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                                activeTab === "profile"
                                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                            }`}
                        >
                            <FaUser size={14} className={activeTab === "profile" ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-slate-500"} />
                            <span>Profile & Account</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                                activeTab === "security"
                                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                            }`}
                        >
                            <FaLock size={14} className={activeTab === "security" ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-slate-500"} />
                            <span>Security & Password</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 shrink-0 ${
                                activeTab === "notifications"
                                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                            }`}
                        >
                            <FaBell size={14} className={activeTab === "notifications" ? "text-blue-600 dark:text-blue-500" : "text-gray-400 dark:text-slate-500"} />
                            <span>Notification Settings</span>
                        </button>
                    </div>

                    {/* Active Content Body */}
                    <div className="p-8">
                        {activeTab === "profile" && (
                            <Profile user={user} makeRequest={makeRequestAdapter} refetch={refetch} />
                        )}
                        {activeTab === "security" && (
                            <PasswordReset user={user} makeRequest={makeRequestAdapter} />
                        )}
                        {activeTab === "notifications" && (
                            <NotificationSettings />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;