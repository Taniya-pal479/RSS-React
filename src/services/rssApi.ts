import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Category,
  SubCategory,
  CreateCategoryPayload,
  CreateSubCategoryPayload,
  ContentTypeMapped,
  CreateContentTypePayload,
  FileObject,
} from "../types";
import type { RootState } from "../store/store";

export const rssApi = createApi({
  reducerPath: "rssApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://rss-server-7wyx.onrender.com/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category", "SubCategory", "Files", "ContentType"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getCategories: builder.query<Category[], string>({
      query: (lang) => `/categories?lang=${lang}`,
      providesTags: ["Category"],
    }),

    getSubCategories: builder.query<
      SubCategory[],
      { categoryId: number | string; lang: string }
    >({
      query: ({ categoryId, lang }) =>
        `/subcategories/category/${categoryId}?lang=${lang}`,
      providesTags: (result, error, arg) => [
        { type: "SubCategory", id: arg.categoryId },
      ],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    addCategory: builder.mutation<Category, CreateCategoryPayload>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    addSubCategory: builder.mutation<SubCategory, CreateSubCategoryPayload>({
      query: (body) => ({
        url: "/subcategories",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        "Category",
        { type: "SubCategory", id: arg.categoryId },
      ],
    }),

    deleteSubCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `subcategories/${id}`, method: "DELETE" }),
      invalidatesTags: ["SubCategory"],
    }),

    updateCategory: builder.mutation<
      void,
      { id: string; body: CreateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateSubCategory: builder.mutation<
      void,
      { id: string; body: CreateSubCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/subcategories/${id}`,
        method: "PATCH",
        body,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      invalidatesTags: (result, error, arg) => ["SubCategory", "Category"],
    }),

    addContentType: builder.mutation<
      ContentTypeMapped,
      CreateContentTypePayload
    >({
      query: (body) => ({
        url: "/content-types",
        method: "POST",
        body,
      }),

      invalidatesTags: (result, error, arg) => [
        { type: "ContentType" as const, id: arg.categoryId },
      ],
    }),

    getContentTypes: builder.query<
      ContentTypeMapped[],
      { categoryId: string | number; lang: string }
    >({
      query: ({ categoryId, lang }) =>
        `/content-types?categoryId=${categoryId}&lang=${lang}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ContentType" as const, id })),
              { type: "ContentType", id: "LIST" },
            ]
          : [{ type: "ContentType", id: "LIST" }],

      transformResponse: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response: any[],
      ): ContentTypeMapped[] => {
        if (!Array.isArray(response)) return [];
        return response.map((item) => ({
          id: item.id,
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          year: item.contentYear,
          status: item.status,
          translations: item.translations,
          category: item.category,
        }));
      },
    }),

    updateContentType: builder.mutation<
      void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { id: string | number; body: any }
    >({
      query: ({ id, body }) => ({
        url: `/content-types/${id}`,
        method: "PATCH",
        body: body,
      }),

      invalidatesTags: (result, error, { id }) => [
        { type: "ContentType", id },
        { type: "ContentType", id: "LIST" },
      ],
    }),
    deleteContentType: builder.mutation<
      { success: boolean },
      { id: number; categoryId: number | string }
    >({
      query: ({ id }) => ({
        url: `/content-types/${Number(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContentType", id: arg.categoryId },
      ],
    }),

    uploadFile: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: "/ingestion",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Files", id: "LIST" }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFiles: builder.query<any[], string | number>({
      query: (contentTypeId) => `/files/content-types/${contentTypeId}`,
      providesTags: (result, error, arg) => [
        { type: "Files", id: arg },
        { type: "Files", id: "LIST" },
      ],
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAllFiles: builder.query<FileObject[], void>({
      query: () => "/files",

      transformResponse: (response: { files: FileObject[]; total: number }) => {
        return response.files || [];
      },

      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: "Files" as const, id })),
              { type: "Files", id: "LIST" },
            ]
          : [{ type: "Files", id: "LIST" }],
    }),
    deleteFile: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useAddCategoryMutation,
  useAddSubCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteSubCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateSubCategoryMutation,
  useGetContentTypesQuery,
  useUploadFileMutation,
  useDeleteContentTypeMutation,
  useAddContentTypeMutation,
  useUpdateContentTypeMutation,
  useGetFilesQuery,
  useDeleteFileMutation,
  useGetAllFilesQuery,
} = rssApi;
