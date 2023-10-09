import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    work_schedule_data : []
}

const WorkScheduleReducer = createSlice({
    name : 'WorkScheduleReducer',
    initialState,
    reducers : {
        setWorkSchedule : (state, {type, payload}) =>{
            return {
                ...state,
                work_schedule_data : payload
            }
        },
        addWorkSchedule : (state, action) =>{
            return {
                ...state,
                work_schedule_data : [...state.work_schedule_data, action.payload]
            }
        },
        editWorkSchedule : (state, action) =>{
            return {
                ...state,
                work_schedule_data : [...state.work_schedule_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});

export const { setWorkSchedule, addWorkSchedule, editWorkSchedule } = WorkScheduleReducer.actions;
export default WorkScheduleReducer.reducer;
