import React, { useState } from "react";
import Axios from "../api/Axios";
import { toast } from "react-toastify";

const DownloadButton = () => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await Axios.get("/reports/download", {
                responseType: "blob", 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "knowledge_report.pdf"); 
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success("Report downloaded successfully!");
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download PDF.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="btn btn-sm btn-primary d-flex align-items-center gap-2"
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
            ) : (
                <i className="bi bi-file-earmark-pdf"></i>
            )}
            Download Report
        </button>
    );
};

export default DownloadButton;
