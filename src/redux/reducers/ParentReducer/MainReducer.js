import { combineReducers } from "redux";
import EmployeeReducer from "../ChildReducer/EmployeeReducer";
import LayoutReducer from "../ChildReducer/LayoutReducer";
import RightSideBarReducer from "../ChildReducer/RightSideBarReducer";
import RoleReducer from "../ChildReducer/RoleReducer";
import HolidayReducer from "../ChildReducer/HolidayReducer";
import DepartmentReducer from "../ChildReducer/DepartmentReducer";
import LeaveApprovalReducer from "../ChildReducer/LeaveApprovalReducer";
import WorkScheduleReducer from "../ChildReducer/WorkScheduleReducer";

export const MainReducer = combineReducers({
    EmployeeReducer : EmployeeReducer,
    LayoutReducer : LayoutReducer,
    RightSideBarReducer : RightSideBarReducer,
    RoleReducer : RoleReducer,
    HolidayReducer : HolidayReducer,
    DepartmentReducer : DepartmentReducer,
    LeaveApprovalReducer : LeaveApprovalReducer,
    WorkScheduleReducer : WorkScheduleReducer
})