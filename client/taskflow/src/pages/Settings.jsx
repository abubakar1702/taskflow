import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../components/hooks/useApi";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
import { FaUser, FaEnvelope, FaSave, FaLock, FaCamera, FaSpinner, FaAt } from "react-icons/fa";
import { toast } from "react-toastify";
import Profile from "../components/settings/Profile";
import PasswordReset from "../components/settings/PasswordReset";

const Settings = () => {
    const { data: user, loading: fetching, error, makeRequest, refetch } = useApi("/user/me/");
    const [activeTab, setActiveTab] = useState("profile");

    if (fetching) return <LoadingScreen message="Loading settings..." />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <FaLock className="text-red-500 text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
                <p className="text-gray-600 mb-6">Could not load your profile settings.</p>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Tabs Header */}
                <div className="flex border-b border-gray-200 bg-white rounded-md px-2 shadow-sm pt-2">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === "profile"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Profile & Account
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === "security"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Security & Password
                    </button>
                </div>

                <div className="bg-white rounded-b-2xl rounded-t-none shadow-sm border border-gray-100 border-t-0 p-8">
                    {activeTab === "profile" && (
                        <Profile user={user} makeRequest={makeRequest} refetch={refetch} />
                    )}

                    {activeTab === "security" && (
                        <PasswordReset user={user} makeRequest={makeRequest} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;