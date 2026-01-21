export interface Language {
  _id?: string;
  name: string;
  code: string;
  isActive: boolean;
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

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}