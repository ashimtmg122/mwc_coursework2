import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Axios from "../api/Axios";

const SystemLogs = () => {
    const [healthLogs, setHealthLogs] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);


    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fetchData = async () => {
        try {
            const [healthRes, loginRes] = await Promise.all([
                Axios.get("/system/health-logs"),
                Axios.get("/system/login-logs"),
            ]);

            setHealthLogs(Array.isArray(healthRes.data) ? healthRes.data : []);

            const logs = Array.isArray(loginRes.data)
                ? loginRes.data
                : loginRes.data?.data || [];

            setLoginLogs(logs);
        } catch (error) {
            console.error("Failed to load logs", error);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const runDiagnostics = async () => {
        setChecking(true);
        try {
            const res = await Axios.post("/system/health-check");
            toast.success(res.data.message);
            fetchData();
        } catch (error) {
            toast.error("System Check Failed!");
        } finally {
            setChecking(false);
        }
    };

    if (loading) {
        return (
            <div
                className="d-flex flex-column align-items-center justify-content-center"
                style={{ height: "60vh" }}
            >
                <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                ></div>
                <span className="text-muted fw-medium">
                    Loading System Telemetry...
                </span>
            </div>
        );
    }

    const currentStatus = healthLogs.length > 0 ? healthLogs[0].status : 1;
    const isHealthy = currentStatus === 1;

    return (
        <div className="container-fluid py-4 px-lg-5">
            
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">
                        System Health & Activity
                    </h2>
                    <p className="text-muted m-0">
                        Real-time monitoring of database status and user access.
                    </p>
                </div>
                <button
                    className="btn btn-dark d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm transition-all"
                    onClick={runDiagnostics}
                    disabled={checking}
                >
                    {checking ? (
                        <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                        <i className="bi bi-arrow-repeat"></i>
                    )}
                    Run Diagnostics
                </button>
            </div>

            <div className="card border-0 shadow rounded-4 mb-5 overflow-hidden position-relative">
                <div
                    className={`position-absolute top-0 start-0 h-100 w-1 ${
                        isHealthy ? "bg-success" : "bg-danger"
                    }`}
                    style={{ width: "6px" }}
                ></div>
                <div className="card-body p-4 p-lg-5">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-4">
                            <div
                                className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${
                                    isHealthy
                                        ? "bg-success bg-opacity-10 text-success"
                                        : "bg-danger bg-opacity-10 text-danger"
                                }`}
                                style={{ width: "80px", height: "80px" }}
                            >
                                <i
                                    className={`bi ${
                                        isHealthy
                                            ? "bi-hdd-network"
                                            : "bi-exclamation-octagon-fill"
                                    } fs-1`}
                                ></i>
                            </div>
                            <div>
                                <h6 className="text-uppercase text-muted fw-bold small mb-1 ls-1">
                                    Current Status
                                </h6>
                                <h2
                                    className={`fw-bold mb-1 ${
                                        isHealthy
                                            ? "text-success"
                                            : "text-danger"
                                    }`}
                                >
                                    {isHealthy
                                        ? "Operational"
                                        : "Critical Issues"}
                                </h2>
                                <span className="text-muted small">
                                    <i className="bi bi-clock me-1"></i>
                                    Last Check:{" "}
                                    {healthLogs.length > 0
                                        ? formatDate(healthLogs[0].created_at)
                                        : "Never"}
                                </span>
                            </div>
                        </div>
                       
                        <i
                            className="bi bi-activity text-muted opacity-10 d-none d-md-block"
                            style={{
                                fontSize: "8rem",
                                position: "absolute",
                                right: "20px",
                                top: "-20px",
                            }}
                        ></i>
                    </div>
                </div>
            </div>

            <div className="row g-4">
              
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0 text-dark">
                                <i className="bi bi-clipboard-pulse me-2 text-primary"></i>
                                Diagnostics History
                            </h6>
                            <span className="badge bg-light text-secondary rounded-pill border">
                                Last 20
                            </span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 border-0 text-secondary small text-uppercase fw-bold">
                                            Result
                                        </th>
                                        <th className="py-3 border-0 text-secondary small text-uppercase fw-bold">
                                            Triggered By
                                        </th>
                                        <th className="py-3 border-0 text-secondary small text-uppercase fw-bold text-end pe-4">
                                            Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthLogs.length > 0 ? (
                                        healthLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                style={{ cursor: "default" }}
                                            >
                                                <td className="ps-4">
                                                    {log.status === 1 ? (
                                                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                                                            Pass
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3">
                                                            Fail
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="small fw-medium text-dark">
                                                    {log.monitor?.name || (
                                                        <span className="text-muted fst-italic">
                                                            Auto-System
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="small text-muted text-end pe-4 font-monospace">
                                                    {formatDate(log.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="text-center py-5"
                                            >
                                                <div className="text-muted opacity-50 mb-2">
                                                    <i className="bi bi-clipboard-x fs-1"></i>
                                                </div>
                                                <small>
                                                    No diagnostic logs found
                                                </small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

               
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0 text-dark">
                                <i className="bi bi-shield-lock me-2 text-primary"></i>
                                Recent User Access
                            </h6>
                            <span className="badge bg-light text-secondary rounded-pill border">
                                Last 50
                            </span>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 border-0 text-secondary small text-uppercase fw-bold">
                                            User
                                        </th>
                                        <th className="py-3 border-0 text-secondary small text-uppercase fw-bold">
                                            Email
                                        </th>
                                        <th className="py-3 border-0 text-secondary small text-uppercase fw-bold text-end pe-4">
                                            Logged In
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(loginLogs) &&
                                    loginLogs.length > 0 ? (
                                        loginLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                                                            style={{
                                                                width: "32px",
                                                                height: "32px",
                                                                fontSize:
                                                                    "0.7rem",
                                                                background: `linear-gradient(135deg, #0d6efd, #0a58ca)`,
                                                            }}
                                                        >
                                                            {log.user
                                                                ?.name?.[0] ||
                                                                "U"}
                                                        </div>
                                                        <span className="fw-bold text-dark small">
                                                            {log.user?.name ||
                                                                "Unknown"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="small text-muted">
                                                    {log.user?.email}
                                                </td>
                                                <td className="small text-muted text-end pe-4 font-monospace">
                                                    {formatDate(log.login_time)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="text-center py-5"
                                            >
                                                <div className="text-muted opacity-50 mb-2">
                                                    <i className="bi bi-person-x fs-1"></i>
                                                </div>
                                                <small>
                                                    No recent login activity
                                                </small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;
