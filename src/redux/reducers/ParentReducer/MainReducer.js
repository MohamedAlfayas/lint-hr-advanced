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
})