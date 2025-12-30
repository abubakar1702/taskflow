import React, { useState } from "react";
import { Link } from "react-router-dom";
import loginImg from "../../assets/taskflow-login.png";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setMessage("Please enter your email address");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            await axios.post(
                `${API_BASE_URL}/user/password-reset/`,
                { email },
                { headers: { "Content-Type": "application/json" } }
            );

            setStatus("success");
            setStep(2);
            setMessage("OTP sent to your email.");
        } catch (err) {
            console.error("Password reset error:", err);
            setStatus("error");
            setMessage(err.response?.data?.detail || "Failed to send OTP. Please try again.");
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setMessage("All fields are required.");
            setStatus("error");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            setStatus("error");
            return;
        }

        if (newPassword.length < 8) {
            setMessage("Password must be at least 8 characters.");
            setStatus("error");
            return;
        }


        setStatus("loading");
        setMessage("");

        try {
            await axios.post(
                `${API_BASE_URL}/user/password-reset-confirm/`,
                { email, otp, new_password: newPassword },
                { headers: { "Content-Type": "application/json" } }
            );

            setStatus("complete");
            setMessage("Password reset successfully! You can now login.");
        } catch (err) {
            console.error("Reset confirm error:", err);
            setStatus("error");
            setMessage(err.response?.data?.detail || "Failed to reset password. Invalid OTP or expired.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="flex flex-col md:flex-row">
                    {/* Left Side - Image with Glassmorphism */}
                    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative items-center justify-center p-12">
                        <div className="absolute inset-0">
                            <img
                                src={loginImg}
                                alt="TaskFlow Login"
                                className="h-full w-full object-cover opacity-20"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="relative z-10 text-white text-center space-y-6">
                            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 12 13 13.464l1.414-1.414a6 6 0 01-1.414-3.414V7zm-6 0v1h1v1h-1v1H8v-1H7v-1h1V7h1zm0 0l-1 .001V7h1v-.001zM4 10h2v2H4v-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Account Recovery</h3>
                                <p className="text-white/90 text-sm">
                                    Don't worry, we'll help you get back to organizing your tasks in no time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="mb-8">
                            <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
                                <IoArrowBack className="mr-2" />
                                Back to Login
                            </Link>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Forgot Password?
                            </h2>
                            <p className="text-gray-500">
                                {step === 1 ? "Enter your email address to receive an OTP." : "Enter the OTP sent to your email and your new password."}
                            </p>
                        </div>

                        {status === "complete" ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful</h3>
                                <p className="text-gray-600 mb-6">{message}</p>
                                <Link
                                    to="/login"
                                    className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Return to Sign In
                                </Link>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={step === 1 ? handleEmailSubmit : handleResetSubmit}>
                                {step === 1 && (
                                    <div className="group">
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border-2 ${status === "error" ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                                            placeholder="you@example.com"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {step === 2 && (
                                    <>
                                        <div className="group">
                                            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                                                OTP Code
                                            </label>
                                            <input
                                                id="otp"
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${status === "error" ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="group">
                                            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                id="newPassword"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${status === "error" ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                                                placeholder="Enter new password (min 8 chars)"
                                            />
                                        </div>
                                        <div className="group">
                                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 ${status === "error" ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200`}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </>
                                )}

                                {status === "error" && message && (
                                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-in fade-in">
                                        <p className="text-red-700 text-sm font-medium">{message}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                                >
                                    {status === "loading" ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <ClipLoader size={20} color="#fff" />
                                            {step === 1 ? "Sending OTP..." : "Resetting Password..."}
                                        </span>
                                    ) : (step === 1 ? "Send OTP" : "Reset Password")}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
