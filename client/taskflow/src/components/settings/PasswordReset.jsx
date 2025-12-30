import React, { useState } from "react";
import { FaLock, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const PasswordReset = ({ user, makeRequest }) => {
    const [resetStep, setResetStep] = useState(0);
    const [resetOtp, setResetOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetStatus, setResetStatus] = useState("idle");

    const initiatePasswordReset = async () => {
        setResetStatus("loading");
        try {
            await makeRequest("/user/password-reset/", "POST", { email: user.email });
            setResetStep(3);
            setResetStatus("success");
            toast.success("OTP sent to your email.");
        } catch (err) {
            console.error("Reset initiation failed:", err);
            setResetStatus("error");
            toast.error(err.data?.detail || "Failed to send OTP.");
        }
    };

    const handlePasswordResetConfirm = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setResetStatus("loading");
        try {
            await makeRequest("/user/password-reset-confirm/", "POST", {
                email: user.email,
                otp: resetOtp,
                new_password: newPassword
            });
            setResetStatus("success");
            setResetStep(4);
            toast.success("Password updated successfully!");
        } catch (err) {
            console.error("Reset confirm failed:", err);
            setResetStatus("error");
            toast.error(err.data?.detail || "Failed to reset password.");
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 py-4">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaLock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Settings</h3>
                <p className="text-gray-500">
                    Manage your password and security preferences.
                </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                {resetStep === 0 && (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            To change your password, we'll send a One-Time Password (OTP) to your registered email address <strong>{user?.email}</strong>.
                        </p>
                        <button
                            onClick={initiatePasswordReset}
                            disabled={resetStatus === "loading"}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {resetStatus === "loading" ? <FaSpinner className="animate-spin" /> : null}
                            Send OTP & Change Password
                        </button>
                    </div>
                )}

                {(resetStep === 3) && (
                    <form onSubmit={handlePasswordResetConfirm} className="space-y-4 text-left">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                            OTP sent to {user?.email}. Please check your inbox.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                            <input
                                type="text"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
                                placeholder="Repeat password"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setResetStep(0)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={resetStatus === "loading"}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                {resetStatus === "loading" && <FaSpinner className="animate-spin" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                )}

                {resetStep === 4 && (
                    <div className="text-center space-y-4 py-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <FaLock size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Success!</h4>
                        <p className="text-gray-600">Your password has been securely updated.</p>
                        <button
                            onClick={() => {
                                setResetStep(0);
                                setResetOtp("");
                                setNewPassword("");
                                setConfirmPassword("");
                            }}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;