import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checklist_data: [],
};

const CheckListReducer = createSlice({
  name: "CheckListReducer",
  initialState,

  reducers: {
    // =========================
    // SET CHECKLIST (seed or reorder)
    // =========================
    setChecklists: (state, { payload }) => {
      state.checklist_data = payload ?? [];
    },

    // =========================
    // ADD CHECKLIST ITEM
    // =========================
    addChecklist: (state, { payload }) => {
      state.checklist_data.push(payload);
    },

    // =========================
    // EDIT / UPDATE CHECKLIST ITEM (toggle)
    // =========================
    editChecklist: (state, { payload }) => {
      const index = state.checklist_data.findIndex(
        (obj) => obj.id === payload.id,
      );

      if (index !== -1) {
        state.checklist_data[index] = payload;
      }
    },

    // =========================
    // DELETE CHECKLIST ITEM by ID
    // ✅ payload = id (number/string)
    // =========================
    deleteChecklist: (state, { payload }) => {
      state.checklist_data = state.checklist_data.filter(
        (obj) => obj.id !== payload,
      );
    },
  },
});

export const { setChecklists, addChecklist, editChecklist, deleteChecklist } =
  CheckListReducer.actions;

export default CheckListReducer.reducer;
