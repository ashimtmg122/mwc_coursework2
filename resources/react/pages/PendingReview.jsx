import React, { useState, useEffect } from "react";
import Axios from "../api/Axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const PendingReviews = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchPending = async () => {
        try {
            const res = await Axios.get("/knowledge?status=1");
            setItems(res.data.data);
        } catch (error) {
            console.error("Failed to load pending items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);


    const processItem = async (id, newStatus) => {
        try {
            await Axios.post(`/knowledge/${id}/status`, { status: newStatus });

            const action = newStatus === 2 ? "Approved" : "Rejected";
            toast.success(`Document ${action} successfully.`);

            // Remove item from UI immediately
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed.");
        }
    };

    return (
        <div className="container py-4" style={{ maxWidth: "1000px" }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-pine mb-1">
                        Pending Approvals
                    </h2>
                    <p className="text-muted mb-0">
                        Review and publish content submitted by the team.
                    </p>
                </div>
                <div className="text-end">
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6">
                        {items.length} Pending
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-warning"
                        role="status"
                    ></div>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border border-dashed">
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
                    <h4 className="fw-bold text-dark">All Caught Up!</h4>
                    <p className="text-muted">
                        There are no pending documents to review.
                    </p>
                    <Link
                        to="/dashboard/knowledge"
                        className="btn btn-outline-secondary mt-2"
                    >
                        Back to Library
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {items.map((item) => (
                        <div key={item.id} className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all">
                                <div className="card-body p-4 d-flex flex-column flex-md-row gap-4 align-items-start align-items-md-center">
                                    {/* Content Info */}
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2">
                                                Needs Review
                                            </span>
                                            <small className="text-muted">
                                                Submitted{" "}
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleDateString()}
                                            </small>
                                        </div>

                                        <h4 className="fw-bold text-dark mb-2">
                                            <Link
                                                to={`/dashboard/knowledge/${item.id}`}
                                                className="text-decoration-none text-dark hover-pine"
                                            >
                                                {item.title}
                                            </Link>
                                        </h4>

                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <i className="bi bi-person-circle"></i>
                                            <span>
                                                {item.author?.name ||
                                                    "Unknown Author"}
                                            </span>
                                            <span className="mx-1">•</span>
                                            <span
                                                className="text-truncate"
                                                style={{ maxWidth: "300px" }}
                                            >
                                                {item.description.substring(
                                                    0,
                                                    80
                                                )}
                                                ...
                                            </span>
                                        </div>
                                    </div>

                                  
                                    <div className="d-flex gap-2 flex-shrink-0 w-100 w-md-auto">
                                       
                                        <Link
                                            to={`/dashboard/knowledge/${item.id}`}
                                            className="btn btn-light border text-muted px-3"
                                            title="View Document"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </Link>

                                     
                                        <button
                                            onClick={() =>
                                                processItem(item.id, 0)
                                            }
                                            className="btn btn-white border text-danger hover-bg-danger px-3 fw-bold"
                                        >
                                            <i className="bi bi-x-lg me-2"></i>{" "}
                                            Reject
                                        </button>

                                      
                                        <button
                                            onClick={() =>
                                                processItem(item.id, 2)
                                            }
                                            className="btn btn-success text-white px-4 fw-bold shadow-sm"
                                        >
                                            <i className="bi bi-check-lg me-2"></i>{" "}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingReviews;
