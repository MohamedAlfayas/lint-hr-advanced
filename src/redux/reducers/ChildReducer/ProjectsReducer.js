import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  project_data: [],
};

const ProjectsReducer = createSlice({
  name: "ProjectsReducer",
  initialState,
  reducers: {
    setProjects: (state, { payload }) => {
      state.project_data = payload ?? [];
    },

    addProject: (state, { payload }) => {
      state.project_data.push(payload);
    },

    editProject: (state, { payload }) => {
      const index = state.project_data.findIndex(
        (obj) => obj.id === payload.id,
      );
      if (index !== -1) {
        state.project_data[index] = payload;
      }
    },
    removeProject: (state, { payload }) => {
      state.project_data = state.project_data.filter(
        (obj) => obj.id !== payload,
      );
    },
  },
});

export const { setProjects, addProject, editProject, removeProject } =
  ProjectsReducer.actions;

export default ProjectsReducer.reducer;
