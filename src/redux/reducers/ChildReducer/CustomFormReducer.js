import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  custom_form_data: [],
};

const CustomForm = createSlice({
  name: "CustomFormReducer",
  initialState,
  reducers: {
    setCustomForm: (state, { payload }) => {
      return {
        ...state,
        custom_form_data: payload,
      };
    },
    addCustomForm: (state, action) => {
      return {
        ...state,
        custom_form_data: [...state.custom_form_data, action.payload],
      };
    },
    editCustomForm: (state, action) => {
      return {
        ...state,
        custom_form_data: [...state.custom_form_data].map((obj) =>
          obj.id === action.payload.id ? action.payload : obj,
        ),
      };
    },
    deleteCustomForm: (state, action) => {
      return {
        ...state,
        custom_form_data: [...state.custom_form_data].filter(
          (obj) => obj.id !== action.payload,
        ),
      };
    },
  },
});

export const {
  setCustomForm,
  addCustomForm,
  editCustomForm,
  deleteCustomForm,
} = CustomForm.actions;

export default CustomForm.reducer;
