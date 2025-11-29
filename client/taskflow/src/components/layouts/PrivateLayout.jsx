import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";

const PrivateLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCollapsed(true);
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen pt-16">
            <Navbar />
            {isMobile && !collapsed && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-10"
                    onClick={() => setCollapsed(true)}
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
    );
};

export default PrivateLayout;