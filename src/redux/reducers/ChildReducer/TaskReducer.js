import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [], // ← unified key used by both TaskKanban and TaskListForm
};

const TaskReducer = createSlice({
  name: "TaskReducer",
  initialState,
  reducers: {
    setTasks: (state, { payload }) => {
      state.tasks = payload ?? [];
    },

    addTask: (state, { payload }) => {
      state.tasks.push(payload);
    },

    editTask: (state, { payload }) => {
      const index = state.tasks.findIndex((obj) => obj.id === payload.id);
      if (index !== -1) {
        state.tasks[index] = payload;
      }
    },

    removeTask: (state, { payload }) => {
      state.tasks = state.tasks.filter((obj) => obj.id !== payload);
    },
  },
});

export const { setTasks, addTask, editTask, removeTask } = TaskReducer.actions;

export default TaskReducer.reducer;
