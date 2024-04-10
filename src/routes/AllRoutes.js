import { Navigate } from "react-router";
import React, { lazy } from "react";
import AccountSettings from "../pages/employee/AccountSetting";

// import Dashboard from "../pages/dashboard/Dashboard";
// import Login from "../pages/auth/login/Login";
// import Register from "../pages/auth/register/Register";
// import ForgetPassword from "../pages/auth/forgotpassword/ForgetPassword";
// import ProjectOverview from "../pages/organization";
// import Employee from "../pages/employee/Employee";
// import EmployeeView from "../pages/employee/EmployeeView";
// import Roles from "../pages/roles/Roles";
// import WorkSchedule from "../pages/workschedule/WorkSchedule";
// import Holidays from "../pages/holidays/Holidays";
// import LeaveType from "../pages/leave/LeaveType";
// import LeaveApproval from "../pages/leave/LeaveApproval";
// import LeaveDashboard from "../pages/leave/Leaves";
// import CustomField from "../pages/customField/CustomField";
// import PayRoll from "../pages/payroll/PayRoll";
// import Xlsx from "../pages/xlsx/Xlsx"
// import PayRollConfig from "../pages/payroll/PayRollConfig";
// import AttendanceDashboard from "../pages/attendance/Attendance";
// import AttendanceConfig from "../pages/attendanceConfig/AttendanceConfig"
// import AttendanceReport from "../pages/attendance/AttendanceReport";

const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Login = lazy(() => import("../pages/auth/login/Login"));
const Register = lazy(() => import("../pages/auth/register/Register"));
const ForgetPassword = lazy(() =>
  import("../pages/auth/forgotpassword/ForgetPassword")
);
const WorkSpace = lazy(() => import("../pages/auth/workspace/WorkSpace"));
const ProjectOverview = lazy(() => import("../pages/organization"));
const Employee = lazy(() => import("../pages/employee/Employee"));
const EmployeeView = lazy(() => import("../pages/employee/EmployeeView"));
const Roles = lazy(() => import("../pages/roles/Roles"));
const WorkSchedule = lazy(() => import("../pages/workschedule/WorkSchedule"));
const Holidays = lazy(() => import("../pages/holidays/Holidays"));
const LeaveType = lazy(() => import("../pages/leave/LeaveType"));
const LeaveApproval = lazy(() => import("../pages/leave/LeaveApproval"));
const LeaveDashboard = lazy(() => import("../pages/leave/Leaves"));
const CustomField = lazy(() => import("../pages/customField/CustomField"));
const PayRoll = lazy(() => import("../pages/payroll/PayRoll"));
const Xlsx = lazy(() => import("../pages/xlsx/Xlsx"));
const PayRollConfig = lazy(() => import("../pages/payroll/PayRollConfig"));
const AttendanceDashboard = lazy(() =>
  import("../pages/attendance/Attendance")
);
const AttendanceConfig = lazy(() =>
  import("../pages/attendanceConfig/AttendanceConfig")
);
const AttendanceReport = lazy(() =>
  import("../pages/attendance/AttendanceReport")
);
const AttendanceApproval = lazy(() =>
  import("../pages/attendanceApproval/AttendanceApproval")
);

const privateRoutes = [
  { path: "/dashboard", component: <Dashboard />, perm: "all" },
  {
    path: "/organization",
    component: <ProjectOverview />,
    perm: ["dac690d1-6712-4aa6-9b4f-7d71bc4f8eb1"],
  },
  { path: "/employee", component: <Employee />, perm: ["a196c41a-5ecb-40c2-ace9-02b5f4819b29"] },
  {
    path: "/employee/view/:id",
    component: <EmployeeView />,
    perm: "all",
  },
  { path: "/roles", component: <Roles />, perm: [] },
  { path: "/workschedule", component: <WorkSchedule />, perm: [] },
  { path: "/holidays", component: <Holidays />, perm: [] },
  { path: "/leavetype", component: <LeaveType />, perm: [] },
  { path: "/account-settings", component: <AccountSettings />, perm: "all" },
  {
    path: "/leave-approval",
    component: <LeaveApproval />,
    perm: "leave_approval",
  },
  { path: "/leaves", component: <LeaveDashboard />, perm: "all" },
  { path: "/custom-field", component: <CustomField />, perm: "custom_field" },
  { path: "/payroll", component: <PayRoll />, perm: "payroll" },
  {
    path: "/payrollconfig",
    component: <PayRollConfig />,
    perm: "payroll_config",
  },
  {
    path: "/attendance",
    component: <AttendanceDashboard />,
    perm: "attendance",
  },
  { path: "/xlsx", component: <Xlsx />, perm: "xlsx" },
  {
    path: "/attendanceconfig",
    component: <AttendanceConfig />,
    perm: "attendance_config",
  },
  {
    path: "/attendancereport",
    component: <AttendanceReport />,
    perm: "attendance_report",
  },
  {
    path: "/attendanceapproval",
    component: <AttendanceApproval />,
    prem: "attendance_approval",
  },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
    perm: "all",
  },
];

const publicRoutes = [
  { path: "/auth/login", component: <Login /> },
  { path: "/auth/forgot-password", component: <ForgetPassword /> },
  { path: "/auth/register", component: <Register /> },
];

const workSpaceRoutes = [
  { path: "/auth/workspace", component: <WorkSpace /> },
]

export { publicRoutes, privateRoutes, workSpaceRoutes };
