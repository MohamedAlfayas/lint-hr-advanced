import { Navigate } from "react-router";
import Dashboard from "../component/dashboard/Dashboard";
import Login from "../component/login/Login";

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