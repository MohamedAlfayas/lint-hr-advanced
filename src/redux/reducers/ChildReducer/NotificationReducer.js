import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unread_count: 0,
};

const NotificationReducer = createSlice({
  name: "NotificationReducer",
  initialState,
  reducers: {
    setUnreadCount: (state, { payload }) => {
      return {
        ...state,
        unread_count: Math.max(0, Number(payload) || 0),
      };
    },
    decrementUnreadCount: (state, { payload }) => {
      return {
        ...state,
        unread_count: Math.max(0, state.unread_count - (Number(payload) || 1)),
      };
    },
  },
});

export const { setUnreadCount, decrementUnreadCount } =
  NotificationReducer.actions;

export default NotificationReducer.reducer;
