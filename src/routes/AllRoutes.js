import { Navigate } from "react-router";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import ForgetPassword from "../pages/forgotpassword/ForgetPassword";

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
    {
        path: "/",
        exact: true,
        component: <Navigate to="/dashboard" />,
    },    
]

const publicRoutes = [
    { path: "/login", component: <Login /> },
    { path: "/forgot-password", component: <ForgetPassword /> },
    { path: "/register", component: <Register /> },
]


export { publicRoutes, privateRoutes }