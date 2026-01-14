import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Axios from "../api/Axios";
import { toast } from "react-toastify";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roles, setRoles] = useState([]); 
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role_id: "",
    });

    
    useEffect(() => {
        const loadData = async () => {
            try {
               
                const [userRes, rolesRes] = await Promise.all([
                    Axios.get(`/users/${id}`),
                    Axios.get(`/users/roles`),
                ]);

                setFormData({
                    name: userRes.data.name,
                    email: userRes.data.email,
                    role_id: userRes.data.role_id,
                });
                setRoles(rolesRes.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load user data.");
                navigate("/dashboard/users");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            await Axios.put(`/users/${id}`, formData);
            toast.success("User updated successfully!");
            navigate("/dashboard/user");
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                toast.error("Update failed.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="d-flex justify-content-center py-5">
                <div
                    className="spinner-border text-success"
                    role="status"
                ></div>
            </div>
        );

    return (
        <div className="container py-4" style={{ maxWidth: "600px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-pine mb-0">Edit User</h2>
                <Link
                    to="/dashboard/user"
                    className="btn btn-outline-secondary rounded-pill px-4"
                >
                    Cancel
                </Link>
            </div>

            <div className="bg-white p-5 rounded-4 shadow-sm border">
                <form onSubmit={handleSubmit}>
                  
                    <div className="mb-4">
                        <label className="form-label fw-bold">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className={`form-control p-3 ${
                                errors.name ? "is-invalid" : ""
                            }`}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {errors.name && (
                            <div className="invalid-feedback">
                                {errors.name[0]}
                            </div>
                        )}
                    </div>

                
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
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <div className="invalid-feedback">
                                {errors.email[0]}
                            </div>
                        )}
                    </div>

                 
                    <div className="mb-4">
                        <label className="form-label fw-bold">
                            System Role
                        </label>
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
                        {errors.role_id && (
                            <div className="invalid-feedback">
                                {errors.role_id[0]}
                            </div>
                        )}
                        <div className="form-text mt-2">
                            <i className="bi bi-info-circle me-1"></i>
                            Changing the role will update the user's permissions
                            immediately.
                        </div>
                    </div>

                    <div className="d-grid mt-5">
                        <button
                            type="submit"
                            className="btn btn-pine py-3 fw-bold rounded-pill"
                            disabled={submitting}
                        >
                            {submitting ? "Saving Changes..." : "Update User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
