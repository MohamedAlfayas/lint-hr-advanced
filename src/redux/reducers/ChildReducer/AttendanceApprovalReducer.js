import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  attendance_approval_data: [],
};
const AttendanceApprovalReducer = createSlice({
  name: "AttendanceApprovalReducer",
  initialState: initialState,
  reducers: {
    setAttendanceApprovalData: (state, action) => {
      return {
        ...state,
        attendance_approval_data: action.payload,
      };
    },
  },
});

export const { setAttendanceApprovalData } = AttendanceApprovalReducer.actions;
export default AttendanceApprovalReducer.reducer;
