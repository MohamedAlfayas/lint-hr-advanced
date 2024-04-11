import { Navigate } from "react-router";
import React, { lazy } from "react";
import AccountSettings from "../pages/employee/AccountSetting";
import ApprovalFilter from "../component/common/tableFilter/ApprovalFilter";

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

const defaultRoutes = [
  { path: "/dashboard", component: <Dashboard />, perm: "all" },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
    perm: "all",
  },
]

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
    perm: ["1b5d106f-f3e8-41f3-8041-d3f71a19d27d", "08cd201a-d20d-45d3-8b60-3a6fb7e4acc0"],
  },
  { path: "/leaves", component: <LeaveDashboard />, perm: "all" },
  { path: "/custom-field", component: <CustomField />, perm: ["9057d872-1f18-42c8-b2fb-89b29f2c05cf"] },
  { path: "/payroll", component: <PayRoll />, perm: "all" },
  {
    path: "/payrollconfig",
    component: <PayRollConfig />,
    perm: "all",
  },
  {
    path: "/attendance",
    component: <AttendanceDashboard />,
    perm: "all",
  },
  { path: "/xlsx", component: <Xlsx />, perm: "all" },
  {
    path: "/attendanceconfig",
    component: <AttendanceConfig />,
    perm: [],
  },
  {
    path: "/attendancereport",
    component: <AttendanceReport />,
    perm: ["c77528b2-5d9f-49ad-b6d1-5f95e61a66a0"],
  },
  {
    path: "/attendanceapproval",
    component: <AttendanceApproval />,
    perm: ["8d33a155-2d7e-4a5d-8608-35431a44662c", "2ebd3c5d-dca8-45cc-8334-5a32f2451893"],
  },
  {
    path: "/approval",
    component: <ApprovalFilter />,
    perm: [
      "8d33a155-2d7e-4a5d-8608-35431a44662c",
      "2ebd3c5d-dca8-45cc-8334-5a32f2451893",
      "1b5d106f-f3e8-41f3-8041-d3f71a19d27d",
      "08cd201a-d20d-45d3-8b60-3a6fb7e4acc0"
    ],
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

export { defaultRoutes, publicRoutes, privateRoutes, workSpaceRoutes };
