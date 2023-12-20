import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    attendance_report_data: [],
    showTeamTable: false,
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
        },
        setShowTeamTable: (state, { type, payload }) => {
            console.log("TTTTT REDUCER = ", payload);
            return {
                ...state,
                showTeamTable: payload
            }
        },
    }
});


export const { setAttendanceReportData, setShowTeamTable } = AttendanceReportReducer.actions;

export default AttendanceReportReducer.reducer;