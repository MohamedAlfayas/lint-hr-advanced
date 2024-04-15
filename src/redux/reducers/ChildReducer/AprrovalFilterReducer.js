import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredcurrentvalue: {
    filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    employeeType: 1,
  },
  filteredlatestvalue: {
    filteredMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}`,
    employeeType: 1,
  },
};

const ApprovalFilterReducer = createSlice({
  name: "ApprovalFilterReducer",
  initialState: initialState,
  reducers: {
    setFilteredCurrentValue: (state, { type, payload }) => {
      return {
        ...state,
        filteredcurrentvalue: payload,
      };
    },
    setFilteredLatestValue: (state, { type, payload }) => {
      return {
        ...state,
        filteredlatestvalue: payload,
      };
    },
  },
});

export const { setFilteredCurrentValue, setFilteredLatestValue } =
  ApprovalFilterReducer.actions;
export default ApprovalFilterReducer.reducer;
