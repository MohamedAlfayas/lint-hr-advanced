import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  team_todays_attendance: [],
  all_members_todays_attendance: [],
  currently_displaying_todays_attendance: [],
};

export const TeamTodaysAttendanceReducer = createSlice({
  name: "TeamTodaysAttendanceReducer",
  initialState,
  reducers: {
    setTeamTodaysAttendanceData: (state, { type, payload }) => {
      return {
        ...state,
        team_todays_attendance: payload,
      };
    },
    setAllMembersTodaysAttendanceData: (state, { type, payload }) => {
      return {
        ...state,
        all_members_todays_attendance: payload,
      };
    },
    setCurrentlyDisplayingTodaysAttendanceData: (state, { type, payload }) => {
      return {
        ...state,
        currently_displaying_todays_attendance: payload,
      };
    },
    setTeamTodaysAttendanceAsCurrent: (state, { type, payload }) => {
      return {
        ...state,
        currently_displaying_todays_attendance: [
          ...state?.team_todays_attendance,
        ],
      };
    },
    setAllMembersTodaysAttendanceAsCurrent: (state, { type, payload }) => {
      return {
        ...state,
        currently_displaying_todays_attendance: [
          ...state?.all_members_todays_attendance,
        ],
      };
    },
  },
});

export const {
  setTeamTodaysAttendanceData,
  setAllMembersTodaysAttendanceData,
  setCurrentlyDisplayingTodaysAttendanceData,
  setTeamTodaysAttendanceAsCurrent,
  setAllMembersTodaysAttendanceAsCurrent,
} = TeamTodaysAttendanceReducer.actions;
export default TeamTodaysAttendanceReducer.reducer;
