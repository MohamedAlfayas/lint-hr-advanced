import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    total_seconds: 0,
    currently_checked_in: false
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
        }
    }
});

export const { setTimer } = ClockReducer.actions;
export default ClockReducer.reducer;