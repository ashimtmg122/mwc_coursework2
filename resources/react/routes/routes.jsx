import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/DashboardHome";
import LoginPage from "../pages/LoginPage";
import KnowledgeFeed from "../pages/KnowledgeFeed";
import CreateKnowledge from "../pages/CreateKnowledge";
import ViewKnowledge from "../pages/ViewKnowledge";
import EditKnowledge from "../pages/EditKnowledge";
import UserList from "../pages/UserList";
import EditUser from "../pages/EditUser";
import CreateUser from "../pages/CreateUser";
import PendingReviews from "../pages/PendingReview";
import Profile from "../pages/Profile";
import SystemLogs from "../pages/SystemLogs";

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
    },
    {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
            { index: true, element: <DashboardHome /> },
            { path: "knowledge", element: <KnowledgeFeed /> },
            { path: "knowledge/create", element: <CreateKnowledge /> },
            { path: "knowledge/:id", element: <ViewKnowledge /> },
            { path: "knowledge/:id/edit", element: <EditKnowledge /> },
            { path: "user", element: <UserList /> },
            { path: "user/create", element: <CreateUser /> },
            { path: "user/:id/edit", element: <EditUser /> },
            { path: "reviews", element: <PendingReviews /> },
            { path: "profile", element: <Profile /> },
            { path: "logs", element: <SystemLogs /> },
        ],
    },
]);

export default router;
