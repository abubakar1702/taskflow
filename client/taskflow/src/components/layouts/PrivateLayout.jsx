import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { UserProvider } from "../../contexts/UserContext";

const PrivateLayout = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
    const collapsed = useUIStore((s) => s.isSidebarCollapsed);
    const setCollapsed = useUIStore((s) => s.setSidebarCollapsed);
    const [isMobile, setIsMobile] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setCollapsed]);

    return (
        <UserProvider>
            <div className="flex bg-gray-50 dark:bg-slate-950 dark:text-slate-100 min-h-screen pt-16 transition-colors duration-200">
                <Navbar />
                {isMobile && !collapsed && (
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setCollapsed(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape' || e.key === 'Enter') {
                                setCollapsed(true);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Close sidebar"
                    />
                )}
                <Sidebar isMobile={isMobile} />
                <div
                    className={`flex-1 transition-all duration-300 ${isMobile ? "ml-20" : (collapsed ? "ml-20" : "ml-64")}`}
                >
                    <Outlet />
                </div>
            </div>
        </UserProvider>
    );
};

export default PrivateLayout;