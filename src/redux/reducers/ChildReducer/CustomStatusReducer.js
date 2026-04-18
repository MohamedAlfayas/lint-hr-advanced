import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  custom_status_data: [],
};

const CustomStatusReducer = createSlice({
  name: "CustomStatusReducer",
  initialState,
  reducers: {
    setCustomStatus: (state, action) => {
      state.custom_status_data = action.payload || [];
    },

    addCustomStatus: (state, action) => {
      state.custom_status_data.push(action.payload); // ✅ direct mutation
    },

    editCustomStatus: (state, action) => {
      const index = state.custom_status_data.findIndex(
        (obj) => obj.id === action.payload.id,
      );

      if (index !== -1) {
        state.custom_status_data[index] = action.payload; // ✅ replace item
      }
    },

    deleteCustomStatus: (state, action) => {
      state.custom_status_data = state.custom_status_data.filter(
        (obj) => obj.id !== action.payload,
      );
    },
  },
});

export const {
  setCustomStatus,
  addCustomStatus,
  editCustomStatus,
  deleteCustomStatus,
} = CustomStatusReducer.actions;

export default CustomStatusReducer.reducer;
