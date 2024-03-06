import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employee_leave_data: [],
};

const EmployeeLeaveReducer = createSlice({
  name: "EmployeeLeaveReducer",
  initialState,
  reducers: {
    setEmployeeLeaveType: (state, { type, payload }) => {
      return {
        ...state,
        employee_leave_data: payload,
      };
    },
  },
});

export const { setEmployeeLeaveType } = EmployeeLeaveReducer.actions;
export default EmployeeLeaveReducer.reducer;
