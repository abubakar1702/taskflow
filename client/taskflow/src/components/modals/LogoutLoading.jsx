import React from 'react';
import { ClipLoader } from 'react-spinners';

const LogoutLoading = () => {
    return (
        <div className="fixed inset-0 bg-black/50 transition-opacity flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
                <ClipLoader color="#3b82f6" size={60} loading />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Logging Out...
                    </h3>
                    <p className="text-sm text-gray-500">
                        Please wait a moment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogoutLoading;