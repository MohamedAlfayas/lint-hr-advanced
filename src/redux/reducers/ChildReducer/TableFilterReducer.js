import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  employee_table_filter_keys: {
    primary_department_id_list: 0,
    role_id: 0,
    reporting_manager_id: 0,
  },
  leave_type_table_filter_keys: {
    unit: 0,
  },
  leave_approval_table_filter_keys: {
    status: 0,
  },
  attendance_approval_table_filter_keys: {
    primary_department_id_list: 0,
  },
};

const TableFilterReducer = createSlice({
  name: "TableFilterReducer",
  initialState,
  reducers: {
    setTableFilterSearchText: (state, { type, payload }) => {
      return {
        ...state,
        search: payload,
      };
    },
    setEmployeeTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        employee_table_filter_keys: payload,
      };
    },
    resetEmployeeTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        employee_table_filter_keys: initialState?.employee_table_filter_keys,
        search: "",
      };
    },
    setLeaveTypeTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        leave_type_table_filter_keys: payload,
      };
    },
    resetLeaveTypeTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        leave_type_table_filter_keys:
          initialState?.leave_type_table_filter_keys,
        search: "",
      };
    },
    setLeaveApprovalTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        leave_approval_table_filter_keys: payload,
      };
    },
    setAttendanceApprovalTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        attendance_approval_table_filter_keys: payload,
      };
    },
    resetAttednanceApprovalTableFilterKeys: (state, { type, payload }) => {
      return {
        ...state,
        attendance_approval_table_filter_keys:
          initialState?.attendance_approval_table_filter_keys,
      };
    },
  },
});

export const {
  setTableFilterSearchText,
  setEmployeeTableFilterKeys,
  resetEmployeeTableFilterKeys,
  setLeaveTypeTableFilterKeys,
  resetLeaveTypeTableFilterKeys,
  setLeaveApprovalTableFilterKeys,
  setAttendanceApprovalTableFilterKeys,
  resetAttednanceApprovalTableFilterKeys,
} = TableFilterReducer.actions;
export default TableFilterReducer.reducer;
