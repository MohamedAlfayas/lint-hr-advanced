import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    team_todays_attendance: []
}

export const TeamTodaysAttendanceReducer = createSlice({
    name: 'TeamTodaysAttendanceReducer',
    initialState,
    reducers: {
        setTeamTodaysAttendanceData: (state, { type, payload }) => {
            return {
                ...state,
                team_todays_attendance: payload
            }
        }
    }
});


export const { setTeamTodaysAttendanceData } = TeamTodaysAttendanceReducer.actions;
export default TeamTodaysAttendanceReducer.reducer;