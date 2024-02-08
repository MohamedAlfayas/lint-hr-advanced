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
    updateAttendanceApprovalData: (state, { type, payload }) => {
      return {
        ...state,
        attendance_approval_data: [...state?.attendance_approval_data].map(
          (d) => {
            if (d.id == payload.id) {
              return payload;
            } else {
              return d;
            }
          }
        ),
      };
    },
  },
});

export const { setAttendanceApprovalData, updateAttendanceApprovalData } =
  AttendanceApprovalReducer.actions;
export default AttendanceApprovalReducer.reducer;
