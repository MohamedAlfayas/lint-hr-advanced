import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  individual_attendance_report_data: [],
  team_attendance_report_data: [],
  showTeamTable: false,
  chartData: {
    categories: [],
    series: [],
  },
  chartInfo: {
    wsHours: 0,
    checkInHours: 0,
    otHours: 0,
    paidHours: 0,
    leaveHours: 0,
    balanceHours: 0,
  },
  attendanceSummary: null,
  attendanceMonth: null,
  // Bumped by the table's refresh button; the page that owns the filters refetches.
  attendanceRefreshTick: 0,
  // Attendance overview data is being (re)loaded; the page shows skeletons below the filter.
  attendanceLoading: false,
  attendance_pagination: {
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  },
};

const AttendanceReportReducer = createSlice({
  name: "AttendanceReportReducer",
  initialState,
  reducers: {
    setIndividualAttendanceReportData: (state, { type, payload }) => {
      return {
        ...state,
        individual_attendance_report_data: payload,
      };
    },
    updateIndividualAttendanceReportData: (state, { type, payload }) => {
      return {
        ...state,
        individual_attendance_report_data: [
          ...state?.individual_attendance_report_data,
        ].map((d) => {
          if (d.id === payload.id) {
            return payload;
          } else {
            return d;
          }
        }),
      };
    },
    setTeamAttendanceReportData: (state, { type, payload }) => {
      return {
        ...state,
        team_attendance_report_data: payload,
      };
    },
    setShowTeamTable: (state, { type, payload }) => {
      return {
        ...state,
        showTeamTable: payload,
      };
    },
    setAttendanceReportChartData: (state, { type, payload }) => {
      return {
        ...state,
        chartData: payload,
      };
    },
    setAttendanceReportChartInfo: (state, { type, payload }) => {
      return {
        ...state,
        chartInfo: payload,
      };
    },
    resetAttendanceReportChart: (state, { type, payload }) => {
      return {
        ...state,
        chartData: {
          categories: [],
          series: [],
        },
        chartInfo: {
          wsHours: 0,
          checkInHours: 0,
          otHours: 0,
          paidHours: 0,
          leaveHours: 0,
          balanceHours: 0,
        },
      };
    },
    setAttendanceSummary: (state, { type, payload }) => {
      return {
        ...state,
        attendanceSummary: payload || null,
      };
    },
    // "YYYY-MM" selected in the attendance filter
    setAttendanceMonth: (state, { type, payload }) => {
      return {
        ...state,
        attendanceMonth: payload || null,
      };
    },
    // Merge-update: pass any of { count, page, page_size, total_pages }
    setAttendancePagination: (state, { type, payload }) => {
      return {
        ...state,
        attendance_pagination: {
          ...state.attendance_pagination,
          ...payload,
        },
      };
    },
    setAttendanceLoading: (state, { payload }) => {
      return {
        ...state,
        attendanceLoading: !!payload,
      };
    },
    requestAttendanceRefresh: (state) => {
      return {
        ...state,
        attendanceRefreshTick: (state.attendanceRefreshTick || 0) + 1,
      };
    },
  },
});

export const {
  requestAttendanceRefresh,
  setIndividualAttendanceReportData,
  updateIndividualAttendanceReportData,
  setTeamAttendanceReportData,
  setShowTeamTable,
  setAttendanceReportChartData,
  setAttendanceReportChartInfo,
  resetAttendanceReportChart,
  setAttendanceSummary,
  setAttendanceMonth,
  setAttendancePagination,
  setAttendanceLoading,
} = AttendanceReportReducer.actions;

export default AttendanceReportReducer.reducer;
