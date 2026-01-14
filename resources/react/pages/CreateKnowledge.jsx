import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "../api/Axios";
import { toast } from "react-toastify"; // Assuming you have toastify installed, or use alert

const CreateKnowledge = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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

    // Handle Text Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // Add Tag Logic
    const handleAddTag = (e) => {
        e.preventDefault(); // Prevent form submit
        if (!tagInput.trim()) return;

        const newTag = { label: tagInput, category: categoryInput };
        setFormData({
            ...formData,
            tags: [...formData.tags, newTag],
        });
        setTagInput(""); 
    };

    const handleRemoveTag = (indexToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, index) => index !== indexToRemove),
        });
    };

    // Submit Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
          
            await Axios.post("/knowledge", formData);

            toast.success("Draft created successfully!");
            navigate("/dashboard/knowledge");
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 422) {
             
                setErrors(err.response.data.errors);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    
                `}
            </style>

            <div className="container py-4" style={{ maxWidth: "800px" }}>
              
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-pine mb-1">
                            Create Knowledge
                        </h2>
                        <p className="text-muted mb-0">
                            Share your expertise with the team.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/knowledge"
                        className="btn btn-outline-secondary rounded-pill px-4"
                    >
                        Cancel
                    </Link>
                </div>

               
                <div className="form-card p-5">
                    <form onSubmit={handleSubmit}>
                      
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
                                placeholder="e.g., React Component Standards 2026"
                                value={formData.title}
                                onChange={handleChange}
                            />
                            {errors.title && (
                                <div className="invalid-feedback">
                                    {errors.title[0]}
                                </div>
                            )}
                        </div>

                     
                        <div className="mb-4">
                            <label className="form-label fw-bold text-dark">
                                Description
                            </label>
                            <textarea
                                name="description"
                                className={`form-control p-3 ${
                                    errors.description ? "is-invalid" : ""
                                }`}
                                rows={6}
                                placeholder="Write a detailed description or paste your content here..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                            <div className="form-text">
                                Markdown is supported.
                            </div>
                            {errors.description && (
                                <div className="invalid-feedback">
                                    {errors.description[0]}
                                </div>
                            )}
                        </div>

                        <hr className="my-4 opacity-10" />

                      
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
                                            <option value="Marketing">
                                                Marketing
                                            </option>
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

                             
                                <div className="d-flex flex-wrap gap-2">
                                    {formData.tags.length === 0 && (
                                        <small className="text-muted fst-italic">
                                            No tags added yet.
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

                       
                        <div className="d-flex justify-content-end gap-3 mt-5">
                            <button
                                type="submit"
                                className="btn btn-pine rounded-pill px-5 py-2 fw-bold shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-2"></i>{" "}
                                        Create Draft
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

export default CreateKnowledge;
