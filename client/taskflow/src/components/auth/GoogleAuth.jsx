import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleAuth = ({ onSuccess, onError, disabled = false }) => {
    return (
        <div className="w-full">
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default GoogleAuth;