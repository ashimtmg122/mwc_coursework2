import React, { useState, useEffect } from "react";
import Axios from "../api/Axios";
import { Link } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement, 
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2"; // <--- Import Pie
import { useAuthStore } from "../store/useAuthStore";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement, 
    Title,
    Tooltip,
    Legend
);

const DashboardHome = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await Axios.get("/dashboard-stats");
                setData(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading)
        return <div className="p-5 text-center">Loading Dashboard...</div>;

  

    // Line Chart (Activity)
    const lineChartData = {
        labels:
            data?.charts?.line.map((item) =>
                new Date(item.date).toLocaleDateString(undefined, {
                    weekday: "short",
                })
            ) || [],
        datasets: [
            {
                label: "New Articles",
                data: data?.charts?.line.map((item) => item.count) || [],
                borderColor: "#2D5A27",
                backgroundColor: "rgba(45, 90, 39, 0.1)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    //  Bar Chart (Categories)
    const barChartData = {
        labels: data?.charts?.bar.map((tag) => tag.label) || [],
        datasets: [
            {
                label: "Documents",
                data:
                    data?.charts?.bar.map((tag) => tag.knowledge_items_count) ||
                    [],
                backgroundColor: "rgba(45, 90, 39, 0.7)",
                borderRadius: 6,
            },
        ],
    };

    //  Pie Chart (Status Distribution)
    const getStatusLabel = (s) => {
        if (s === 0) return "Drafts";
        if (s === 1) return "Pending Review";
        if (s === 2) return "Published";
        return "Unknown";
    };

    const pieChartData = {
        labels:
            data?.charts?.pie.map((item) => getStatusLabel(item.status)) || [],
        datasets: [
            {
                data: data?.charts?.pie.map((item) => item.count) || [],
                backgroundColor: [
                    "#6c757d", 
                    "#ffc107", 
                    "#198754", 
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: "top" } },
    };

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="mb-5">
                <h2 className="fw-bold text-dark mb-1">
                    Welcome back, {user?.name}!
                </h2>
                <p className="text-muted">
                    Here's what's happening in your workspace today.
                </p>
            </div>

          
            <div className="row g-4 mb-5">
                
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                                <i className="bi bi-journal-text fs-4"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">
                                    {data?.stats.total_docs || 0}
                                </h3>
                                <div className="text-muted small">
                                    Total Articles
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

               
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 rounded-4 position-relative overflow-hidden">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-circle">
                                <i className="bi bi-pencil-square fs-4"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">
                                    {data?.stats.my_drafts || 0}
                                </h3>
                                <div className="text-muted small">
                                    My Drafts
                                </div>
                            </div>
                        </div>
                        {data?.stats.my_drafts > 0 && (
                            <Link
                                to="/dashboard/knowledge"
                                className="stretched-link"
                            ></Link>
                        )}
                    </div>
                </div>

              
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle">
                                <i className="bi bi-hourglass-split fs-4"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">
                                    {data?.stats.pending_reviews || 0}
                                </h3>
                                <div className="text-muted small">
                                    Pending Reviews
                                </div>
                            </div>
                        </div>
                        {(user?.role?.name === "Administrator" ||
                            user?.role?.name === "Manager") && (
                            <Link
                                to="/dashboard/reviews"
                                className="stretched-link"
                            ></Link>
                        )}
                    </div>
                </div>

              
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                                <i className="bi bi-people-fill fs-4"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-0">
                                    {data?.stats.total_users || 0}
                                </h3>
                                <div className="text-muted small">
                                    Team Members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

         
            <div className="row g-4">
                
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 rounded-4">
                        <h5 className="fw-bold text-pine mb-4">
                            Activity Trends (Last 7 Days)
                        </h5>
                        <div style={{ height: "300px" }}>
                            <Line
                                options={{
                                    ...chartOptions,
                                    maintainAspectRatio: false,
                                }}
                                data={lineChartData}
                            />
                        </div>
                    </div>
                </div>

               
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                        <h5 className="fw-bold text-pine mb-4">
                            Top Categories
                        </h5>
                        <div style={{ height: "300px" }}>
                            <Bar
                                options={{
                                    ...chartOptions,
                                    maintainAspectRatio: false,
                                }}
                                data={barChartData}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4 rounded-4 h-100">
                        <h5 className="fw-bold text-pine mb-4">
                            Content Status
                        </h5>
                        <div
                            className="d-flex justify-content-center"
                            style={{ height: "300px" }}
                        >
                            <Pie
                                options={{
                                    ...chartOptions,
                                    maintainAspectRatio: false,
                                }}
                                data={pieChartData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
