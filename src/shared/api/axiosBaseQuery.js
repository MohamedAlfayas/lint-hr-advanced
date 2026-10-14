import { Api } from "../../common/api/Api";

/**
 * RTK Query base query backed by the shared axios instance, so every endpoint
 * gets the dynamic per-workspace base URL, Bearer token and token-refresh
 * interceptors defined in `common/api/Api.js`.
 */
export const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", body, params, headers, isMultipart }) => {
    try {
      const result = await Api({
        url,
        method,
        data: body,
        params,
        headers: isMultipart
          ? { ...headers, "Content-Type": "multipart/form-data" }
          : headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError?.response?.status ?? "FETCH_ERROR",
          data: axiosError?.response?.data ?? axiosError?.message,
        },
      };
    }
  };

export const getApiErrorMessage = (error, fallback = "Something went wrong") =>
  error?.data?.message || error?.data?.detail || error?.error || fallback;
