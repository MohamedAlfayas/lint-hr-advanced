import { baseApi } from "../../../shared/api/baseApi";
import { GetLocalStorageData } from "../../../meta/GetLocalStorageData";
import { SetLocalStorage } from "../../../meta/SetLocalStorageData";
import { setHoliday } from "../../../redux/reducers/ChildReducer/HolidayReducer";

const STORAGE_KEY = "holiday";
const GLOBAL_META_URL = "/api/get/global-meta-data/v2/";

// Leave forms, attendance tables and the holiday calendar still read holidays
// from the global-meta localStorage cache / HolidayReducer, so every change
// made through RTK Query is mirrored there.
const syncLegacyStores = (dispatch, list) => {
  SetLocalStorage(STORAGE_KEY, list, 1);
  dispatch(setHoliday(list));
};

const currentList = () => GetLocalStorageData(STORAGE_KEY) || [];

export const holidaysApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // There is no dedicated list endpoint: holidays ship with the global meta
    // payload loaded at login. Serve that cache, and hit the API on first load
    // or when the user explicitly refetches.
    getHolidays: build.query({
      async queryFn(_arg, api, _extra, baseQuery) {
        const cached = GetLocalStorageData(STORAGE_KEY);
        if (!api.forced && Array.isArray(cached)) return { data: cached };

        const res = await baseQuery({ url: GLOBAL_META_URL });
        if (res.error) return { error: res.error };

        const list = res.data?.[STORAGE_KEY] || [];
        syncLegacyStores(api.dispatch, list);
        return { data: list };
      },
      providesTags: ["Holiday"],
    }),

    // Create and update share one endpoint; `id: 0` creates.
    saveHoliday: build.mutation({
      query: (body) => ({ url: "holiday/create/", method: "POST", body }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        let saved;
        try {
          ({ data: { data: saved } = {} } = await queryFulfilled);
        } catch {
          return;
        }
        if (!saved) return;

        const list = currentList();
        const exists = list.some((h) => h.id === saved.id);
        const next = exists
          ? list.map((h) => (h.id === saved.id ? saved : h))
          : [...list, saved];

        syncLegacyStores(dispatch, next);
        dispatch(holidaysApi.util.updateQueryData("getHolidays", undefined, () => next));
      },
    }),

    deleteHoliday: build.mutation({
      query: (id) => ({ url: `holiday/delete/${id}`, method: "DELETE" }),
      // Optimistic: remove immediately, roll back if the request fails.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const previous = currentList();
        const next = previous.filter((h) => Number(h.id) !== Number(id));

        syncLegacyStores(dispatch, next);
        const patch = dispatch(
          holidaysApi.util.updateQueryData("getHolidays", undefined, () => next),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
          syncLegacyStores(dispatch, previous);
        }
      },
    }),
  }),
});

export const {
  useGetHolidaysQuery,
  useSaveHolidayMutation,
  useDeleteHolidayMutation,
} = holidaysApi;
