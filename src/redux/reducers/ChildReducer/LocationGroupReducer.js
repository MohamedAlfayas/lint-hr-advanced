import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  location_group_data: [],
};

const LocationGroupReducer = createSlice({
  name: "LocationGroupReducer",
  initialState,
  reducers: {

    setLocationGroup: (state, action) => {
      state.location_group_data = action.payload;
    },

    addLocationGroup: (state, action) => {
      state.location_group_data.push(action.payload);
    },

    editLocationGroup: (state, action) => {
      state.location_group_data = state.location_group_data.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

    deleteLocationGroup: (state, action) => {
      state.location_group_data = state.location_group_data.filter(
        (item) => item.id !== action.payload
      );
    },

    // ── Add a new entity location into the matching group ──────────────────
    addEntityLocation: (state, action) => {
      const { group_id, ...location } = action.payload;
      const group = state.location_group_data.find((g) => g.id === group_id);
      if (group) {
        if (!group.entity_location_details) group.entity_location_details = [];
        group.entity_location_details.push(location);
      }
    },

    // ── Replace an existing entity location inside the matching group ──────
    editEntityLocation: (state, action) => {
      const { group_id, ...location } = action.payload;
      const group = state.location_group_data.find((g) => g.id === group_id);
      if (group && group.entity_location_details) {
        group.entity_location_details = group.entity_location_details.map((loc) =>
          loc.id === location.id ? location : loc
        );
      }
    },

  },
});

export const {
  setLocationGroup,
  addLocationGroup,
  editLocationGroup,
  deleteLocationGroup,
  addEntityLocation,
  editEntityLocation,
} = LocationGroupReducer.actions;

export default LocationGroupReducer.reducer;