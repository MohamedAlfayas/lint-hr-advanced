import { createSlice } from "@reduxjs/toolkit"
import { t } from "i18next";

const initialState = {
    total_seconds: 0,
    currently_checked_in: false,
    show_attendance_timer:true
}


export const ClockReducer = createSlice({
    name: 'ClockReducer',
    initialState,
    reducers: {
        setTimer: (state, { type, payload }) => {
            return {
                ...state,
                total_seconds: payload.total_seconds,
                currently_checked_in: payload.currently_checked_in
            }
        },
        setShowAttendanceTimer: (state, { payload }) => {
            state.show_attendance_timer = payload; 
        }
    }
});

export const { setTimer, setShowAttendanceTimer } = ClockReducer.actions;
export default ClockReducer.reducer;