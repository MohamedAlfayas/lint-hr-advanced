import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    'leave_approval' : []
}

const LeaveApprovalReducer = createSlice({
    name : 'LeaveApprovalReducer',
    initialState : initialState,
    reducers : {
        setHoliday : (state, action) =>{
            return {
                ...state,
                leave_approval : action.payload
            }
        },
        addLeave : (state, action) =>{
            return {
                ...state,
                leave_data : [...state.leave_data, action.payload]
            }
        },
        editLeave : (state, action) =>{
            return {
                ...state,
                leave_data : [...state.leave_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const { setLeave, addLeave, editLeave } = LeaveApprovalReducer.actions;

export default LeaveApprovalReducer.reducer;