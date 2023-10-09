import { Navigate } from "react-router";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/login/Login";
import Register from "../pages/auth/register/Register";
import ForgetPassword from "../pages/auth/forgotpassword/ForgetPassword";
import ProjectOverview from "../pages/organization";
import Employee from "../pages/employee/Employee";
import Roles from "../pages/roles/Roles";
import WorkSchedule from "../pages/workschedule/WorkSchedule";
import Holidays from "../pages/holidays/Holidays";
import LeaveType from "../pages/leave/LeaveType";



const privateRoutes = [
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/organization", component: <ProjectOverview /> },
    { path: "/employee", component: <Employee /> },
    { path: "/roles", component: <Roles /> },
    { path: "/workschedule", component: <WorkSchedule /> },
    { path: "/holidays", component: <Holidays /> },
    { path: "/leavetype", component: <LeaveType /> },
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