import { Navigate } from "react-router";
import React, { lazy } from "react";
import AccountSettings from "../pages/employee/AccountSetting";
import ApprovalFilter from "../component/common/tableFilter/ApprovalFilter";
import {
  EMPLOYEE_VIEW_ACCESS_KEY,
  VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
  VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
  VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
  CAN_VIEW_REPORT_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
  CUSTOM_FIELD_VIEW_ACCESS_KEY,
  CLIENT_VIEW_ACCESS_KEY,
  CREATE_CLIENT_ACCESS_KEY,
  EDIT_CLIENT_ACCESS_KEY,
  COMPANY_PROFILE_VIEW_ACCESS_KEY,
  DEPARTMENT_VIEW_ACCESS_KEY,
  BRANCH_VIEW_ACCESS_KEY,
  ROLES_VIEW_ACCESS_KEY,
  FORMS_VIEW_ACCESS_KEY,
  LOCATION_GROUP_VIEW_ACCESS_KEY,
  ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY,
  VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,
  VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY,
  CREATE_TASK_ACCESS_KEY,
  EDIT_TASK_ACCESS_KEY,
} from "../common/constant/RoleConstants";
import Status from "../pages/Task/Status/Status";
import Priorities from "../pages/Task/Priorities/Priorities";
import ContactGroup from "../pages/Contact/ContactGroup/ContactGroup";
import Contacts from "../pages/Contact/Contacts/Contacts";
import Clients from "../pages/Crm/Clients/Clients";
import Projects from "../pages/Crm/Projects/Projects";
import TaskTab from "../pages/Crm/Task/TaskTab";
import TaskSettingsTab from "../pages/Task/TaskSettings/TaskSettingsTab";
import ProjectOverviewTab from "../pages/Crm/Projects/ProjectOverviewTab";
import ClientOverview from "../pages/Crm/Clients/ClientOverview";
import ClientOverviewTab from "../pages/Crm/Clients/ClientOverviewTab";
import LeaveReport from "../pages/attendance/LeaveReport";
import AllEmployeeLocation from "../pages/dashboard/EmployeeMap/AllEmployeeLocation";
import BreakReport from "../pages/attendance/BreakReport";
import { Notification } from "rsuite";
import Notifications from "../pages/notification/Notifications";

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
const ForgetPassword = lazy(
  () => import("../pages/auth/forgotpassword/ForgetPassword"),
);
const WorkSpace = lazy(() => import("../pages/auth/workspace/WorkSpace"));
const ProjectOverview = lazy(() => import("../pages/organization"));
const Employee = lazy(() => import("../pages/employee/Employee"));
const EmployeeView = lazy(() => import("../pages/employee/EmployeeView"));
const Roles = lazy(() => import("../pages/roles/Roles"));
const WorkSchedule = lazy(() => import("../pages/workschedule/WorkSchedule"));
const MyReimbursementsPage = lazy(
  () => import("../pages/reimbursement/MyReimbursementsPage"),
);
const Holidays = lazy(() => import("../pages/holidays/Holidays"));
const LeaveType = lazy(() => import("../pages/leave/LeaveType"));
const LeaveApproval = lazy(() => import("../pages/leave/LeaveApproval"));
const LeaveDashboard = lazy(() => import("../pages/leave/Leaves"));
const CustomField = lazy(() => import("../pages/customField/CustomField"));
const PayRoll = lazy(() => import("../pages/payroll/EmployeePayslip"));
const Xlsx = lazy(() => import("../pages/xlsx/Xlsx"));
const PayRollConfig = lazy(() => import("../pages/payroll/PayRollConfig"));
const AttendanceDashboard = lazy(
  () => import("../pages/attendance/Attendance"),
);
const AttendanceConfig = lazy(
  () => import("../pages/attendanceConfig/AttendanceConfig"),
);
const AttendanceReport = lazy(
  () => import("../pages/attendance/AttendanceReport"),
);
const AttendanceApproval = lazy(
  () => import("../pages/attendanceApproval/AttendanceApproval"),
);

const defaultRoutes = [
  { path: "/dashboard", component: <Dashboard />, perm: "all" },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
    perm: "all",
  },
];

