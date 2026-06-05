import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  folder_data: {
    allFolders: [],
    rootFiles: [],
  },
  folder_loading: false,
  folder_action_loading: false,
  folder_error: null,
  folder_success: null,
};

export const FolderReducer = createSlice({
  name: "FolderReducer",
  initialState,
  reducers: {
    // ── Folder / project data ─────────────────────────────────────────────
    setFolderData: (state, { payload }) => {
      state.folder_data = payload;
    },

    // ── Root-level file actions ───────────────────────────────────────────

    /** Append one or more newly-uploaded files to rootFiles */
    addRootFiles: (state, { payload }) => {
      // payload: single file object OR array of file objects
      const incoming = Array.isArray(payload) ? payload : [payload];
      state.folder_data.rootFiles = [
        ...state.folder_data.rootFiles,
        ...incoming,
      ];
    },

    /** Remove a file from rootFiles by id */
    removeRootFile: (state, { payload }) => {
      // payload: file id (number)
      state.folder_data.rootFiles = state.folder_data.rootFiles.filter(
        (f) => f.id !== payload,
      );
    },

    // ── Loading flags ─────────────────────────────────────────────────────
    setFolderLoading: (state, { payload }) => {
      state.folder_loading = payload;
    },
    setFolderActionLoading: (state, { payload }) => {
      state.folder_action_loading = payload;
    },

    // ── Flash messages ────────────────────────────────────────────────────
    setFolderError: (state, { payload }) => {
      state.folder_error = payload;
    },
    setFolderSuccess: (state, { payload }) => {
      state.folder_success = payload;
    },
    clearFolderMessages: (state) => {
      state.folder_error = null;
      state.folder_success = null;
    },
  },
});

export const {
  setFolderData,
  addRootFiles,
  removeRootFile,
  setFolderLoading,
  setFolderActionLoading,
  setFolderError,
  setFolderSuccess,
  clearFolderMessages,
} = FolderReducer.actions;

export default FolderReducer.reducer;
