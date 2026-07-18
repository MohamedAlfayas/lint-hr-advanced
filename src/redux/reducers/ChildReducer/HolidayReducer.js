import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  holiday_data: [],
};

const HolidayReducer = createSlice({
  name: "HolidayReducer",
  initialState: initialState,
  reducers: {
    setHoliday: (state, action) => {
      return {
        ...state,
        holiday_data: action.payload,
      };
    },
    addHoliday: (state, action) => {
      return {
        ...state,
        holiday_data: [...state.holiday_data, action.payload],
      };
    },
    editHoliday: (state, action) => {
      return {
        ...state,
        holiday_data: [...state.holiday_data].map((obj) =>
          obj.id === action.payload.id ? action.payload : obj,
        ),
      };
    },
    removeHoliday: (state, action) => {
      console.log("Remove Holiday - ", action.payload);
      return {
        ...state,
        holiday_data: state.holiday_data.filter(
          (obj) => obj.id !== action.payload,
        ),
      };
    },
  },
});

export const { setHoliday, addHoliday, editHoliday, removeHoliday } =
  HolidayReducer.actions;

export default HolidayReducer.reducer;
