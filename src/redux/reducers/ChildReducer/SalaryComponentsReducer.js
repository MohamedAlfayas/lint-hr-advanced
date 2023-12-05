import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  earnings_data: [],
  allowances_data: [],
  deductions_data: [],
};

const SalaryComponentsReducer = createSlice({
  name: 'salarycomponents',
  initialState: initialState,
  reducers: {
    setEarnings: (state, action) => {
      return {
        ...state,
        earnings_data: action.payload,
      };
    },
    addEarnings: (state, action) => {
      return {
        ...state,
        earnings_data: [...state.earnings_data, action.payload],
      };
    },
    editEarnings: (state, action) => {
      return {
        ...state,
        earnings_data: state.earnings_data.map(obj =>
          obj.id === action.payload.id ? action.payload : obj
        ),
      };
    },
    setAllowances: (state, action) => {
      return {
        ...state,
        allowances_data: action.payload,
      };
    },
    addAllowance: (state, action) => {
      return {
        ...state,
        allowances_data: [...state.allowances_data, action.payload],
      };
    },
    editAllowance: (state, action) => {
      return {
        ...state,
        allowances_data: state.allowances_data.map(obj =>
          obj.id === action.payload.id ? action.payload : obj
        ),
      };
    },
    setDeductions: (state, action) => {
      return {
        ...state,
        deductions_data: action.payload,
      };
    },
    addDeduction: (state, action) => {
      return {
        ...state,
        deductions_data: [...state.deductions_data, action.payload],
      };
    },
    editDeduction: (state, action) => {
      return {
        ...state,
        deductions_data: state.deductions_data.map(obj =>
          obj.id === action.payload.id ? action.payload : obj
        ),
      };
    },
  },
});

export const {
  setEarnings,
  addEarnings,
  editEarnings,
  setAllowances,
  addAllowance,
  editAllowance,
  setDeductions,
  addDeduction,
  editDeduction,
} = SalaryComponentsReducer.actions;

export default SalaryComponentsReducer.reducer;
