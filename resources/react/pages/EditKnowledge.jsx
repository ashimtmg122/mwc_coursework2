import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Axios from "../api/Axios";

const EditKnowledge = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loadingData, setLoadingData] = useState(true); // Initial fetch loading
    const [submitting, setSubmitting] = useState(false); // Submit button loading
    const [errors, setErrors] = useState({});

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: [],
    });

    // Tag Input State
    const [tagInput, setTagInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("General");

    // 1. Fetch Existing Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await Axios.get(`/knowledge/${id}`);
                const item = res.data;

                // Populate Form
                setFormData({
                    title: item.title,
                    description: item.description,
                    tags: item.tags.map((t) => ({
                        label: t.label,
                        category: t.category || "General",
                    })), // Format tags for UI
                });
            } catch (error) {
                console.error("Error fetching data", error);
                toast.error("Could not load knowledge item.");
                navigate("/dashboard/knowledge");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // Handle Text Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name])
            setErrors({ ...errors, [e.target.name]: null });
    };

    // Add Tag Logic
    const handleAddTag = (e) => {
        e.preventDefault();
        if (!tagInput.trim()) return;

        const newTag = { label: tagInput, category: categoryInput };
        setFormData({
            ...formData,
            tags: [...formData.tags, newTag],
        });
        setTagInput("");
    };

    // Remove Tag Logic
    const handleRemoveTag = (indexToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, index) => index !== indexToRemove),
        });
    };

    // Submit Logic (Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            // Note: Ensure your Laravel route supports PUT /knowledge/{id}
            await Axios.put(`/knowledge/${id}`, formData);

            toast.success("Knowledge item updated successfully!");
            navigate(`/dashboard/knowledge/${id}`); // Go back to view page
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                toast.error("Failed to update. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData)
        return (
            <div className="d-flex justify-content-center py-5">
                <div
                    className="spinner-border text-success"
                    role="status"
                ></div>
            </div>
        );

    return (
        <>
            <style>
                {`
                   
                `}
            </style>

            <div className="container py-4" style={{ maxWidth: "800px" }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-pine mb-1">
                            Edit Knowledge
                        </h2>
                        <p className="text-muted mb-0">
                            Update content and tags.
                        </p>
                    </div>
                    <Link
                        to={`/dashboard/knowledge/${id}`}
                        className="btn btn-outline-secondary rounded-pill px-4"
                    >
                        Cancel
                    </Link>
                </div>

                {/* Main Form */}
                <div className="form-card p-5">
                    <form onSubmit={handleSubmit}>
                        {/* Title Input */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                className={`form-control p-3 ${
                                    errors.title ? "is-invalid" : ""
                                }`}
                                value={formData.title}
                                onChange={handleChange}
                            />
                            {errors.title && (
                                <div className="invalid-feedback">
                                    {errors.title[0]}
                                </div>
                            )}
                        </div>

                        {/* Description Input */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark">
                                Description
                            </label>
                            <textarea
                                name="description"
                                className={`form-control p-3 ${
                                    errors.description ? "is-invalid" : ""
                                }`}
                                rows={8}
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                            {errors.description && (
                                <div className="invalid-feedback">
                                    {errors.description[0]}
                                </div>
                            )}
                        </div>

                        <hr className="my-4 opacity-10" />

                        {/* Tag Manager */}
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark mb-2">
                                Tags & Metadata
                            </label>
                            <div className="p-3 bg-light rounded-3 border border-dashed">
                                <div className="row g-2 align-items-end mb-3">
                                    <div className="col-md-5">
                                        <label className="small text-muted mb-1">
                                            Tag Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Frontend"
                                            value={tagInput}
                                            onChange={(e) =>
                                                setTagInput(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                handleAddTag(e)
                                            }
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="small text-muted mb-1">
                                            Category
                                        </label>
                                        <select
                                            className="form-select"
                                            value={categoryInput}
                                            onChange={(e) =>
                                                setCategoryInput(e.target.value)
                                            }
                                        >
                                            <option value="General">
                                                General
                                            </option>
                                            <option value="Engineering">
                                                Engineering
                                            </option>
                                            <option value="Design">
                                                Design
                                            </option>
                                            <option value="HR">HR</option>
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-success w-100"
                                            onClick={handleAddTag}
                                        >
                                            <i className="bi bi-plus-lg me-1"></i>{" "}
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Active Tags Display */}
                                <div className="d-flex flex-wrap gap-2">
                                    {formData.tags.length === 0 && (
                                        <small className="text-muted fst-italic">
                                            No tags added.
                                        </small>
                                    )}
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="tag-chip shadow-sm"
                                        >
                                            {tag.label}{" "}
                                            <small className="opacity-50">
                                                ({tag.category})
                                            </small>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveTag(index)
                                                }
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="d-flex justify-content-end gap-3 mt-5">
                            <button
                                type="submit"
                                className="btn btn-pine rounded-pill px-5 py-2 fw-bold shadow-sm"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-2"></i>{" "}
                                        Update Content
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditKnowledge;
