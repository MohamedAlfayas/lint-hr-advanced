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
    thisMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
  },
  task_list_filter_keys: {
    related_to: "",
    project_id: null,
    client_id: null,
    assigned_to: null,
    collaborator_id: [],
    task_status: null,
    task_priority: null,
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
    setTaskListFilterKeys: (state, { payload }) => {
      state.task_list_filter_keys = payload;
    },
    resetTaskListFilterKeys: (state) => {
      state.task_list_filter_keys = {
        related_to: "",
        project_id: null,
        client_id: null,
        assigned_to: null,
        collaborator_id: [],
        task_status: null,
        task_priority: null,
      };

      state.search = "";
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
  setTaskListFilterKeys,
  resetTaskListFilterKeys,
} = TableFilterReducer.actions;
export default TableFilterReducer.reducer;
