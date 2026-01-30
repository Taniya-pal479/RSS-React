import type { ReactNode } from "react";

export interface Language {
  _id?: string;
  name: string;
  code: string;
  isActive: boolean;
}
export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  onClick:()=>void;
  subText: string;
  color: string;
  trendColor?: string;
}

export interface Translation {
  languageCode: string;
  name: string;
  description?: string;
    data?:string;
}

export interface SubCategory {
  id: number | string;
  slug: string;
  name?: string | null;
  description?: string | null;
  translations?: Translation[];
}

export interface Category {
  id: number | string;
  slug: string;
  name?: string | null;
  description?: string | null;
  subCategories?: SubCategory[];
  translations?: Translation[];
  data:Category[];
 
}


export interface CreateCategoryPayload {
  slug: string;
  translations: Translation[];
}

export interface CreateSubCategoryPayload {
  categoryId: number; 
  slug: string;
  translations: Translation[];
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
  status: string;
  lang: string;
  name: string;
  description: string;
  createdAt: string;
  
}

export interface ContentTypeMapped {
  id:number; 
  name: string;
  description: string;
  year?: number; 
  status?: string;
  category?: string;    
  subcategory?: string;
  categoryId?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translations?: any[];
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


export interface FileObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any;
 contentTypeId:number|string;
 categoryId:number|string;
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  fileType: string;
  uploadedAt: string;
   url: string;
  files:[];
  metadata: Array<{ id: number; key: string; value: string }>;
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
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}