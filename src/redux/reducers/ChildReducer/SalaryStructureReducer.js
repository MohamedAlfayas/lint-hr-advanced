import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salary_structures: [],        // full list
  salary_structure_single: null // selected / view / edit
};

const SalaryStructureReducer = createSlice({
  name: "SalaryStructureReducer",
  initialState,
  reducers: {

    // ─── Set Full List ─────────────────────────────
    setSalaryStructures: (state, action) => {
      state.salary_structures = action.payload;
    },

    // ─── Add New Structure ─────────────────────────
    addSalaryStructure: (state, action) => {
      state.salary_structures.push(action.payload);
    },

    // ─── Edit / Update Structure ───────────────────
    editSalaryStructure: (state, action) => {
      state.salary_structures = state.salary_structures.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

    // ─── Delete Structure ──────────────────────────
    deleteSalaryStructure: (state, action) => {
      state.salary_structures = state.salary_structures.filter(
        (item) => item.id !== action.payload
      );
    },

    // ─── Set Single Structure (view/edit) ──────────
    setSalaryStructureSingle: (state, action) => {
      state.salary_structure_single = action.payload;
    },

    // ─── Reset (optional but useful) ───────────────
    resetSalaryStructure: (state) => {
      state.salary_structure_single = null;
    },
  },
});

export const {
  setSalaryStructures,
  addSalaryStructure,
  editSalaryStructure,
  deleteSalaryStructure,
  setSalaryStructureSingle,
  resetSalaryStructure,
} = SalaryStructureReducer.actions;

export default SalaryStructureReducer.reducer;