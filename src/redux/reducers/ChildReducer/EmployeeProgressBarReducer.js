import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    today_attendance: []
}


const EmployeeProgressBarReducer = createSlice({
    name: "EmployeeProgressBarReducer",
    initialState,
    reducers: {
        setTodayAttendanceProgressBar: (state, { type, payload }) => {
            return {
                ...state,
                today_attendance: payload
            }
        }
    }
});


export const { setTodayAttendanceProgressBar } = EmployeeProgressBarReducer.actions;
export default EmployeeProgressBarReducer.reducer;