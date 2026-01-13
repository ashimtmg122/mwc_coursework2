import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../api/Axios";

const CommentForm = ({ knowledgeId, onCommentAdded }) => {
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            const res = await Axios.post(`/knowledge/${knowledgeId}/comments`, {
                text,
            });
            toast.success("Comment posted!");
            setText("");
            if (onCommentAdded) onCommentAdded(res.data); // Update parent list
        } catch (error) {
            console.error(error);
            toast.error("Failed to post comment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-light p-4 rounded-3 mb-4 border">
            <h6 className="fw-bold mb-3">Leave a comment</h6>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="form-control mb-3"
                    rows="3"
                    placeholder="Share your thoughts or suggestions..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                ></textarea>
                <div className="d-flex justify-content-end">
                    <button
                        type="submit"
                        className="btn btn-pine btn-sm px-4"
                        disabled={submitting}
                    >
                        {submitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentForm;
