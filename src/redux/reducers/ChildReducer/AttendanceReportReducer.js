import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    attendance_report_data: []
}

const AttendanceReportReducer = createSlice({
    name: 'AttendanceReportReducer',
    initialState,
    reducers: {
        setAttendanceReportData: (state, { type, payload }) => {
            console.log("PAYLOAD ---- = ", payload);
            return {
                ...state,
                attendance_report_data: payload
            }
        }
    }
});


export const { setAttendanceReportData } = AttendanceReportReducer.actions;

export default AttendanceReportReducer.reducer;