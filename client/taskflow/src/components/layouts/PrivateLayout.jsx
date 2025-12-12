import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { UserProvider } from "../../contexts/UserContext";

const PrivateLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    if (!isAuthenticated()) {
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
    }, []);

    return (
        <UserProvider>
            <div className="flex bg-gray-50 min-h-screen pt-16">
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
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} />
                <div
                    className={`flex-1 transition-all duration-300 ${isMobile ? "ml-20" : (collapsed ? "ml-20" : "ml-64")
                        } p-8`}
                >
                    <Outlet />
                </div>
            </div>
        </UserProvider>
    );
};

export default PrivateLayout;