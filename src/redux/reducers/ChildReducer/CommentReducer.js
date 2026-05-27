import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comment_data: [],
};

const CommentReducer = createSlice({
  name: "CommentReducer",
  initialState,

  reducers: {
    // =========================
    // SET COMMENTS (seed from API)
    // =========================
    setComments: (state, { payload }) => {
      state.comment_data = payload ?? [];
    },

    // =========================
    // ADD COMMENT
    // =========================
    addComment: (state, { payload }) => {
      state.comment_data.push(payload);
    },

    // =========================
    // DELETE COMMENT by ID
    // ✅ payload = id (number/string)
    // =========================
    deleteComment: (state, { payload }) => {
      state.comment_data = state.comment_data.filter(
        (obj) => obj.id !== payload,
      );
    },
  },
});

export const { setComments, addComment, deleteComment } =
  CommentReducer.actions;

export default CommentReducer.reducer;
