import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    individual_attendance_report_data: [],
    team_attendance_report_data: [],
    showTeamTable: false,
}

const AttendanceReportReducer = createSlice({
    name: 'AttendanceReportReducer',
    initialState,
    reducers: {
        setIndividualAttendanceReportData: (state, { type, payload }) => {
            console.log("PAYLOAD ---- = ", payload);
            return {
                ...state,
                individual_attendance_report_data: payload
            }
        },
        updateIndividualAttendanceReportData: (state, { type, payload }) => {
            return {
                ...state,
                individual_attendance_report_data: [...state?.individual_attendance_report_data].map(d => {
                    if (d.id === payload.id) {
                        return payload
                    }
                    else {
                        return d
                    }
                })
            }
        },
        setTeamAttendanceReportData: (state, { type, payload }) => {
            return {
                ...state,
                team_attendance_report_data: payload
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


export const { setIndividualAttendanceReportData, updateIndividualAttendanceReportData, setTeamAttendanceReportData, setShowTeamTable } = AttendanceReportReducer.actions;

export default AttendanceReportReducer.reducer;