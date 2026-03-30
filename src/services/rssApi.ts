import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Category,
  SubCategory,
  CreateCategoryPayload,
  CreateSubCategoryPayload,
  ContentTypeMapped,
  CreateContentTypePayload,
  FileObject,
  FilesResponses,
  SearchResponse,
  SubCategoryResponse,
  CategoryResponse,
  AllFilesResponse,
  SubCatFilesResponse,
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

    getCategories: builder.query<
      CategoryResponse,
      { lang: string; skip: number; take: number }
    >({
      query: ({ lang, skip, take }) =>
        `/categories?lang=${lang}&skip=${skip}&take=${take}`,
      providesTags: ["Category"],

      transformResponse: (response: CategoryResponse) => {
        return response;
      },
    }),

    getSubCategories: builder.query<
      SubCategoryResponse,
      { categoryId: number | string; lang: string; skip: number; take: number }
    >({
      query: ({ categoryId, lang, skip, take }) =>
        `/subcategories/category/${Number(categoryId)}?lang=${lang}&skip=${skip}&take=${take}`,
      providesTags: (_result, _error, arg) => [
        { type: "SubCategory", id: arg.categoryId },
      ],
      transformResponse: (response: SubCategoryResponse) => {
        return response;
      },
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
      invalidatesTags: (_result, _error, arg) => [
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
      invalidatesTags: () => ["SubCategory", "Category"],
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

      invalidatesTags: (_result, _error, arg) => [
        { type: "ContentType" as const, id: "LIST" },
        { type: "ContentType" as const, id: arg.categoryId },
      ],
    }),

    getContentTypes: builder.query<
      { data: ContentTypeMapped[]; total: number },
      { lang: string; take?: number; skip?: number; categoryId?: string }
    >({
      query: ({ lang, take, skip }) =>
        `/content-types?lang=${lang}&take=${take}&skip=${skip}`,

      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "ContentType" as const,
                id,
              })),
              { type: "ContentType", id: "LIST" },
            ]
          : [{ type: "ContentType", id: "LIST" }],

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response: {
        data: ContentTypeMapped[];
        total: number;
      }) => {
        return response;
      },
    }),

    updateContentType: builder.mutation<
      void,
      { id: string | number; body: CreateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/content-types/${id}`,
        method: "PATCH",
        body: body,
      }),

      invalidatesTags: (_result, _error, { id }) => [
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
      invalidatesTags: (_result, _error, arg) => [
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

    getFiles: builder.query<
      AllFilesResponse,
      {
        contentTypeId: string | number;
        lang: string;
        take?: number;
        skip?: number;
      }
    >({
      query: ({ contentTypeId, lang, skip, take }) =>
        `/files/content-types/${contentTypeId}?lang=${lang}&skip=${skip}&take=${take}`,

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.contentTypeId}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
          return newItems;
        }
        const existingIds = new Set(currentCache.files.map((item) => item.id));
        const uniqueNewItems = newItems.files.filter(
          (item) => !existingIds.has(item.id),
        );

        currentCache.files.push(...uniqueNewItems);
        currentCache.total = newItems.total;
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },

      providesTags: (_result, _error, arg) => [
        { type: "Files", id: arg.contentTypeId },
        { type: "Files", id: "LIST" },
      ],
    }),

    getAllFiles: builder.query<
      {
        data: FileObject[];
        total: number;
        metadata?: { category: string; subcategory: string };
      },
      {
        contentTypeId?: string | number;
        lang: string;
        skip?: number;
        take?: number;
        sortBy?: string;
        order?: string;
      }
    >({
      query: ({ contentTypeId, lang, skip, take, sortBy, order }) => {
        let url = `/files?lang=${lang}&skip=${skip}&take=${take}&sortBy=${sortBy}&order=${order}`;

        if (contentTypeId) {
          url = `/files/content-types/${contentTypeId}?lang=${lang}&skip=${skip}&take=${take}`;
        }
        return url;
      },

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Files" as const, id })),
              "Files",
            ]
          : ["Files"],

      serializeQueryArgs: ({ queryArgs }) => {
        return { contentTypeId: queryArgs.contentTypeId, lang: queryArgs.lang };
      },

      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.total = newItems.total;
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    getFilesBySubcategory: builder.query<
      SubCatFilesResponse,
      { subCatId: string | number; lang: string; take: number; skip: number }
    >({
      query: ({ subCatId, lang, take, skip }) =>
        `/files/subcategory/${subCatId}?lang=${lang}&take=${take}&skip=${skip}`,

      serializeQueryArgs: ({ queryArgs }) => {
        return `files-${queryArgs.subCatId}-${queryArgs.lang}`;
      },

      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
          return newItems;
        }

        currentCache.data.push(...newItems.data);
        currentCache.total = newItems.total;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg !== previousArg;
      },

      providesTags: (_result, _error, arg) => [
        { type: "Files", id: `SUBCAT-${arg.subCatId}` },
      ],
    }),

    getFilesByCategory: builder.query<
      AllFilesResponse,
      { catId: string | number; lang: string; skip: number; take: number }
    >({
      query: ({ catId, lang, take, skip }) =>
        `/files/category/${catId}?lang=${lang}&skip=${skip}&take=${take}`,
      transformResponse: (response: FilesResponses) => response,
      providesTags: (_result, _error, { catId, lang }) => [
        { type: "Files", id: `CAT-${catId}-${lang}` },
        { type: "Files", id: "LIST" },
      ],
    }),
    deleteFile: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    updateFile: builder.mutation<
      FileObject,
      { id: string | number; body: FileObject }
    >({
      query: ({ id, body }) => ({
        url: `/files/${id}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Files"],
    }),

    contentFiles: builder.query<FileObject, { id?: string; lang: string }>({
      query: ({ id, lang }) => `/files/list/${id}?${lang}`,
    }),

    globalSearch: builder.query<
      SearchResponse,
      { search: string; languageCode: string; skip?: number; take?: number }
    >({
      query: ({ search, languageCode, skip, take }) =>
        `/search?search=${search}&languageCode=${languageCode}&skip=${skip}&take=${take}`,

      serializeQueryArgs: ({ queryArgs }) => {
        return `${queryArgs.search}-${queryArgs.languageCode}`;
      },

      merge: (currentCache, newItems) => {
        if (newItems.skip === 0) {
          return newItems;
        }

        currentCache.data.push(...newItems.data);
      },

      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.search !== previousArg?.search ||
        currentArg?.languageCode !== previousArg?.languageCode,
    }),
    getSearchFiles: builder.query({
      query: ({ search, lang, skip, take, year }) => ({
        url: "/search/files",
        method: "GET",
        params: {
          search: search || "",
          languageCode: lang || "en",
          skip: skip || 0,
          take: take || 20,
          year: year,
        },
      }),
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
  useGetFilesBySubcategoryQuery,
  useGetFilesByCategoryQuery,
  useUpdateFileMutation,
  useGlobalSearchQuery,
  useGetSearchFilesQuery,
} = rssApi;
