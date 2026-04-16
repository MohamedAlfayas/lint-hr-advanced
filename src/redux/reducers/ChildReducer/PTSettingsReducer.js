import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pt_settings_data: [],
  pt_settings_single: null,
};

const PTSettingsReducer = createSlice({
  name: "PTSettingsReducer",
  initialState,
  reducers: {

    // ─── Set Full List ─────────────────────────────
    setPTSettings: (state, action) => {
      state.pt_settings_data = action.payload;
    },

    // ─── Add New ───────────────────────────────────
    addPTSetting: (state, action) => {
      state.pt_settings_data.push(action.payload);
    },

    // ─── Edit Existing ─────────────────────────────
    editPTSetting: (state, action) => {
      state.pt_settings_data = state.pt_settings_data.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

    // ─── Delete ────────────────────────────────────
    deletePTSetting: (state, action) => {
      state.pt_settings_data = state.pt_settings_data.filter(
        (item) => item.id !== action.payload
      );
    },

    // ─── Set Single (for view/edit) ────────────────
    setPTSettingSingle: (state, action) => {
      state.pt_settings_single = action.payload;
    },
  },
});

export const {
  setPTSettings,
  addPTSetting,
  editPTSetting,
  deletePTSetting,
  setPTSettingSingle,
} = PTSettingsReducer.actions;

export default PTSettingsReducer.reducer;