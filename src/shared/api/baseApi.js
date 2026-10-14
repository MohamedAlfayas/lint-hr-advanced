import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

/**
 * Single RTK Query API slice for the whole app. Feature modules add their
 * endpoints with `baseApi.injectEndpoints(...)` (see `features/<name>/api`).
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Holiday", "FaceProfile", "AttendanceBulkEdit"],
  endpoints: () => ({}),
});
