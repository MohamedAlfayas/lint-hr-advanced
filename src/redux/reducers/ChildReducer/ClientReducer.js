import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  client_data: [],
};

const ClientReducer = createSlice({
  name: "ClientReducer",
  initialState,
  reducers: {
    setClients: (state, { payload }) => {
      state.client_data = payload ?? [];
    },

    addClient: (state, { payload }) => {
      state.client_data.push(payload);
    },

    editClient: (state, { payload }) => {
      const index = state.client_data.findIndex((obj) => obj.id === payload.id);
      if (index !== -1) {
        state.client_data[index] = payload; // ✅ direct mutation — RTK handles immutability via Immer
      }
    },
  },
});

export const { setClients, addClient, editClient } = ClientReducer.actions;

export default ClientReducer.reducer;
