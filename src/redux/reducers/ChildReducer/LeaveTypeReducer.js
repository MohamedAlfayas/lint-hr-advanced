import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    leave_type_data: [],
    leave_type_for_current_employee: []
}

const LeaveTypeReducer = createSlice({
    name: 'LeaveTypeReducer',
    initialState,
    reducers: {
        setLeaveType: (state, { type, payload }) => {
            return {
                ...state,
                leave_type_data: payload
            }
        },
        addLeaveType: (state, action) => {
            return {
                ...state,
                leave_type_data: [...state.leave_type_data, action.payload]
            }
        },
        editLeaveType: (state, action) => {
            return {
                ...state,
                leave_type_data: [...state.leave_type_data].map(obj => obj.id === action.payload.id ? action.payload : obj)
            }
        },
        setLeaveTypeForCurrentEmployee: (state, { type, payload }) => {
            return {
                ...state,
                leave_type_for_current_employee: payload
            }
        }
    }
});

export const { setLeaveType, addLeaveType, editLeaveType, setLeaveTypeForCurrentEmployee } = LeaveTypeReducer.actions;

export default LeaveTypeReducer.reducer