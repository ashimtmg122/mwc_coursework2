import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Axios from "../api/Axios";

const KnowledgeFeed = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination State
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    // Inside the component...
    const handleDelete = async () => {
        if (
            window.confirm(
                "Are you sure you want to delete this? This action cannot be undone."
            )
        ) {
            try {
                await Axios.delete(`/knowledge/${id}`);
                toast.success("Item deleted successfully.");
                navigate("/dashboard/knowledge");
            } catch (error) {
                console.error("Delete failed", error);
                toast.error("Failed to delete item.");
            }
        }
    };
    // Fetch Logic
    const fetchKnowledge = async (query = "", page = 1) => {
        setLoading(true);
        try {
            // Laravel Pagination API Call: /knowledge?search=...&page=...
            const res = await Axios.get(
                `/knowledge?search=${query}&page=${page}`
            );

            setItems(res.data.data);

            // Store Pagination Meta Data
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
            });
        } catch (error) {
            console.error("Failed to load knowledge", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchKnowledge();
    }, []);

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        // Reset to page 1 when searching
        fetchKnowledge(searchTerm, 1);
    };

    // Handle Page Change
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchKnowledge(searchTerm, newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Status Helpers
    const getStatusConfig = (status) => {
        switch (status) {
            case 0: // Draft
                return {
                    badge: "bg-secondary bg-opacity-10 text-secondary",
                    border: "#6c757d",
                    label: "Draft",
                };
            case 1: // Pending
                return {
                    badge: "bg-warning bg-opacity-10 text-warning",
                    border: "#ffc107",
                    label: "Pending Review",
                };
            case 2: // Published
                return {
                    badge: "bg-success bg-opacity-10 text-success",
                    border: "#198754",
                    label: "Published",
                };
            default:
                return {
                    badge: "bg-light text-muted",
                    border: "#dee2e6",
                    label: "Unknown",
                };
        }
    };

    return (
        <>
            {/* Header Section */}
            <div className="row mb-5 align-items-center">
                {/* 1. Title (Takes up 5 columns) */}
                <div className="col-md-5">
                    <h1 className="fw-bold text-pine mb-1">Knowledge Base</h1>
                    <p className="text-muted">
                        Explore {pagination.total} articles, documentation, and
                        insights.
                    </p>
                </div>

                {/* 2. Create Button (Takes up 2 columns) */}
                <div className="col-md-2 text-end">
                    <Link
                        to="/dashboard/knowledge/create"
                        className="btn btn-pine rounded-pill px-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    >
                        <i className="bi bi-plus-lg fw-bold"></i>
                        <span>Create New</span>
                    </Link>
                </div>

                {/* 3. Search Bar (Takes up 5 columns - Kept your existing code) */}
                <div className="col-md-5">
                    <form onSubmit={handleSearch} className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn btn-pine shadow-sm"
                        >
                            🔍
                        </button>
                    </form>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5 text-muted">
                    <div
                        className="spinner-border text-success mb-2"
                        role="status"
                    ></div>
                    <p>Fetching knowledge...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                    <i className="bi bi-journal-x fs-1 text-muted opacity-50"></i>
                    <h4 className="mt-3 text-secondary">No results found</h4>
                    <p className="text-muted">
                        We couldn't find anything matching "{searchTerm}".
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            fetchKnowledge("", 1);
                        }}
                        className="btn btn-outline-secondary btn-sm mt-2"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Card Grid */}
            <div className="row g-4">
                {!loading &&
                    items.map((item) => {
                        const statusConfig = getStatusConfig(item.status);
                        return (
                            <div key={item.id} className="col-md-6 col-lg-12">
                                <div className="knowledge-card p-4 h-100 d-flex flex-column shadow-sm">
                                    {/* Status Border Color Strip */}
                                    <div
                                        className="card-accent"
                                        style={{
                                            backgroundColor:
                                                statusConfig.border,
                                        }}
                                    ></div>

                                    {/* Header: Badge & Date */}
                                    <div className="d-flex justify-content-between align-items-start mb-3 ps-2">
                                        <span
                                            className={`badge rounded-pill ${statusConfig.badge} px-3 py-2 border border-opacity-10`}
                                        >
                                            {statusConfig.label}
                                        </span>
                                        <small className="text-muted d-flex align-items-center gap-1">
                                            <i className="bi bi-calendar3"></i>
                                            {new Date(
                                                item.created_at
                                            ).toLocaleDateString()}
                                        </small>
                                    </div>

                                    {/* Title */}
                                    <Link
                                        to={`/dashboard/knowledge/${item.id}`}
                                        className="text-decoration-none ps-2"
                                    >
                                        <h4 className="fw-bold text-dark mb-2">
                                            {item.title}
                                        </h4>
                                    </Link>

                                    {/* Description */}
                                    <p
                                        className="text-muted ps-2 mb-3"
                                        style={{ lineHeight: "1.6" }}
                                    >
                                        {item.description.length > 150
                                            ? item.description.substring(
                                                  0,
                                                  150
                                              ) + "..."
                                            : item.description}
                                    </p>

                                    {/* Tags Row (Moved here for better spacing) */}
                                    <div className="ps-2 mb-3 d-flex gap-2 flex-grow-1 align-items-end">
                                        {item.tags?.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="tag-badge"
                                            >
                                                #{tag.label}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer: Author & Action Buttons */}
                                    <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center ps-2">
                                        {/* Left: Author Info */}
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold border border-success border-opacity-25"
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    fontSize: "0.8rem",
                                                }}
                                            >
                                                {item.author?.name?.[0] || "U"}
                                            </div>
                                            <span className="text-sm fw-medium text-dark">
                                                {item.author?.name || "Unknown"}
                                            </span>
                                        </div>

                                        {/* Right: Action Buttons */}
                                        <div className="d-flex gap-2">
                                            {/* View Button */}
                                            <Link
                                                to={`/dashboard/knowledge/${item.id}`}
                                                className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                                                style={{
                                                    borderColor: "#E8F5E9",
                                                    color: "#6c757d",
                                                }}
                                            >
                                                <i className="bi bi-eye"></i>{" "}
                                                View
                                            </Link>

                                            {/* Edit Button - Uses your Pine theme */}
                                            <Link
                                                to={`/dashboard/knowledge/${item.id}/edit`}
                                                className="btn btn-sm btn-pine rounded-pill px-3 d-flex align-items-center gap-1"
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* Pagination Controls */}
            {!loading && items.length > 0 && (
                <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
                    <button
                        className="btn btn-pine"
                        disabled={pagination.current_page === 1}
                        onClick={() => changePage(pagination.current_page - 1)}
                    >
                        <i className="bi bi-chevron-left me-1"></i> Previous
                    </button>

                    <span className="text-muted fw-medium">
                        Page{" "}
                        <span className="text-dark">
                            {pagination.current_page}
                        </span>{" "}
                        of {pagination.last_page}
                    </span>

                    <button
                        className="btn btn-pine"
                        disabled={
                            pagination.current_page === pagination.last_page
                        }
                        onClick={() => changePage(pagination.current_page + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
};

export default KnowledgeFeed;
