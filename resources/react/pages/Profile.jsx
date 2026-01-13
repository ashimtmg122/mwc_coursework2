import React, { useState } from "react";
import Axios from "../api/Axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";

const Profile = () => {
    const { user, setUser } = useAuthStore();

    // --- STATE: Profile Info ---
    const [infoData, setInfoData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [loadingInfo, setLoadingInfo] = useState(false);

    // --- STATE: Password ---
    const [passData, setPassData] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [loadingPass, setLoadingPass] = useState(false);
    const [passErrors, setPassErrors] = useState({});

    // --- HANDLERS ---

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoadingInfo(true);
        try {
            const res = await Axios.post("/profile/info", infoData);
            toast.success("Profile updated!");
            setUser(res.data.user); // Update global store
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed.");
        } finally {
            setLoadingInfo(false);
        }
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault();
        setLoadingPass(true);
        setPassErrors({});
        try {
            await Axios.post("/profile/password", passData);
            toast.success("Password changed successfully.");
            setPassData({
                current_password: "",
                password: "",
                password_confirmation: "",
            }); // Reset form
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setPassErrors(error.response.data.errors);
            } else {
                toast.error("Failed to update password.");
            }
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="container py-4" style={{ maxWidth: "900px" }}>
            <h2 className="fw-bold text-pine mb-4">Account Settings</h2>

            <div className="row g-4">
                {/* --- LEFT COL: General Info --- */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4">Profile Information</h5>
                        <form onSubmit={handleInfoSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={infoData.name}
                                    onChange={(e) =>
                                        setInfoData({
                                            ...infoData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="form-control bg-light"
                                    value={infoData.email}
                                    onChange={(e) =>
                                        setInfoData({
                                            ...infoData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    className="form-control-plaintext fw-bold text-pine px-2 border rounded bg-success bg-opacity-10"
                                    value={user?.role?.name || "Employee"}
                                    readOnly
                                />
                            </div>

                            <div className="d-flex justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-pine rounded-pill px-4"
                                    disabled={loadingInfo}
                                >
                                    {loadingInfo ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT COL: Security --- */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4">Security</h5>
                        <form onSubmit={handlePassSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${
                                        passErrors.current_password
                                            ? "is-invalid"
                                            : ""
                                    }`}
                                    value={passData.current_password}
                                    onChange={(e) =>
                                        setPassData({
                                            ...passData,
                                            current_password: e.target.value,
                                        })
                                    }
                                    required
                                />
                                {passErrors.current_password && (
                                    <div className="invalid-feedback">
                                        {passErrors.current_password[0]}
                                    </div>
                                )}
                            </div>

                            <hr className="my-4 opacity-10" />

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    className={`form-control ${
                                        passErrors.password ? "is-invalid" : ""
                                    }`}
                                    value={passData.password}
                                    onChange={(e) =>
                                        setPassData({
                                            ...passData,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                />
                                {passErrors.password && (
                                    <div className="invalid-feedback">
                                        {passErrors.password[0]}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={passData.password_confirmation}
                                    onChange={(e) =>
                                        setPassData({
                                            ...passData,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="d-flex justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-outline-danger rounded-pill px-4"
                                    disabled={loadingPass}
                                >
                                    {loadingPass
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
