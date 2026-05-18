import React, { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaLaptop, FaSave, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
        <div className="min-w-0 flex-1 pr-4">
            <span className="block text-sm font-semibold text-gray-900 dark:text-slate-100">
                {label}
            </span>
            <span className="block text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                {description}
            </span>
        </div>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    </div>
);

const NotificationSettings = () => {
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        email_assignments: true,
        email_comments: true,
        email_weekly: false,
        push_desktop: false,
        push_deadlines: true,
        push_sound: true,
    });

    // Load initial settings from localStorage if available
    useEffect(() => {
        const stored = localStorage.getItem("taskflow_notification_preferences");
        if (stored) {
            try {
                setPreferences(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse notification preferences", e);
            }
        }
    }, []);

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);

        setTimeout(() => {
            localStorage.setItem("taskflow_notification_preferences", JSON.stringify(preferences));
            setSaving(false);
            toast.success("Notification preferences updated successfully!");
        }, 800);
    };

    return (
        <form onSubmit={handleSave} className="space-y-8">
            {/* Email Notifications Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <FaEnvelope className="text-gray-400 dark:text-slate-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Email Notifications</h3>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/20 rounded-lg border border-gray-150 dark:border-slate-800/60 px-5 divide-y divide-gray-100 dark:divide-slate-800">
                    <Toggle
                        checked={preferences.email_assignments}
                        onChange={() => handleToggle("email_assignments")}
                        label="Task Assignments"
                        description="Receive an email message immediately when you are assigned to a new task."
                    />
                    <Toggle
                        checked={preferences.email_comments}
                        onChange={() => handleToggle("email_comments")}
                        label="Comments and Mentions"
                        description="Receive an email when someone comments on tasks you own or replies to your comments."
                    />
                    <Toggle
                        checked={preferences.email_weekly}
                        onChange={() => handleToggle("email_weekly")}
                        label="Weekly Summary Digest"
                        description="Receive a curated summary email every Monday morning outlining your achievements and upcoming tasks."
                    />
                </div>
            </section>

            {/* Desktop and Sound Alerts Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                    <FaLaptop className="text-gray-400 dark:text-slate-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Desktop & Audio Alerts</h3>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/20 rounded-lg border border-gray-150 dark:border-slate-800/60 px-5 divide-y divide-gray-100 dark:divide-slate-800">
                    <Toggle
                        checked={preferences.push_desktop}
                        onChange={() => handleToggle("push_desktop")}
                        label="Live Desktop Notifications"
                        description="Show real-time toast popups on your operating system for incoming alerts and updates."
                    />
                    <Toggle
                        checked={preferences.push_deadlines}
                        onChange={() => handleToggle("push_deadlines")}
                        label="Deadline Alerts"
                        description="Alert me via push notification 24 hours before any of my assigned tasks are due."
                    />
                    <Toggle
                        checked={preferences.push_sound}
                        onChange={() => handleToggle("push_sound")}
                        label="Sound Effects"
                        description="Play a subtle, premium audio chime whenever a new notification lands in your alert inbox."
                    />
                </div>
            </section>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white 
                        transition-all duration-200 shadow-md shadow-blue-500/20
                        ${saving ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 active:translate-y-0.5'}
                    `}
                >
                    {saving ? (
                        <>
                            <FaSpinner className="animate-spin" />
                            Saving Preferences...
                        </>
                    ) : (
                        <>
                            <FaSave />
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default NotificationSettings;
