import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "../api/Axios";
import { toast } from "react-toastify";

const CreateUser = () => {
    const navigate = useNavigate();

    const [loadingRoles, setLoadingRoles] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role_id: "",
    });

    // Fetch Roles for Dropdown
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await Axios.get("/users/roles");
                setRoles(res.data);
            } catch (error) {
                console.error("Failed to load roles", error);
                toast.error("Could not load system roles.");
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        if (errors[e.target.name])
            setErrors({ ...errors, [e.target.name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await Axios.post("/users", formData);
            toast.success("New member added successfully!");
            navigate("/dashboard/user");
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                toast.error("Failed to create user. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container py-4" style={{ maxWidth: "600px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-pine mb-1">Add Team Member</h2>
                    <p className="text-muted mb-0">
                        Create a new account for system access.
                    </p>
                </div>
                <Link
                    to="/dashboard/user"
                    className="btn btn-outline-secondary rounded-pill px-4"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white p-5 rounded-4 shadow-sm border">
                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className={`form-control p-3 ${
                                errors.name ? "is-invalid" : ""
                            }`}
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <div className="invalid-feedback">
                                {errors.name[0]}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            className={`form-control p-3 ${
                                errors.email ? "is-invalid" : ""
                            }`}
                            placeholder="e.g. john@company.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <div className="invalid-feedback">
                                {errors.email[0]}
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">Password</label>
                        <input
                            type="password"
                            name="password"
                            className={`form-control p-3 ${
                                errors.password ? "is-invalid" : ""
                            }`}
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">
                                {errors.password[0]}
                            </div>
                        )}
                    </div>

                    {/* Role Dropdown */}
                    <div className="mb-4">
                        <label className="form-label fw-bold">
                            Assign Role
                        </label>
                        {loadingRoles ? (
                            <div className="text-muted small">
                                Loading roles...
                            </div>
                        ) : (
                            <select
                                name="role_id"
                                className={`form-select p-3 ${
                                    errors.role_id ? "is-invalid" : ""
                                }`}
                                value={formData.role_id}
                                onChange={handleChange}
                            >
                                <option value="">Select a role...</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.role_id && (
                            <div className="invalid-feedback">
                                {errors.role_id[0]}
                            </div>
                        )}
                    </div>

                    <div className="d-grid mt-5">
                        <button
                            type="submit"
                            className="btn btn-pine py-3 fw-bold rounded-pill shadow-sm"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-person-plus-fill me-2"></i>{" "}
                                    Create User
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUser;
