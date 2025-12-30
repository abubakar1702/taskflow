import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImg from "../../assets/taskflow-login.png";
import axios from "axios";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import GoogleAuth from "./GoogleAuth";

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            setError("First name is required");
            return false;
        }
        if (!formData.lastName.trim()) {
            setError("Last name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }
        if (!formData.password.trim()) {
            setError("Password is required");
            return false;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
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
            const registerResponse = await axios.post(
                `${API_BASE_URL}/user/register/`,
                {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
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

            if (registerResponse.status === 201 || registerResponse.status === 200) {
                try {
                    const loginResponse = await axios.post(
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

                    if (loginResponse.data?.access) {
                        const storage = sessionStorage;
                        storage.setItem("accessToken", loginResponse.data.access);

                        if (loginResponse.data.refresh) {
                            storage.setItem("refreshToken", loginResponse.data.refresh);
                        }

                        storage.setItem(
                            "user",
                            JSON.stringify({
                                id: loginResponse.data.user.id,
                                email: loginResponse.data.user.email,
                                name: `${loginResponse.data.user.first_name} ${loginResponse.data.user.last_name}`,
                                firstName: loginResponse.data.user.first_name,
                                lastName: loginResponse.data.user.last_name,
                                avatar: loginResponse.data.user.avatar,
                            })
                        );
                        navigate("/", { replace: true });
                    }
                } catch (loginErr) {
                    console.error("Auto-login error:", loginErr);
                    navigate("/login", {
                        state: { message: "Account created successfully! Please log in." }
                    });
                }
            }
        } catch (err) {
            console.error("Registration error:", err);

            let errorMessage = "Registration failed. Please try again.";
            if (err.response) {
                if (err.response.status === 400) {
                    if (err.response.data?.email) {
                        errorMessage = "This email is already registered.";
                    } else if (err.response.data?.detail) {
                        errorMessage = err.response.data.detail;
                    } else if (err.response.data?.message) {
                        errorMessage = err.response.data.message;
                    }
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
            setError("Google sign up failed. No token received.");
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

            const storage = sessionStorage;
            storage.setItem("accessToken", response.data.access);

            if (response.data.refresh) {
                storage.setItem("refreshToken", response.data.refresh);
            }

            storage.setItem(
                "user",
                JSON.stringify({
                    id: response.data.user.id,
                    email: response.data.user.email,
                    name: `${response.data.user.first_name} ${response.data.user.last_name}`,
                    firstName: response.data.user.first_name,
                    lastName: response.data.user.last_name,
                    avatar: response.data.user.avatar,
                })
            );

            navigate("/", { replace: true });
        } catch (err) {
            console.error("Google sign up error:", err);
            setError("Google sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google sign up failed. Please try again.");
    };

    return (
        <div className="flex items-center justify-center h-screen p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="flex flex-col md:flex-row">
                    {/* Left Side - Image with Glassmorphism */}
                    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative items-center justify-center p-12">
                        <div className="absolute inset-0">
                            <img
                                src={loginImg}
                                alt="TaskFlow Sign Up"
                                className="h-full w-full object-cover opacity-20"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Floating Card with Brand */}
                        <div className="relative z-10 text-white text-center space-y-6">
                            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Join TaskFlow</h3>
                                <p className="text-white/90 text-sm">
                                    Start organizing your tasks and achieving your goals today!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Modern Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-500">
                                Sign up to get started with TaskFlow
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Name Fields Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* First Name Field */}
                                <div className="group">
                                    <label
                                        htmlFor="firstName"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("First name")
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-200 bg-gray-50 focus:bg-white"
                                            } focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        placeholder="John"
                                    />
                                </div>

                                {/* Last Name Field */}
                                <div className="group">
                                    <label
                                        htmlFor="lastName"
                                        className="block text-sm font-semibold text-gray-700 mb-2"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("Last name")
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-200 bg-gray-50 focus:bg-white"
                                            } focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="group">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("email") || error.includes("Email")
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-200 bg-gray-50 focus:bg-white"
                                        } focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="group">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full px-4 py-3 rounded-xl border-2 ${error.includes("password") || error.includes("Password")
                                            ? "border-red-400 bg-red-50"
                                            : "border-gray-200 bg-gray-50 focus:bg-white"
                                            } focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 focus:outline-none disabled:text-gray-300 transition-colors duration-200"
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <IoEyeOff size={20} />
                                        ) : (
                                            <IoEye size={20} />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            {/* Error Message with Animation */}
                            {error && (
                                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top-2">
                                    <p className="text-red-700 text-sm font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button with Gradient */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <ClipLoader size={20} color="#fff" />
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        {/* Google Authentication */}
                        <GoogleAuth
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            disabled={loading}
                        />

                        {/* Sign In Link */}
                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors inline-block"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;