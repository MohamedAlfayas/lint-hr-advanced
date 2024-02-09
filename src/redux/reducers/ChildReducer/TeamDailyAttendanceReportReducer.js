import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    team_daily_attendance_report: []
}


const TeamDailyAttendanceReportReducer = createSlice({
    name: "TeamDailyAttendanceReportReducer",
    initialState,
    reducers: {
        setTeamDailyAttendanceReport: (state, { type, payload }) => {
            return {
                ...state,
                team_daily_attendance_report: payload
            }
        }
    }
});


export const { setTeamDailyAttendanceReport } = TeamDailyAttendanceReportReducer.actions;
export default TeamDailyAttendanceReportReducer.reducer;