const privateRoutes = [
  { path: "/dashboard", component: <Dashboard />, perm: "all" },
  {
    path: "/organization",
    component: <ProjectOverview />,
    perm: [
      COMPANY_PROFILE_VIEW_ACCESS_KEY,
      DEPARTMENT_VIEW_ACCESS_KEY,
      BRANCH_VIEW_ACCESS_KEY,
      CUSTOM_FIELD_VIEW_ACCESS_KEY,
      ROLES_VIEW_ACCESS_KEY,
      FORMS_VIEW_ACCESS_KEY,
      LOCATION_GROUP_VIEW_ACCESS_KEY,
    ],
  },
  {
    path: "/employee",
    component: <Employee />,
    perm: [
      EMPLOYEE_VIEW_ACCESS_KEY,
      VIEW_TEAM_EMPLOYEE_ACCESS_KEY,
      VIEW_HIERARCHY_EMPLOYEE_ACCESS_KEY,
    ],
  },
  {
    path: "/employee/view/:id",
    component: <EmployeeView />,
    perm: "all",
  },
  // { path: "/roles", component: <Roles />, perm: [] },
  // { path: "/workschedule", component: <WorkSchedule />, perm: [] },
  { path: "/roles", component: <Roles />, perm: [ROLES_VIEW_ACCESS_KEY] },
  { path: "/workschedule", component: <WorkSchedule />, perm: [ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY] },
  { path: "/holidays", component: <Holidays />, perm: "all" },
  {
    path: "/my-reimbursements",
    component: <MyReimbursementsPage />,
    perm: "all",
  },
  // { path: "/leavetype", component: <LeaveType />, perm: [] },
  { path: "/leavetype", component: <LeaveType />, perm: [ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY] },
  { path: "/account-settings", component: <AccountSettings />, perm: "all" },
  {
    path: "/leave-approval",
    component: <LeaveApproval />,
    perm: [
      VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
      VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
    ],
  },
  { path: "/leaves", component: <LeaveDashboard />, perm: "all" },
  {
    path: "/custom-field",
    component: <CustomField />,
    perm: [CUSTOM_FIELD_VIEW_ACCESS_KEY],
  },
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
  // {
  //   path: "/attendanceconfig",
  //   component: <AttendanceConfig />,
  //   perm: [],
  // },
  {
    path: "/attendanceconfig",
    component: <AttendanceConfig />,
    perm: [ATTENDANCE_CONFIGURATION_VIEW_ACCESS_KEY],
  },
  {
    path: "/attendancereport",
    component: <AttendanceReport />,
    perm: [CAN_VIEW_REPORT_ACCESS_KEY],
  },
  {
    path: "/leavereport",
    component: <LeaveReport />,
    perm: [CAN_VIEW_REPORT_ACCESS_KEY],
  },
  {
    path: "/breakreport",
    component: <BreakReport />,
    perm: [CAN_VIEW_REPORT_ACCESS_KEY],
  },
  {
    path: "/attendanceapproval",
    component: <AttendanceApproval />,
    perm: [
      VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
      VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
    ],
  },
  {
    path: "/approval",
    component: <ApprovalFilter />,
    perm: [
      VIEW_TEAM_ATTENDANCE_ACCESS_KEY,
      VIEW_HIERARCHY_ATTENDANCE_ACCESS_KEY,
      VIEW_TEAM_ATTENDANCE_APPROVAL_ACCESS_KEY,      
      VIEW_HIERARCHY_ATTENDANCE_APPROVAL_ACCESS_KEY, 
      VIEW_TEAM_LEAVE_APPROVAL_ACCESS_KEY,
      VIEW_HIERARCHY_LEAVE_APPROVAL_ACCESS_KEY,
    ],
  },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
    perm: "all",
  },
  { path: "/status", component: <Status />, perm: "all" },
  { path: "/priorities", component: <Priorities />, perm: "all" },
  { path: "/contact-group", component: <ContactGroup />, perm: "all" },
  { path: "/contacts", component: <Contacts />, perm: "all" },
  {
    path: "/clients",
    component: <Clients />,
    // perm: "all"
    perm: [
      CLIENT_VIEW_ACCESS_KEY,
      CREATE_CLIENT_ACCESS_KEY,
      EDIT_CLIENT_ACCESS_KEY,
    ],
  },
  { path: "/projects", component: <Projects />, perm: "all" },
  { path: "/tasks", component: <TaskTab />,   perm: [CREATE_TASK_ACCESS_KEY, EDIT_TASK_ACCESS_KEY], },
  {
    path: "/task-settings",
    component: <TaskSettingsTab />,
    perm: "all",
  },
  {
    path: "/project-overview/:id",
    component: <ProjectOverviewTab />,
    perm: "all",
  },
  {
    path: "/client-overview/:id",
    component: <ClientOverviewTab />,
    perm: "all",
  },
  {
    path: "/employee-locations",
    component: <AllEmployeeLocation />,
    perm: "all",
  },
  {
    path: "/notifications",
    component: <Notifications />,
    perm: "all",
  },
];

const publicRoutes = [
  { path: "/auth/login", component: <Login /> },
  { path: "/auth/forgot-password", component: <ForgetPassword /> },
  { path: "/auth/register", component: <Register /> },
];

const workSpaceRoutes = [{ path: "/auth/workspace", component: <WorkSpace /> }];

export { defaultRoutes, publicRoutes, privateRoutes, workSpaceRoutes };
