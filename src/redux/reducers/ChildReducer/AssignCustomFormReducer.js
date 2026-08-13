import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mapping_data: [],
};

const AssignCustomFormReducer = createSlice({
  name: "AssignCustomFormReducer",
  initialState,
  reducers: {
    setMapping: (state, { payload }) => {
      return {
        ...state,
        mapping_data: payload,
      };
    },
    addMapping: (state, action) => {
      return {
        ...state,
        mapping_data: [...state.mapping_data, action.payload],
      };
    },
    editMapping: (state, action) => {
      return {
        ...state,
        mapping_data: [...state.mapping_data].map((obj) =>
          Number(obj.id) === Number(action.payload.id) ? action.payload : obj,
        ),
      };
    },
  },
});

export const { setMapping, addMapping, editMapping } =
  AssignCustomFormReducer.actions;

export default AssignCustomFormReducer.reducer;
