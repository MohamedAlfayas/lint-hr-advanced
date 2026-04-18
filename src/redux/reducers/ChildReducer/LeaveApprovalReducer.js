import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leave_approval_data: [],
};

const LeaveApprovalReducer = createSlice({
  name: "LeaveApprovalReducer",
  initialState: initialState,
  reducers: {
    setLeaveApproval: (state, action) => {
      return {
        ...state,
        leave_approval_data: action.payload,
      };
    },
    editLeaveApproval: (state, { type, payload }) => {
      return {
        ...state,
        leave_approval_data: [...state.leave_approval_data].map((d) => {
          if ((payload?.leave_application_id_list).includes(d.id)) {
            if (d.status == 4) {
              let res = {
                ...d,
                is_deleted: true,
                leave_cancellation_details: {
                  status: payload?.status,
                },
              };
              if (payload?.status == 3) {
                res["status"] = 2;
              }
              return res;
            } else {
              return {
                ...d,
                status: payload?.status,
              };
            }
          } else {
            return d;
          }
        }),
      };
    },
  },
});

export const { setLeaveApproval, addLeaveApproval, editLeaveApproval } =
  LeaveApprovalReducer.actions;

export default LeaveApprovalReducer.reducer;
