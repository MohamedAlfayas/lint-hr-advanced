import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  account_settings_data: {},
};

export const AccountSettingsReducer = createSlice({
  name: "AccountSettingReducer",
  initialState,
  reducers: {
    setEmployeeAccountSettingsData: (state, { type, payload }) => {
      console.log("PAYLOAD === ", payload);
      return {
        ...state,
        account_settings_data: payload,
      };
    },
  },
});

export const { setEmployeeAccountSettingsData } =
  AccountSettingsReducer.actions;
export default AccountSettingsReducer.reducer;
