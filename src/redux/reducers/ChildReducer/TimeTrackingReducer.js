import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employee_total_work_duration: {},
};

export const TimeTrackingReducer = createSlice({
  name: "TimeTrackingReducer",
  initialState,
  reducers: {
    setTotalWorkDuration: (state, { type, payload }) => {
      return {
        ...state,
        employee_total_work_duration: payload,
      };
    },
  },
});

export const { setTotalWorkDuration } = TimeTrackingReducer.actions;
export default TimeTrackingReducer.reducer;
