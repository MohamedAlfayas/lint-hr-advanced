import { combineReducers } from "redux";
import EmployeeReducer from "../ChildReducer/EmployeeReducer";
import LayoutReducer from "../ChildReducer/LayoutReducer";
import RightSideBarReducer from "../ChildReducer/RightSideBarReducer";
import RoleReducer from "../ChildReducer/RoleReducer";
import HolidayReducer from "../ChildReducer/HolidayReducer";
import DepartmentReducer from "../ChildReducer/DepartmentReducer";
import LeaveApprovalReducer from "../ChildReducer/LeaveApprovalReducer";
import WorkScheduleReducer from "../ChildReducer/WorkScheduleReducer";
import LeaveTypeReducer from "../ChildReducer/LeaveTypeReducer";
import MetaReducer from "../ChildReducer/MetaReducer";
import LeaveApplyReducer from "../ChildReducer/LeaveApplyReducer";
import CustomFieldReducer from "../ChildReducer/CustomFieldReducer";
import TableReducer from "../ChildReducer/TableReducer";
import LoaderReducer from "../ChildReducer/LoaderReducer";
import SalaryComponentsReducer from "../ChildReducer/SalaryComponentsReducer";
import ClockReducer from "../ChildReducer/ClockReducer";
import AttendanceReportReducer from "../ChildReducer/AttendanceReportReducer";
import BranchReducer from "../ChildReducer/BranchReducer";
import MyProfileReducer from "../ChildReducer/MyProfileReducer";
import TableDataReducer from "../ChildReducer/TableDataReducer";
import TableFilterReducer from "../ChildReducer/TableFilterReducer";
import AttendanceApprovalReducer from "../ChildReducer/AttendanceApprovalReducer";
import TeamDailyAttendanceReportReducer from "../ChildReducer/TeamDailyAttendanceReportReducer";
import TeamTodaysAttendanceReducer from "../ChildReducer/TeamTodaysAttendanceReducer";
import EmployeeLeaveReducer from "../ChildReducer/EmployeeLeaveReducer";
import TimeTrackingReducer from "./../ChildReducer/TimeTrackingReducer";
import CompanyReducer from "../ChildReducer/CompanyReducer";
import AccountSettingsReducer from "../ChildReducer/AccountSettingsReducer";
import DashboardAttendanceStasticsReducer from "../ChildReducer/DashboardAttendanceStasticsReducer";
import ApprovalFilterReducer from "../ChildReducer/AprrovalFilterReducer";
import ApprovalComponentReducer from "../ChildReducer/ApprovalComponentReducer";
import StatusReducer from "../ChildReducer/StatusReducer";
import PrioritiesReducer from "../ChildReducer/PrioritiesReducer";
import ContactGroupReducer from "../ChildReducer/ContactGroupReducer";
import ContactsReducer from "../ChildReducer/ContactsReducer";
import TodayAttendanceReducer from "../ChildReducer/TodayAttendanceReducer";
import EmployeeProgressBarReducer from "../ChildReducer/EmployeeProgressBarReducer";
import RecurringReducer from "../ChildReducer/RecurringReducer";
import PayrollSettingsReducer from "../ChildReducer/PayrollSettingsReducer";
import PTSettingsReducer from "../ChildReducer/PTSettingsReducer";
import SalaryStructureReducer from "../ChildReducer/SalaryStructureReducer";
import LocationGroupReducer from "../ChildReducer/LocationGroupReducer";
import CustomStatusReducer from "../ChildReducer/CustomStatusReducer";
import ClientReducer from "../ChildReducer/ClientReducer";
import ProjectsReducer from "../ChildReducer/ProjectsReducer";
import TaskReducer from "../ChildReducer/TaskReducer";
import CheckListReducer from "../ChildReducer/CheckListReducer";
import CommentReducer from "../ChildReducer/CommentReducer";
import FolderReducer from "../ChildReducer/FolderReducer";
import CustomFormReducer from "../ChildReducer/CustomFormReducer";
import AssignCustomFormReducer from "../ChildReducer/AssignCustomFormReducer";
import TrackingConfigReducer from "../ChildReducer/TrackingConfigReducer";
import NotificationReducer from "../ChildReducer/NotificationReducer";

export const MainReducer = combineReducers({
  MetaReducer: MetaReducer,
  EmployeeReducer: EmployeeReducer,
  LayoutReducer: LayoutReducer,
  RightSideBarReducer: RightSideBarReducer,
  RoleReducer: RoleReducer,
  HolidayReducer: HolidayReducer,
  DepartmentReducer: DepartmentReducer,
  LeaveApprovalReducer: LeaveApprovalReducer,
  WorkScheduleReducer: WorkScheduleReducer,
  LeaveTypeReducer: LeaveTypeReducer,
  LeaveApplyReducer: LeaveApplyReducer,
  CustomFieldReducer: CustomFieldReducer,
  TableReducer: TableReducer,
  LoaderReducer: LoaderReducer,
  SalaryComponentsReducer: SalaryComponentsReducer,
  ClockReducer: ClockReducer,
  AttendanceReportReducer: AttendanceReportReducer,
  BranchReducer: BranchReducer,
  MyProfileReducer: MyProfileReducer,
  TableDataReducer: TableDataReducer,
  TableFilterReducer: TableFilterReducer,
  AttendanceApprovalReducer: AttendanceApprovalReducer,
  TeamDailyAttendanceReportReducer: TeamDailyAttendanceReportReducer,
  TeamTodaysAttendanceReducer: TeamTodaysAttendanceReducer,
  EmployeeLeaveReducer: EmployeeLeaveReducer,
  TimeTrackingReducer: TimeTrackingReducer,
  CompanyReducer: CompanyReducer,
  AccountSettingsReducer: AccountSettingsReducer,
  DashboardAttendanceStasticsReducer: DashboardAttendanceStasticsReducer,
  ApprovalFilterReducer: ApprovalFilterReducer,
  ApprovalComponentReducer: ApprovalComponentReducer,
  StatusReducer: StatusReducer,
  PrioritiesReducer: PrioritiesReducer,
  ContactGroupReducer: ContactGroupReducer,
  ContactsReducer: ContactsReducer,
  TodayAttendanceReducer: TodayAttendanceReducer,
  EmployeeProgressBarReducer: EmployeeProgressBarReducer,
  RecurringReducer: RecurringReducer,
  PayrollSettingsReducer: PayrollSettingsReducer,
  PTSettingsReducer: PTSettingsReducer,
  SalaryStructureReducer: SalaryStructureReducer,
  LocationGroupReducer: LocationGroupReducer,
  CustomStatusReducer: CustomStatusReducer,
  ClientReducer: ClientReducer,
  ProjectsReducer: ProjectsReducer,
  TaskReducer: TaskReducer,
  CheckListReducer: CheckListReducer,
  CommentReducer: CommentReducer,
  FolderReducer: FolderReducer,
  CustomFormReducer: CustomFormReducer,
  AssignCustomFormReducer: AssignCustomFormReducer,
  TrackingConfigReducer: TrackingConfigReducer,
  NotificationReducer: NotificationReducer,
});
