import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    leave_type_data : []
}

const LeaveTypeReducer = createSlice({
    name : 'LeaveTypeReducer',
    initialState,
    reducers : {
        setLeaveType : (state , { type , payload }) =>{
            return {
                ...state,
                leave_type_data : payload
            }
        },
        addLeaveType : (state, action) =>{
            return {
                ...state,
                leave_type_data : [...state.leave_type_data, action.payload]
            }
        },
        editLeaveType : (state, action) =>{
            return {
                ...state,
                leave_type_data : [...state.leave_type_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});

export const { setLeaveType, addLeaveType, editLeaveType } = LeaveTypeReducer.actions;

export default LeaveTypeReducer.reducer