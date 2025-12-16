import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../components/hooks/useApi";
import Avatar from "../components/common/Avatar";
import LoadingScreen from "../components/common/LoadingScreen";
import { FaUser, FaEnvelope, FaSave, FaLock, FaCamera, FaSpinner, FaAt } from "react-icons/fa";
import { toast } from "react-toastify";

const Settings = () => {
    const { data: user, loading: fetching, error, makeRequest, refetch } = useApi("/user/me/");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        username: ""
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    const hasChanges = user && (
        formData.first_name !== (user.first_name || "") ||
        formData.last_name !== (user.last_name || "") ||
        formData.username !== (user.username || "") ||
        avatarFile !== null
    );

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                username: user.username || ""
            });
            setAvatarPreview(null);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            data.append("username", formData.username);
            if (avatarFile) {
                data.append("avatar", avatarFile);
            }

            // Note: useApi usually defaults to JSON, but axios handles FormData automatically if passed as data
            await makeRequest("/user/me/", "PATCH", data);

            toast.success("Profile updated successfully!");
            refetch(); // Refresh data to ensure sync
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.data?.detail || "Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

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
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group">
                                <div className="p-1 bg-white rounded-full border-2 border-gray-100 shadow-sm">
                                    <Avatar
                                        name={user?.display_name || formData.first_name}
                                        url={avatarPreview || user?.avatar}
                                        size={20}
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all z-10"
                                    title="Upload New Avatar"
                                >
                                    <FaCamera size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="mt-4 text-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {user?.display_name || "User"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {user?.is_superuser ? "Super Admin" : user?.is_staff ? "Staff" : "Member"}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information Group */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <FaUser className="text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-800">Identify</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaAt className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white outline-none"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Contact Information Group */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <FaEnvelope className="text-gray-400" />
                                    <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none select-none"
                                        />
                                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="pt-6 flex justify-end gap-3">
                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAvatarFile(null);
                                            setAvatarPreview(null);
                                        }}
                                        disabled={saving}
                                        className="px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
                                    >
                                        Cancel Avatar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving || !hasChanges}
                                    className={`
                                        flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white 
                                        transition-all duration-200 
                                        ${saving ? 'bg-blue-400 cursor-wait' :
                                            !hasChanges ? 'bg-gray-300 cursor-not-allowed opacity-70' :
                                                'bg-blue-600 hover:bg-blue-700 active:translate-y-0 shadow-lg shadow-blue-500/30'}
                                    `}
                                >                              {saving ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Save Changes
                                    </>
                                )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;