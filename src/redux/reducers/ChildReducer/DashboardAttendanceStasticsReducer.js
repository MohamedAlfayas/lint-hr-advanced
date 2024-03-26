import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dashboard_attendance_stastics_type: "All",
};

const DashboardAttendanceStasticsReducer = createSlice({
  name: "DashboardAttendanceStasticsReducer",
  initialState,
  reducers: {
    setDashboardAttendanceStasticsType: (state, { type, payload }) => {
      return {
        ...state,
        dashboard_attendance_stastics_type: payload,
      };
    },
  },
});

export const { setDashboardAttendanceStasticsType } =
  DashboardAttendanceStasticsReducer.actions;

export default DashboardAttendanceStasticsReducer.reducer;
