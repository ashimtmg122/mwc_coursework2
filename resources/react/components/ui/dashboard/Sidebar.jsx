import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import "./Sidebar.css";

const Sidebar = () => {
    const location = useLocation();

    //  Get User from Store
    const { user } = useAuthStore();

    // Safe Role Check
   
    const userRole = user?.role?.name || "";

    const isAdmin = userRole === "Administrator";
    const isManager = userRole === "Manager";

    // Helper to determine active state
    const isActive = (path) => {
        if (path === "/dashboard") {
            return location.pathname === "/dashboard";
        }
        return location.pathname.startsWith(path);
    };

    const getLinkClasses = (path) => {
        const baseClasses = "list-group-item py-3 sidebar-link-content";
        return isActive(path)
            ? `${baseClasses} active-mint`
            : `${baseClasses} hover-glass`;
    };

    return (
        <div className="list-group list-group-flush mt-3">
           
            <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
                <i className="bi bi-bar-chart-line-fill fs-5"></i>
                <span>Overview</span>
            </Link>

            <Link
                to="/dashboard/knowledge"
                className={getLinkClasses("/dashboard/knowledge")}
            >
                <i className="bi bi-journal-text fs-5"></i>
                <span>Knowledge Base</span>
            </Link>

           
            {(isAdmin || isManager) && (
                <Link
                    to="/dashboard/reviews"
                    className={getLinkClasses("/dashboard/reviews")}
                >
                    <i className="bi bi-clipboard-check-fill fs-5"></i>
                    <span>Pending Reviews</span>
                </Link>
            )}

           
            {isAdmin && (
                <>
                    <div className="sidebar-section-header">Administration</div>

                    <Link
                        to="/dashboard/user"
                        className={getLinkClasses("/dashboard/users")}
                    >
                        <i className="bi bi-people-fill fs-5"></i>
                        <span>Team Members</span>
                    </Link>
                </>
            )}

           
            <div className="sidebar-section-header">System</div>
            {isAdmin && (
                <Link
                    to="/dashboard/logs"
                    className={getLinkClasses("/dashvoard/logs")}
                >
                    <i className="bi bi-activity me-3"></i>
                    <span>System Logs</span>
                </Link>
            )}

            <Link
                to="/dashboard/profile"
                className={getLinkClasses("/dashvoard/profile")}
            >
                <i className="bi bi-person-gear fs-5"></i>
                <span>Profile & Settings</span>
            </Link>
        </div>
    );
};

export default Sidebar;
