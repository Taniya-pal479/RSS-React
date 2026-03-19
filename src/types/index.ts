import type { ReactNode } from "react";

export interface Language {
  _id?: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface User {
  email: string;
  role: string;
}

export interface AuthState {
  accessToken: string | null;
  type: string | null;
  isAuthenticated: boolean;
  user?: User | null;
}
export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  onClick: () => void;
  subText: string;
  color: string;
  trendColor?: string;
}

export interface Translation {
  languageCode: string;
  name: string;
  description?: string;
  data?: string;
}

export interface FileTranslations {
  languageCode: string;
  displayName: string;
  description?: string;
  data?: string;
}

export interface FormTranslations {
  displayName: string;
  description: string;
}

export interface SubCategoryResponse {
  result: SubCategory[];
  total: number;
}
export interface CategoryResponse {
  data: Category[];
  total: number;
}
export interface FilesRespons {
  files: FileResponse[];
  total: number;
}

export interface SubCategory {
  categoryId: string | number;
  id: number | string;
  slug?: string;
  name?: string | null;
  description?: string | null;
  translations?: Translation[];
  createdAt?: string;
  updatedAt?: string;
  result?: SubCategory[];
}

export interface Category {
  id: number | string;
  slug?: string;
  name?: string | null;
  description?: string | null;
  subCategories?: SubCategory[];
  translations?: Translation[];
  data?: Category[];
  createdAt?: string;
  updatedAt?: string;
}
export interface CombinedItem {
  name: string;
  id: number | string;
  tableId: string;
  displayName: string | null | undefined;
  originalName: string;
  description: string | null | undefined;
  displayType: "SUBCATEGORY" | "FILE";
  itemType: "subcategory" | "file";
  icon: ReactNode;
  url?: string;
  slug?: string;
  categoryId?: number | string;
  subcategoryId?: number | string | null;
}

export interface CreateCategoryPayload {
  slug?: string;
  translations: Translation[];
  status?: string;
}

export interface CreateFilePayload {
  slug?: string;
  translations: FileTranslations[];
  status?: string;
}

export interface CreateSubCategoryPayload {
  categoryId: number;
  slug?: string;
  translations: Translation[];
}

interface ResourceMetadata {
  category: string;
  subcategory: string;
}
export interface FilesResponses {
  files: FileObject[];
  total: number;
  skip?: number;
}

export interface FileResource {
  id: number;
  contentTypeId: number;
  displayName: string;
  description: string;
  originalName: string;
  fileSize: number;
  fileType: "PDF" | string;
  lang: string;
  url: string;
  uploadedAt: string;
  metadata: ResourceMetadata;
}

export interface FileResponse {
  id: string | number;
  name: string;
  extension: string;
  size: string;
  year: string;
  updated_at: string;
  url: string;
}

export interface ContentTypeTranslation {
  id: number;
  contentTypeId: number;
  languageCode: string;
  name: string;
  description: string;
}

export interface ContentTypeRawResponse {
  id: number;
  categoryId: number;
  subcategoryId: number | null;
  categorySlug: string;
  subcategorySlug: string | null;
  contentYear: number;
  status?: string;
  lang: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface ContentTypeMapped {
  id: number;
  name: string;
  description: string;
  contentYear?: number;
  status?: string;
  category?: string;
  subcategory?: string;
  data: ContentTypeRawResponse[];
  categoryId: string | number;
  subcategoryId?: number | null;
  categorySlug?: string;
  subcategorySlug?: string | null;
  lang?: string;
  createdAt?: string;
  updatedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translations?: any[];
}
export interface SearchItem {
  id: string | number;
  type: "category" | "subcategory" | "content" | "file";
  name?: string;
  displayName?: string;
  uploadedAt?: string;
  categoryId?: string | number;
  url?: string;
  mimeType?: string;
  [key: string]: any;
}

export interface SearchResponse {
  data: SearchItem[];
  total: number;
  skip: number;
  take: number;
}

export interface SearchResultSectionProps<T extends SearchItem> {
  title: string;
  icon: React.ElementType;
  items: T[];
  onSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
export interface CreateContentTypePayload {
  categoryId: number;
  subcategoryId: number | null;
  translations: Array<{
    languageCode: string;
    name: string;
    description: string;
  }>;
}
export interface UpdateTranslationPayload {
  languageCode: string;
  name: string;
  description: string;
}

export interface GetFilesArgs {
  lang: string;
  limit?: number;
}

export interface FileItem {
  description: string;
  id: string | number;
  displayName: string;
  originalName: string;
  fileSize: number;
  url: string;
  mimeType?: string;
  uploadedAt: string;
  categoryId: string | number;
  contentTypeId: string | number;
  icon?: React.ReactNode;
}
export interface FileObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any;
  contentTypeId: number | string;
  categoryId: number | string;
  id: number;
  fileName: string;
  displayName: string;
  originalName: string;
  description: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  fileType: string;
  uploadedAt: string;
  url: string;
  files: [];
  metadata: Array<{ id: number; key: string; value: string }>;
  updatedAt?: string;
  translations: FileTranslations[];
  year?: string;
}
export interface IngestedFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  categoryId: string;
  contentTypeId: string;
  type?: string;
  category?: {
    id: string;
    name: string;
  };
  contentType?: {
    id: string;
    name: string;
    categoryId: string;
  };
}
export interface AllFilesResponse {
  files: FileObject[];
  total: number;
}

// Define the base properties shared by all results
export interface BaseResult {
  id: number;
  type: "category" | "subcategory" | "content" | "file";
  lang?: string; // This is the key for filtering language
  categoryId?: number;
  uploadedAt?: string;
}

// Define specific shapes
export interface CategoryResult extends BaseResult {
  type: "category";
  title?: string;
  name?: string;
  [key: string]: any;
}

export interface SubCategoryResult extends BaseResult {
  type: "subcategory";
  title?: string;
  name?: string;
  [key: string]: any;
}

export interface ContentResult extends BaseResult {
  type: "content";
  title: string;
  slug: string;
  [key: string]: any;
}

export interface FileResult extends BaseResult {
  type: "file";
  title?: string;
  year?: string;
  url: string;
  mimeType?: string;
  [key: string]: any;
}

// The union type for the whole array
export type GlobalSearchResult =
  | CategoryResult
  | ContentResult
  | FileResult
  | SubCategoryResult;

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
