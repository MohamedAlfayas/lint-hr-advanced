import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  payroll_settings: null,     // API full object
  payroll_loading: false,     // optional loader
};

const PayrollSettingsReducer = createSlice({
  name: "PayrollSettingsReducer",
  initialState,
  reducers: {

    // ─── Set Full Payroll Settings ─────────────────
    setPayrollSettings: (state, action) => {
      state.payroll_settings = action.payload;
    },

    // ─── Update Payroll Settings ───────────────────
    updatePayrollSettings: (state, action) => {
      state.payroll_settings = {
        ...state.payroll_settings,
        ...action.payload,
      };
    },

    // ─── Reset Payroll Settings ────────────────────
    resetPayrollSettings: (state) => {
      state.payroll_settings = null;
    },

    // ─── Loader (optional) ─────────────────────────
    setPayrollLoading: (state, action) => {
      state.payroll_loading = action.payload;
    },
  },
});

export const {
  setPayrollSettings,
  updatePayrollSettings,
  resetPayrollSettings,
  setPayrollLoading,
} = PayrollSettingsReducer.actions;

export default PayrollSettingsReducer.reducer;