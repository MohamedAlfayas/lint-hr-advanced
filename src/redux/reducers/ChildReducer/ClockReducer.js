import { createSlice } from "@reduxjs/toolkit"
import { t } from "i18next";

// const initialState = {
//     total_seconds: 0,
//     currently_checked_in: false,
//     show_attendance_timer:true
// }

const initialState = {
  total_seconds: 0,
//   display_seconds: 0,   
  currently_checked_in: false,

  total_break_duration: 0,
  is_on_break: false,
  maximum_break_duration: 3600,
  clock_initialized: false, // ADD THIS
  show_attendance_timer: true,
};
export const ClockReducer = createSlice({
    name: 'ClockReducer',
    initialState,
    reducers: {
        // setTimer: (state, { type, payload }) => {
        //     return {
        //         ...state,
        //         total_seconds: payload.total_seconds,
        //         currently_checked_in: payload.currently_checked_in
        //     }
        // },
        // ---------------------------1stcode-----------------------------------------
        setTimer: (state, { payload }) => {
            state.total_seconds = payload.total_seconds;
            state.currently_checked_in = payload.currently_checked_in;

            if (payload.total_break_duration !== undefined) {
                state.total_break_duration = payload.total_break_duration;
            }

            if (payload.is_on_break !== undefined) {
                state.is_on_break = payload.is_on_break;
            }

            if (payload.maximum_break_duration !== undefined) {
                state.maximum_break_duration =
                payload.maximum_break_duration;
            }
            state.clock_initialized = true; // ADD THIS
            },
        // ---------------------------------------------------------------------------
       
        setShowAttendanceTimer: (state, { payload }) => {
            state.show_attendance_timer = payload; 
        }
    }
});

export const { setTimer, setShowAttendanceTimer } = ClockReducer.actions;
export default ClockReducer.reducer;