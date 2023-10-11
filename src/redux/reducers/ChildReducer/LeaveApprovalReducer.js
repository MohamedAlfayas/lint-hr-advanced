import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    'leave_approval_data' : []
}

const LeaveApprovalReducer = createSlice({
    name : 'LeaveApprovalReducer',
    initialState : initialState,
    reducers : {
        setLeaveApproval : (state, action) =>{
            return {
                ...state,
                leave_approval_data : action.payload
            }
        },
        editLeaveApproval : (state, action) =>{
            return {
                ...state,
                leave_approval_data : [...state.leave_approval_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        }
    }
});


export const { setLeaveApproval, addLeaveApproval, editLeaveApproval } = LeaveApprovalReducer.actions;

export default LeaveApprovalReducer.reducer;