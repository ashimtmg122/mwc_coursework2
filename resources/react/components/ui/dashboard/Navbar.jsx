import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../../../api/Axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../../../store/useAuthStore";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();

    // --- NOTIFICATION STATE ---
    const [notifications, setNotifications] = useState([]);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const notifRef = useRef(null);

    // 1. Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await Axios.get("/notifications");
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // 2. Toggle Notification Dropdown
    const toggleNotif = async () => {
        setShowNotifMenu(!showNotifMenu);
        if (!showNotifMenu && notifications.some((n) => !n.read_at)) {
            try {
                await Axios.post("/notifications/read");
                fetchNotifications();
            } catch (error) {}
        }
    };

    // Close notifications if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        if (setUser) setUser(null);
        navigate("/");
        toast.info("Logged out successfully");
    };

    return (
        <nav
            className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top px-4 py-3 shadow-sm"
            style={{ zIndex: 1050 }}
        >
            <div className="container-fluid">
                {/* Mobile Toggle */}
                <button
                    className="btn btn-outline-secondary d-lg-none"
                    id="sidebarToggle"
                >
                    <i className="bi bi-list"></i>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* --- NOTIFICATION BELL --- */}
                        <li
                            className="nav-item me-4 position-relative"
                            ref={notifRef}
                        >
                            <button
                                className="btn btn-light border-0 position-relative text-secondary hover-bg-gray"
                                onClick={toggleNotif}
                                style={{
                                    fontSize: "1.25rem",
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                }}
                            >
                                <i className="bi bi-bell"></i>
                                {notifications.length > 0 &&
                                    notifications.some((n) => !n.read_at) && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light p-1"
                                            style={{ fontSize: "0.6rem" }}
                                        >
                                            {
                                                notifications.filter(
                                                    (n) => !n.read_at
                                                ).length
                                            }
                                        </span>
                                    )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifMenu && (
                                <div
                                    className="position-absolute end-0 mt-3 bg-white border rounded-4 shadow-lg overflow-hidden"
                                    style={{ width: "350px", right: "-10px" }}
                                >
                                    <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                                        <h6 className="m-0 fw-bold text-dark">
                                            Notifications
                                        </h6>
                                    </div>
                                    <div
                                        className="list-group list-group-flush"
                                        style={{
                                            maxHeight: "350px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {notifications.length === 0 ? (
                                            <div className="p-5 text-center text-muted">
                                                <i className="bi bi-bell-slash fs-4 mb-2 d-block opacity-50"></i>
                                                <small>
                                                    No notifications yet
                                                </small>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <Link
                                                    key={notif.id}
                                                    to={notif.data.link || "#"}
                                                    className={`list-group-item list-group-item-action p-3 border-bottom-0 ${
                                                        !notif.read_at
                                                            ? "bg-primary bg-opacity-10"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setShowNotifMenu(false)
                                                    }
                                                >
                                                    <div className="d-flex gap-3">
                                                        <div className="mt-1">
                                                            <i
                                                                className={`bi bi-info-circle-fill fs-5 ${
                                                                    !notif.read_at
                                                                        ? "text-primary"
                                                                        : "text-secondary opacity-50"
                                                                }`}
                                                            ></i>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 small fw-semibold text-dark text-wrap">
                                                                {
                                                                    notif.data
                                                                        .message
                                                                }
                                                            </p>
                                                            <small
                                                                className="text-muted"
                                                                style={{
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                {new Date(
                                                                    notif.created_at
                                                                ).toLocaleString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </li>

                        {/* --- USER INFO (No Dropdown) --- */}
                        <li className="nav-item d-flex align-items-center gap-3">
                            <div className="text-end d-none d-md-block">
                                <div className="fw-bold text-dark small">
                                    {user?.name || "User"}
                                </div>
                                <div
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    {user?.role?.name || "Member"}
                                </div>
                            </div>

                            <div
                                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold border border-success border-opacity-25 me-3"
                                style={{ width: "40px", height: "40px" }}
                            >
                                {user?.name?.[0] || "U"}
                            </div>

                            {/* DIRECT LOGOUT BUTTON */}
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-danger btn-sm fw-bold px-3 py-2 rounded-pill"
                            >
                                <i className="bi bi-box-arrow-right me-1"></i>{" "}
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
