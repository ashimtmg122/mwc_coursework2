import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Axios from "../api/Axios";
import CommentForm from "../components/ui/CommentForm";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";


const ViewKnowledge = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAdminOrManager = ["Administrator", "Manager"].includes(
        user?.role?.name
    );
    const isAuthor = user?.id === item?.author_id;
    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await Axios.get(`/knowledge/${id}`);
                setItem(res.data);
            } catch (error) {
                console.error("Error fetching item", error);
                toast.error("Could not load document.");
              
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, navigate]);

    // Handle Delete
    const handleDelete = async () => {
        if (
            window.confirm(
                "Are you sure you want to delete this document? This cannot be undone."
            )
        ) {
            try {
                await Axios.delete(`/knowledge/${id}`);
                toast.success("Document deleted successfully.");
                navigate("/dashboard/knowledge");
            } catch (error) {
                toast.error("Failed to delete document.");
            }
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await Axios.post(`/knowledge/${id}/status`, {
                status: newStatus,
            });

            toast.success(res.data.message);

            // Update local state to reflect change immediately
            setItem((prev) => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Failed to update status"
            );
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.info("Link copied to clipboard!");
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 0:
                return {
                    label: "Draft",
                    badgeClass:
                        "bg-secondary bg-opacity-10 text-secondary border-secondary",
                };
            case 1:
                return {
                    label: "Pending Review",
                    badgeClass:
                        "bg-warning bg-opacity-10 text-warning border-warning",
                };
            case 2:
                return {
                    label: "Published",
                    badgeClass:
                        "bg-success bg-opacity-10 text-success border-success",
                };
            default:
                return { label: "Unknown", badgeClass: "bg-light text-muted" };
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

    if (!item)
        return (
            <div className="text-center py-5 text-muted">
                Document not found.
            </div>
        );

    const status = getStatusConfig(item.status);

    return (
        <>
            <style>
                {`
                    /* Document Card */
                    .doc-card {
                        background: white;
                        border-radius: 12px;
                        border: 1px solid rgba(0,0,0,0.05);
                        box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                        transition: box-shadow 0.3s ease;
                    }
                    .doc-card:hover {
                        box-shadow: 0 8px 24px rgba(0,0,0,0.04);
                    }

                    /* Typography */
                    .doc-title {
                        font-family: 'Inter', system-ui, -apple-system, sans-serif;
                        letter-spacing: -0.5px;
                        line-height: 1.2;
                    }
                    .doc-content {
                        font-size: 1.05rem;
                        line-height: 1.8;
                        color: #374151; /* Slate 700 */
                    }
                    
                    /* Badges & Meta */
                    .meta-label {
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #9CA3AF; /* Gray 400 */
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                    }
                    .version-pill {
                        background: #F0FDF4; /* Green 50 */
                        color: #15803D; /* Green 700 */
                        border: 1px solid #DCFCE7;
                        font-family: monospace;
                        padding: 2px 8px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                    }

                    /* Comments Section */
                    .comment-thread-line {
                        position: absolute;
                        left: 20px;
                        top: 45px;
                        bottom: -15px;
                        width: 2px;
                        background-color: #F3F4F6;
                        z-index: 0;
                    }
                    .comment-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                        font-size: 0.9rem;
                        position: relative;
                        z-index: 1;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    }
                    .comment-box {
                        background: #F9FAFB; /* Gray 50 */
                        border: 1px solid #F3F4F6; /* Gray 100 */
                        border-radius: 0 12px 12px 12px;
                        padding: 1rem;
                    }
                `}
            </style>

            <div className="container py-5" style={{ maxWidth: "1100px" }}>
                
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <Link
                        to="/dashboard/knowledge"
                        className="text-decoration-none text-muted d-flex align-items-center gap-2 small fw-medium hover-pine"
                    >
                        <i className="bi bi-arrow-left"></i> Back to Library
                    </Link>
                    <div className="text-muted small">
                        Reference ID:{" "}
                        <span className="font-monospace">DOC-{item.id}</span>
                    </div>
                </div>

                
                <div className="mb-4 pb-4 border-bottom">
                    <div className="meta-label text-pine mb-2">Workflow</div>

                    
                    {item.status === 0 &&
                       
                        (isAuthor || isAdminOrManager) && (
                            <button
                                onClick={() => handleStatusChange(1)}
                                className="btn btn-warning w-100 fw-bold text-white shadow-sm"
                            >
                                <i className="bi bi-send me-2"></i> Submit for
                                Review
                            </button>
                        )}

                    {item.status === 1 && (
                        <>
                           
                            {isAdminOrManager ? (
                                <div className="d-grid gap-2">
                                    <button
                                        onClick={() => handleStatusChange(2)}
                                        className="btn btn-success fw-bold shadow-sm"
                                    >
                                        <i className="bi bi-check-circle me-2"></i>{" "}
                                        Approve & Publish
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(0)}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <i className="bi bi-x-circle me-2"></i>{" "}
                                        Reject (Back to Draft)
                                    </button>
                                </div>
                            ) : (
                               
                                <div className="alert alert-warning py-2 small mb-0 text-center">
                                    <i className="bi bi-hourglass-split me-1"></i>{" "}
                                    Awaiting Admin Review
                                </div>
                            )}
                        </>
                    )}

                    {item.status === 2 &&
                       
                        isAdminOrManager && (
                            <button
                                onClick={() => handleStatusChange(0)}
                                className="btn btn-outline-danger w-100"
                            >
                                <i className="bi bi-arrow-counterclockwise me-2"></i>{" "}
                                Unpublish
                            </button>
                        )}
                </div>
               

                <div className="row g-4">
                   
                    <div className="col-lg-8">
                      
                        <div className="doc-card p-5 mb-5 position-relative bg-white">
                           
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span
                                    className={`badge rounded-pill border border-opacity-25 px-3 py-2 fw-normal ${status.badgeClass}`}
                                >
                                    <i
                                        className="bi bi-circle-fill me-2"
                                        style={{ fontSize: "0.6rem" }}
                                    ></i>
                                    {status.label}
                                </span>
                                <span className="version-pill">
                                    v
                                    {item.versions?.[item.versions.length - 1]
                                        ?.version_number || "0.1"}
                                </span>
                            </div>

                           
                            <h1 className="fw-bold text-dark mb-4 doc-title display-6">
                                {item.title}
                            </h1>

                          
                            <div className="d-flex align-items-center gap-3 py-4 mb-4 border-top border-bottom">
                                <div
                                    className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        fontSize: "1.1rem",
                                    }}
                                >
                                    {item.author?.name?.[0] || "U"}
                                </div>
                                <div>
                                    <div className="fw-bold text-dark">
                                        {item.author?.name}
                                    </div>
                                    <div className="small text-muted">
                                        Published on{" "}
                                        {new Date(
                                            item.created_at
                                        ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>

                           
                            <div className="doc-content">
                                {item.description.split("\n").map((line, i) => (
                                    <p key={i} className="mb-3">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>

                   
                        <div className="mt-5">
                            <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                <i className="bi bi-chat-square-text text-pine"></i>
                                Discussion
                                <span className="text-muted fw-normal fs-6">
                                    ({item.comments?.length || 0})
                                </span>
                            </h4>

                            <CommentForm
                                knowledgeId={id}
                                onCommentAdded={(newComment) => {
                                    setItem((prev) => ({
                                        ...prev,
                                        comments: [
                                            newComment,
                                            ...prev.comments,
                                        ],
                                    }));
                                }}
                            />

                            <div className="mt-4">
                                {item.comments?.map((comment, index) => (
                                    <div
                                        key={comment.id}
                                        className="d-flex gap-3 mb-4 position-relative"
                                    >
                                       
                                        {index !== item.comments.length - 1 && (
                                            <div className="comment-thread-line"></div>
                                        )}

                                       
                                        <div className="comment-avatar bg-white border text-primary">
                                            {comment.user?.name?.[0]}
                                        </div>

                                      
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-baseline gap-2 mb-1">
                                                <span className="fw-bold text-dark text-sm">
                                                    {comment.user?.name}
                                                </span>
                                                <span
                                                    className="text-muted small"
                                                    style={{
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {new Date(
                                                        comment.created_at
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="comment-box shadow-sm">
                                                <p className="mb-0 text-secondary">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                  
                    <div className="col-lg-4">
                        <div
                            className="position-sticky"
                            style={{ top: "2rem" }}
                        >
                         
                            <div className="doc-card p-4 mb-4">
                                <div className="meta-label">Actions</div>
                                <div className="d-grid gap-2">
                                    <Link
                                        to={`/dashboard/knowledge/${id}/edit`}
                                        className="btn btn-pine fw-bold py-2 shadow-sm"
                                    >
                                        <i className="bi bi-pencil-square me-2"></i>{" "}
                                        Edit Document
                                    </Link>

                                    <button
                                        onClick={handleShare}
                                        className="btn btn-light border text-muted py-2"
                                    >
                                        <i className="bi bi-link-45deg me-2"></i>{" "}
                                        Copy Link
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-white text-danger border-0 py-2 mt-2"
                                        style={{ fontSize: "0.9rem" }}
                                    >
                                        <i className="bi bi-trash me-2"></i>{" "}
                                        Delete Document
                                    </button>
                                </div>
                            </div>

                           
                            <div className="doc-card p-4">
                              
                                <div className="mb-4">
                                    <div className="meta-label">Tags</div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {item.tags?.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="badge bg-white text-dark border px-3 py-2 fw-medium"
                                            >
                                                #{tag.label}
                                            </span>
                                        ))}
                                        {(!item.tags ||
                                            item.tags.length === 0) && (
                                            <span className="text-muted small fst-italic">
                                                No tags added
                                            </span>
                                        )}
                                    </div>
                                </div>

                               
                                <div className="mb-4">
                                    <div className="meta-label">Category</div>
                                    <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                                        <i className="bi bi-folder-fill text-warning bg-warning bg-opacity-10 p-2 rounded-circle"></i>
                                        {item.tags?.[0]?.category || "General"}
                                    </div>
                                </div>

                                <hr className="opacity-10 my-3" />

                                
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>Views</span>
                                    <span className="fw-bold text-dark">
                                        24
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewKnowledge;
