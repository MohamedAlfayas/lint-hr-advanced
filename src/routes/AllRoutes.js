import { Navigate } from "react-router";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login";

const privateRoutes = [
    { path: "/dashboard", component: <Dashboard /> },
    {
        path: "/",
        exact: true,
        component: <Navigate to="/dashboard" />,
    },
]

const publicRoutes = [
    { path: "/login", component: <Login /> },
]


export { publicRoutes, privateRoutes }