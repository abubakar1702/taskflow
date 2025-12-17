import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImg from "../../assets/taskflow-login.png";
import axios from "axios";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import GoogleAuth from "./GoogleAuth";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        keepLoggedIn: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const handleStorage = (data) => {
        try {
            if (!data?.access) throw new Error("Invalid token received");
            if (!data?.user) throw new Error("User data not found in response");

            const storage = formData.keepLoggedIn ? localStorage : sessionStorage;
            storage.setItem("accessToken", data.access);

            if (data.refresh) {
                storage.setItem("refreshToken", data.refresh);
            }

            storage.setItem(
                "user",
                JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    name: `${data.user.first_name} ${data.user.last_name}`,
                    firstName: data.user.first_name,
                    lastName: data.user.last_name,
                    avatar: data.user.avatar,
                })
            );

            return true;
        } catch (err) {
            console.error("Token storage error:", err);
            setError("Failed to process login. Please try again.");
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!formData.password.trim()) {
            setError("Password is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/login/`,
                {
                    email: formData.email,
                    password: formData.password,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (!response.data?.access) {
                throw new Error("Invalid response from server");
            }

            if (handleStorage(response.data)) {
                navigate("/", { replace: true });
            }
        } catch (err) {
            console.error("Login error:", err);

            let errorMessage = "Login failed. Please check your credentials.";
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = "Invalid email or password.";
                } else if (err.response.data?.detail) {
                    errorMessage = err.response.data.detail;
                }
            } else if (err.request) {
                errorMessage = "Network error. Please check your connection.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            setError("Google login failed. No token received.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/auth/google/`,
                {
                    token: credentialResponse.credential,
                },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                }
            );

            if (!response.data?.access) {
                throw new Error("Invalid response from server");
            }

            if (handleStorage(response.data)) {
                navigate("/", { replace: true });
            }
        } catch (err) {
            console.error("Google login error:", err);
            setError("Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed. Please try again.");
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">TaskFlow</h3>
                                <p className="text-white/90 text-sm">
                                    Organize your tasks, boost your productivity, and achieve your goals with ease.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Modern Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-500">Sign in to continue to TaskFlow</p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("email") || error.includes("Email") ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("password") || error.includes("Password") ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"} focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none disabled:text-gray-300 transition-colors duration-200"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top-2">
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Keep Logged In & Forgot Password */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center group">
                                    <input
                                        id="keepLoggedIn"
                                        name="keepLoggedIn"
                                        type="checkbox"
                                        checked={formData.keepLoggedIn}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
                                    />
                                    <label htmlFor="keepLoggedIn" className="ml-2 block text-sm text-gray-600 cursor-pointer group-hover:text-gray-800 transition-colors">
                                        Keep me logged in
                                    </label>
                                </div>
                                <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <ClipLoader size={20} color="#fff" />
                                        Signing in...
                                    </span>
                                ) : "Sign In"}
                            </button>
                        </form>

                        {/* Google Authentication */}
                        <GoogleAuth 
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            disabled={loading}
                        />

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;