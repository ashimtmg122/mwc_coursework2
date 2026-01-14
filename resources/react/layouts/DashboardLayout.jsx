import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/ui/dashboard/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../components/ui/dashboard/Sidebar";

const DashboardLayout = () => {
    const { restoreLogin } = useAuthStore();

    useEffect(() => {
        restoreLogin();
    }, []);

    return (
        <>
            <div className="d-flex" id="wrapper">
                
                <div
                    className="sidebar-pine border-end"
                    id="sidebar-wrapper"
                    style={{
                        width: "250px",
                        minHeight: "100vh",
                        position: "fixed",
                        zIndex: 1000,
                        transition: "all 0.3s ease",
                    }}
                >
                    <div className="sidebar-heading text-white fw-bold py-4 px-3 border-bottom border-white border-opacity-25">
                        <span className="d-flex align-items-center gap-2">
                            <i className="bi bi-tree-fill"></i>{" "}
                            {/* Optional Icon */}
                            KNMS System
                        </span>
                    </div>

                    <div className="p-2">
                        <Sidebar />
                    </div>
                </div>

                <div
                    id="page-content-wrapper"
                    className="dashboard-bg"
                    style={{ marginLeft: "250px", width: "100%" }}
                >
                    <Navbar />

                    <div className="container-fluid p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="fw-bold text-pine m-0">
                                Dashboard Overview
                            </h2>
                           
                            <small className="text-muted">
                                {new Date().toLocaleDateString("en-GB", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </small>
                        </div>

                        <div className="row">
                            <Outlet />
                        </div>

                        <footer className="pt-4 mt-5 text-muted border-top border-secondary border-opacity-10 text-center text-sm-start">
                            <small>
                                © {new Date().getFullYear()} Ashim Tamang
                                Knowledge Network Management System Assignment
                            </small>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;
