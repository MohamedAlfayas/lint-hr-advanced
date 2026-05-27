import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  Priorities_data: [],
};

const PrioritiesReducer = createSlice({
  name: "PrioritiesReducer",
  initialState,
  reducers: {
    setPriorities: (state, { type, payload }) => {
      return {
        ...state,
        Priorities_data: payload,
      };
    },
    addPriorities: (state, action) => {
      return {
        ...state,
        Priorities_data: [...state.Priorities_data, action.payload],
      };
    },
    editPriorities: (state, action) => {
      return {
        ...state,
        Priorities_data: [...state.Priorities_data].map((obj) =>
          obj.id === action.payload.id ? action.payload : obj,
        ),
      };
    },
  },
});

export const { setPriorities, addPriorities, editPriorities } =
  PrioritiesReducer.actions;

export default PrioritiesReducer.reducer;
