import { Navigate } from "react-router";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/login/Login";
import Register from "../pages/auth/register/Register";
import ForgetPassword from "../pages/auth/forgotpassword/ForgetPassword";
import ProjectOverview from "../pages/organization";
import Employee from "../pages/employee/Employee";
import EmployeeView from "../pages/employee/EmployeeView";
import Roles from "../pages/roles/Roles";
import WorkSchedule from "../pages/workschedule/WorkSchedule";
import Holidays from "../pages/holidays/Holidays";
import LeaveType from "../pages/leave/LeaveType";
import LeaveApproval from "../pages/leave/LeaveApproval";
import LeaveDashboard from "../pages/leave/Leaves";
import CustomField from "../pages/customField/CustomField";
import PayRoll from "../pages/payroll/PayRoll";
import Xlsx from "../pages/xlsx/Xlsx"
import PayRollConfig from "../pages/payroll/PayRollConfig";
import AttendanceDashboard from "../pages/attendance/Attendance";
import AttendanceConfig from "../pages/attendanceConfig/AttendanceConfig"



const privateRoutes = [
    { path: "/dashboard", component: <Dashboard /> },
    { path: "/organization", component: <ProjectOverview /> },
    { path: "/employee", component: <Employee /> },
    { path: "/employee/view/:id", component: <EmployeeView /> },
    { path: "/roles", component: <Roles /> },
    { path: "/workschedule", component: <WorkSchedule /> },
    { path: "/holidays", component: <Holidays /> },
    { path: "/leavetype", component: <LeaveType /> },
    { path: "/leave-approval", component: <LeaveApproval /> },
    { path: "/leaves", component: <LeaveDashboard /> },
    { path: "/custom-field", component: <CustomField /> },
    { path: "/payroll", component: <PayRoll /> },
    { path: "/payrollconfig", component: <PayRollConfig /> },
    { path: "/attendance", component: <AttendanceDashboard /> },
    { path: "/xlsx", component: <Xlsx /> },
    { path: "/attendanceconfig", component: <AttendanceConfig /> },
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