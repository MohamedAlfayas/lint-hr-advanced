import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    leave_application_data: []
}

const LeaveApplyReducer = createSlice({
    name: 'LeaveApplyReducer',
    initialState,
    reducers: {
        setLeaveApplication: (state, { type, payload }) => {
            return {
                ...state,
                leave_application_data: payload
            }
        },
        addLeaveApplication: (state, action) => {
            return {
                ...state,
                leave_application_data: [...state.leave_application_data, action.payload]
            }
        },
        editLeaveApplication: (state, action) => {
            return {
                ...state,
                leave_application_data: [...state.leave_application_data].map(obj =>
                    obj.id === action.payload.id ? action.payload : obj
                )
            }
        },
     
    }
});

export const {
    setLeaveApplication,
    addLeaveApplication,
    editLeaveApplication,
} = LeaveApplyReducer.actions;

export default LeaveApplyReducer.reducer