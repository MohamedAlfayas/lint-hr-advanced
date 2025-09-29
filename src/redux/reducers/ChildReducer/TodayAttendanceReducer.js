import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    today_attendance: []
}


const TodayAttendanceReducer = createSlice({
    name: "TodayAttendanceReducer",
    initialState,
    reducers: {
        setTodayAttendance: (state, { type, payload }) => {
            return {
                ...state,
                today_attendance: payload
            }
        }
    }
});


export const { setTodayAttendance } = TodayAttendanceReducer.actions;
export default TodayAttendanceReducer.reducer;