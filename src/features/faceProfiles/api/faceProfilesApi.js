import { baseApi } from "../../../shared/api/baseApi";

// Server-side cap per delete request (MAX_FACE_PROFILE_BULK_DELETE).
export const MAX_BULK_DELETE = 100;

export const faceProfilesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFaceProfiles: build.query({
      query: ({ search, page, pageSize }) => ({
        url: "employee/face-profiles/",
        params: {
          ...(search ? { search } : {}),
          page,
          page_size: pageSize,
        },
      }),
      providesTags: ["FaceProfile"],
    }),

    deleteFaceProfiles: build.mutation({
      query: (employeeIds) => ({
        url: "employee/face-profiles/delete/",
        method: "POST",
        body: { employee_ids: employeeIds },
      }),
      invalidatesTags: ["FaceProfile"],
    }),
  }),
});

export const { useGetFaceProfilesQuery, useDeleteFaceProfilesMutation } = faceProfilesApi;
