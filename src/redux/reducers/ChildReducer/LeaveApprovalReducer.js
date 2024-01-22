import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    leave_approval_data : []
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
        editLeaveApproval : (state, {type, payload}) =>{
            console.log('edit leav approve payload = ',payload);
            return {
                ...state,
                leave_approval_data : [...state.leave_approval_data].map(d =>{
                    if((payload?.leave_application_id_list).includes(d.id)){
                        return {
                            ...d,
                            status : payload?.status
                        }
                    }
                    else{
                        return d
                    }
                })
            }
        }
    }
});


export const { setLeaveApproval, addLeaveApproval, editLeaveApproval } = LeaveApprovalReducer.actions;

export default LeaveApprovalReducer.reducer;