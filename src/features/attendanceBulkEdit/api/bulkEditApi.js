import { baseApi } from "../../../shared/api/baseApi";

const adminTag = (employeeId, month) => ({ type: "AttendanceBulkEdit", id: `admin-${employeeId}-${month}` });

export const bulkEditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // month: "YYYY-MM"
    getBulkEditMonth: build.query({
      query: (month) => ({
        url: "attendance/bulk-edit/list/",
        params: { thisMonth: month },
      }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (_res, _err, month) => [{ type: "AttendanceBulkEdit", id: month }],
    }),

    // body: { this_month, common_notes, records: [{ id, edited_checked_in_hr_in_seconds, notes }] }
    saveBulkEdit: build.mutation({
      query: (body) => ({ url: "attendance/bulk-edit/", method: "POST", body }),
      invalidatesTags: (_res, _err, body) => [{ type: "AttendanceBulkEdit", id: body.this_month }],
    }),

    // Admin: one employee's month. arg: { employeeId, month: "YYYY-MM" }
    getAdminBulkEditMonth: build.query({
      query: ({ employeeId, month }) => ({
        url: "attendance/admin/bulk-edit/list/",
        params: { thisMonth: month, employee_id: employeeId },
      }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (_res, _err, { employeeId, month }) => [adminTag(employeeId, month)],
    }),

    // Admin edits are approved immediately.
    // body: { employee_id, this_month, common_notes, records: [{ id, edited_checked_in_hr_in_seconds, notes }] }
    saveAdminBulkEdit: build.mutation({
      query: (body) => ({ url: "attendance/admin/bulk-edit/", method: "POST", body }),
      invalidatesTags: (_res, _err, body) => [adminTag(body.employee_id, body.this_month)],
    }),
  }),
});

export const {
  useGetBulkEditMonthQuery,
  useSaveBulkEditMutation,
  useGetAdminBulkEditMonthQuery,
  useSaveAdminBulkEditMutation,
} = bulkEditApi;
