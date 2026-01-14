import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../api/Axios";
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email || !password) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }

        try {
            const response = await Axios.post("/login", {
                email: email,
                password: password,
            });

            const { user, token } = response.data;
            console.log("use", user, token);
            localStorage.setItem("token", token); 
            setUser(user);
            navigate("/dashboard");
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Login failed. Check your connection.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

  
    const DEMO_USERS = [
        {
            role: "Administrator",
            email: "admin@admin.com",
            color: "danger",
            icon: "shield-lock",
        },
        {
            role: "Manager",
            email: "manager@admin.com",
            color: "primary",
            icon: "briefcase",
        },
        {
            role: "Know. Champion",
            email: "champion@admin.com",
            color: "warning",
            icon: "trophy",
        },
        {
            role: "Employee",
            email: "employee@admin.com",
            color: "success",
            icon: "person",
        },
    ];

    const fillCredentials = (u) => {
        setEmail(u);
        setPassword("password");
        setError("");
    };

   
    return (
        <>
            <style>
                {`
                    .login-wrapper {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); /* Mint Gradient */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 1rem;
                    }
                    .login-card-modern {
                        background: white;
                        border-radius: 24px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                        overflow: hidden;
                        width: 100%;
                        max-width: 950px;
                        display: flex;
                        flex-direction: row;
                    }
                    .sidebar-section {
                        background: #1B4332; /* Deep Pine */
                        color: white;
                        padding: 3rem;
                        width: 40%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .form-section {
                        padding: 4rem;
                        width: 60%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .demo-user-item {
                        background: rgba(255,255,255,0.08);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        padding: 12px 16px;
                        margin-bottom: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .demo-user-item:hover {
                        background: rgba(255,255,255,0.15);
                        transform: translateX(5px);
                    }
                    .custom-input {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        padding: 0.8rem 1rem;
                        border-radius: 0 8px 8px 0;
                    }
                    .custom-input:focus {
                        background-color: white;
                        border-color: #1B4332;
                        box-shadow: none;
                    }
                    .input-icon {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-right: none;
                        border-radius: 8px 0 0 8px;
                        color: #adb5bd;
                    }
                    @media (max-width: 768px) {
                        .login-card-modern { flex-direction: column; }
                        .sidebar-section, .form-section { width: 100%; padding: 2rem; }
                        .sidebar-section { order: 2; } /* Move sidebar to bottom on mobile */
                    }
                `}
            </style>

            <div className="login-wrapper">
                <div className="login-card-modern">
                    {/* LEFT: Quick Fill Sidebar */}
                    <div className="sidebar-section">
                        <div className="mb-4">
                            <h3 className="fw-bold mb-1">Dev Tools</h3>
                            <p className="text-white-50 small mb-0">
                                Tap a user to auto-fill login.
                            </p>
                        </div>

                        <div className="d-flex flex-column">
                            {DEMO_USERS.map((u, i) => (
                                <div
                                    key={i}
                                    className="demo-user-item d-flex align-items-center gap-3"
                                    onClick={() => fillCredentials(u.email)}
                                >
                                    <div
                                        className={`text-${u.color} bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm`}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                        }}
                                    >
                                        <i className={`bi bi-${u.icon}`}></i>
                                    </div>
                                    <div
                                        className="flex-grow-1"
                                        style={{ lineHeight: "1.2" }}
                                    >
                                        <div
                                            className="fw-bold text-white"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {u.role}
                                        </div>
                                        <div
                                            className="small text-white-50"
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {u.email}
                                        </div>
                                    </div>
                                    <i className="bi bi-chevron-right opacity-50 small"></i>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-top border-white border-opacity-10 text-white-50 small text-center">
                            Pass: <strong>password</strong>
                        </div>
                    </div>

                  
                    <div className="form-section">
                        <div className="mb-5">
                            <h2 className="fw-bold text-dark mb-2">
                                Welcome To KNMS
                            </h2>
                            <p className="text-muted">
                                Enter your credentials to access the workspace.
                            </p>
                        </div>

                        {error && (
                            <div
                                className="alert alert-danger d-flex align-items-center py-2 mb-4 border-0 bg-danger bg-opacity-10 text-danger"
                                role="alert"
                            >
                                <i className="bi bi-exclamation-circle-fill me-2"></i>
                                <div className="small fw-medium">{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                        
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">
                                    Email Address
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text input-icon">
                                        <i className="bi bi-envelope"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control custom-input"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                        
                            <div className="mb-5">
                                <label className="form-label fw-bold text-secondary small text-uppercase">
                                    Password
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text input-icon">
                                        <i className="bi bi-lock"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control custom-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 py-3 fw-bold text-white shadow-sm"
                                style={{
                                    backgroundColor: "#1B4332",
                                    borderRadius: "10px",
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Authenticating...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
