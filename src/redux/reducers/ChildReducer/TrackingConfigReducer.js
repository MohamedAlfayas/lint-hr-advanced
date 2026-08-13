import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tracking_config_data: null,
  loading: false,
  error: null,
};

const TrackingConfigReducer = createSlice({
  name: "TrackingConfigReducer",
  initialState,
  reducers: {
    setTrackingConfig: (state, action) => {
      state.tracking_config_data = action.payload || null;
      state.error = null;
    },
    setTrackingConfigLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setTrackingConfigError: (state, action) => {
      state.error = action.payload || null;
    },
    clearTrackingConfig: (state) => {
      state.tracking_config_data = null;
      state.error = null;
    },
  },
});

export const {
  setTrackingConfig,
  setTrackingConfigLoading,
  setTrackingConfigError,
  clearTrackingConfig,
} = TrackingConfigReducer.actions;

export default TrackingConfigReducer.reducer;
