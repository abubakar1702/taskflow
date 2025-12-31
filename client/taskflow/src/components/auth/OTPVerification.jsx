import React from "react";
import { ClipLoader } from "react-spinners";

const OTPVerification = ({
    otp,
    setOtp,
    handleVerify,
    loading,
    error,
    onBack,
    backLabel = "Back to Sign In",
    theme = "blue"
}) => {
    const themeClasses = {
        blue: {
            inputBorder: "focus:ring-blue-500/20 focus:border-blue-500",
            buttonGradient: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
            buttonRing: "focus:ring-blue-500 shadow-blue-500/30 hover:shadow-blue-500/40"
        },
        purple: {
            inputBorder: "focus:ring-purple-500/20 focus:border-purple-500",
            buttonGradient: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
            buttonRing: "focus:ring-purple-500 shadow-purple-500/30 hover:shadow-purple-500/40"
        }
    };

    const colors = themeClasses[theme] || themeClasses.blue;

    return (
        <form className="space-y-4" onSubmit={handleVerify}>
            <div className="group">
                <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    One-Time Password (OTP)
                </label>
                <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                    maxLength={6}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${error
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-gray-50 focus:bg-white"
                        } focus:ring-2 ${colors.inputBorder} transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-center text-2xl tracking-widest`}
                    placeholder="000000"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                    Please check your email inbox (and spam folder) for a 6-digit code.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg animate-in slide-in-from-top-2">
                    <p className="text-red-700 text-sm font-medium">
                        {error}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || otp.length < 6}
                className={`w-full py-3.5 px-4 rounded-xl bg-gradient-to-r ${colors.buttonGradient} text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${colors.buttonRing}`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <ClipLoader size={20} color="#fff" />
                        Verifying...
                    </span>
                ) : (
                    "Verify Account"
                )}
            </button>

            <button
                type="button"
                onClick={onBack}
                className="w-full py-2 px-4 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
                {backLabel}
            </button>
        </form>
    );
};

export default OTPVerification;