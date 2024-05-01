import { createSlice } from "@reduxjs/toolkit";

const inttialState = {
  currentApprovalComponent: "",
  dashPendingApprovalCom: "",
  approvalEmployeeTypeFilter: 1,
};

const ApprovalComponentReducer = createSlice({
  name: "ApprovalComponentReducer",
  initialState: inttialState,
  reducers: {
    setCurrentApprovalComponent: (state, { type, payload }) => {
      return {
        ...state,
        currentApprovalComponent: payload,
      };
    },
    setDashPendingApprovalCom: (state, { type, payload }) => {
      return {
        ...state,
        dashPendingApprovalCom: payload,
      };
    },
    setApprovalEmployeeTypeFilter: (state, { type, payload }) => {
      return {
        ...state,
        approvalEmployeeTypeFilter: payload,
      };
    },
  },
});

export const {
  setCurrentApprovalComponent,
  setApprovalEmployeeTypeFilter,
  setDashPendingApprovalCom,
} = ApprovalComponentReducer.actions;
export default ApprovalComponentReducer.reducer;
