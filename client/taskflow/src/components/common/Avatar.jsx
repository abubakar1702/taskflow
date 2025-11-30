import { useMemo } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const useAvatar = (name = "User", url = null) => {
    const avatarUrl = useMemo(() => {
        if (!url) return null;
        return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    }, [url]);

    const initials = useMemo(() => {
        if (!name) return "U";

        const nameParts = name.trim().split(" ");
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }

        return name[0]?.toUpperCase() || "U";
    }, [name]);

    return { avatarUrl, initials };
};

const Avatar = ({ name = "User", url = null, className = "", size = 8 }) => {
    const { avatarUrl, initials } = useAvatar(name, url);

    const sizeConfig = {
        6: { container: 'w-6 h-6', text: 'text-[10px]' },
        8: { container: 'w-8 h-8', text: 'text-xs' },
        10: { container: 'w-10 h-10', text: 'text-sm' },
        12: { container: 'w-12 h-12', text: 'text-base' },
        16: { container: 'w-16 h-16', text: 'text-xl' },
        20: { container: 'w-20 h-20', text: 'text-2xl' }
    };

    const { container, text } = sizeConfig[size] || sizeConfig[8];

    return avatarUrl ? (
        <img
            src={avatarUrl}
            alt={name}
            className={`${container} rounded-full border border-white shadow object-cover ${className}`}
        />
    ) : (
        <div
            className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold ${container} ${text} ${className}`}
            style={{ lineHeight: 1 }}
        >
            {initials}
        </div>
    );
};

export default Avatar;
