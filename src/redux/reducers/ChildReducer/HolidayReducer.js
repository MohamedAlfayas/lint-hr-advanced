import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    'holiday_data' : []
}

const HolidayReducer = createSlice({
    name : 'HolidayReducer',
    initialState : initialState,
    reducers : {
        setHoliday : (state, action) =>{
            return {
                ...state,
                holiday_data : action.payload
            }
        },
        addHoliday : (state, action) =>{
            return {
                ...state,
                holiday_data : [...state.holiday_data, action.payload]
            }
        },
        editHoliday : (state, action) =>{
            return {
                ...state,
                holiday_data : [...state.holiday_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const { setHoliday, addHoliday, editHoliday } = HolidayReducer.actions;

export default HolidayReducer.reducer;