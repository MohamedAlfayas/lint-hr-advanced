import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recurring_data: [],
  recurring_single: null,
};

const RecurringReducer = createSlice({
  name: "RecurringReducer",
  initialState,
  reducers: {
    // ─── Set Full List ─────────────────────────────
    setRecurring: (state, action) => {
      state.recurring_data = action.payload;
    },

    // ─── Add New Component ─────────────────────────
    addRecurring: (state, action) => {
      state.recurring_data.push(action.payload);
    },

    // ─── Edit Component ────────────────────────────
    editRecurring: (state, action) => {
      state.recurring_data = state.recurring_data.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

    // ─── Delete Component ──────────────────────────
    deleteRecurring: (state, action) => {
      state.recurring_data = state.recurring_data.filter(
        (item) => item.id !== action.payload
      );
    },

    // ─── Set Single (for edit/view) ────────────────
    setRecurringSingle: (state, action) => {
      state.recurring_single = action.payload;
    },
  },
});

export const {
  setRecurring,
  addRecurring,
  editRecurring,
  deleteRecurring,
  setRecurringSingle,
} = RecurringReducer.actions;

export default RecurringReducer.reducer;