import React, { useState, useEffect } from "react";
import Axios from "../api/Axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({});

    // Fetch Users
    const fetchUsers = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const res = await Axios.get(`/users?page=${page}&search=${search}`);
            setUsers(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch team members.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1, searchTerm);
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to remove this user?")) {
            try {
                await Axios.delete(`/users/${id}`);
                toast.success("User removed successfully.");
                fetchUsers(pagination.current_page, searchTerm); // Refresh list
            } catch (error) {
                toast.error("Failed to delete user.");
            }
        }
    };


    const getRoleBadge = (roleName) => {
        const role = roleName?.toLowerCase() || "";
        if (role.includes("admin"))
            return "bg-danger bg-opacity-10 text-danger";
        if (role.includes("manager"))
            return "bg-primary bg-opacity-10 text-primary";
        if (role.includes("champion"))
            return "bg-warning bg-opacity-10 text-warning";
        return "bg-secondary bg-opacity-10 text-secondary"; 
    };

    return (
        <>
            <style>
                {`
                    .user-table th {
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #adb5bd;
                        font-weight: 600;
                        padding-bottom: 1rem;
                    }
                    .user-table td {
                        vertical-align: middle;
                        padding: 1rem 0.5rem;
                        color: #495057;
                    }
                    .avatar-circle {
                        width: 40px;
                        height: 40px;
                        background-color: #E8F5E9;
                        color: #2D5A27;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 1rem;
                    }
                    .table-card {
                        background: white;
                        border-radius: 16px;
                        border: 1px solid #f0f0f0;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    }
                    .search-input {
                        border-radius: 50px;
                        border: 1px solid #e9ecef;
                        padding-left: 1.2rem;
                    }
                    .search-input:focus {
                        border-color: #2D5A27;
                        box-shadow: 0 0 0 4px rgba(45, 90, 39, 0.1);
                    }
                `}
            </style>

            <div className="container py-4">
                
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-pine mb-1">Team Members</h2>
                        <p className="text-muted mb-0">
                            Manage access and view {pagination.total || 0}{" "}
                            registered users.
                        </p>
                    </div>

                    <Link
                        to="/dashboard/user/create"
                        className="btn btn-pine rounded-pill px-4 shadow-sm"
                    >
                        <i className="bi bi-person-plus-fill me-2"></i> Add
                        Member
                    </Link>
                </div>

            
                <div className="row mb-4">
                    <div className="col-md-5">
                        <form onSubmit={handleSearch} className="d-flex gap-2">
                            <input
                                type="text"
                                className="form-control search-input"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="btn btn-light border"
                                type="submit"
                            >
                                <i className="bi bi-search"></i>
                            </button>
                        </form>
                    </div>
                </div>

           
                <div className="table-card p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-success"
                                role="status"
                            ></div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover user-table mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-3">User</th>
                                        <th>Role</th>
                                        <th>Email Address</th>
                                        <th>Joined On</th>
                                        <th className="text-end pe-3">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="ps-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-circle">
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">
                                                            {user.name}
                                                        </div>
                                                        <div className="small text-muted d-md-none">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge rounded-pill border border-opacity-10 px-3 py-2 ${getRoleBadge(
                                                        user.role?.name
                                                    )}`}
                                                >
                                                    {user.role?.name ||
                                                        "Employee"}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {user.email}
                                            </td>
                                            <td className="text-muted">
                                                {new Date(
                                                    user.created_at
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="text-end pe-3">
                                                <Link
                                                    to={`/dashboard/user/${user.id}/edit`}
                                                    className="btn btn-sm btn-white border me-2 text-muted"
                                                >
                                                    <i className="bi bi-pencil me-1"></i>{" "}
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className="btn btn-sm btn-white border text-danger hover-bg-danger"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.length === 0 && (
                                <div className="text-center py-5 text-muted">
                                    No users found matching "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}

               
                    {!loading && pagination.last_page > 1 && (
                        <div className="d-flex justify-content-end mt-4 gap-2">
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                disabled={pagination.current_page === 1}
                                onClick={() =>
                                    fetchUsers(
                                        pagination.current_page - 1,
                                        searchTerm
                                    )
                                }
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                disabled={
                                    pagination.current_page ===
                                    pagination.last_page
                                }
                                onClick={() =>
                                    fetchUsers(
                                        pagination.current_page + 1,
                                        searchTerm
                                    )
                                }
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserList;
