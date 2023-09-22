import { Navigate } from "react-router";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/login/Login";
import Register from "../pages/auth/register/Register";
import ForgetPassword from "../pages/auth/forgotpassword/ForgetPassword";
import ProjectOverview from "../pages/organization";

const pathList = [
    {
        "path" : "/dashboard",
        "component" : "Dashboard"
    },
    {
        "path" : "/",
        "component" : "Dashboard"
    }
]

const privateRoutes = [
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/organization", component: <ProjectOverview /> },
    {
        path: "/",
        exact: true,
        component: <Navigate to="/dashboard" />,
    },    
]

const publicRoutes = [
    { path: "/auth/login", component: <Login /> },
    { path: "/auth/forgot-password", component: <ForgetPassword /> },
    { path: "/auth/register", component: <Register /> },
]


export { publicRoutes, privateRoutes }