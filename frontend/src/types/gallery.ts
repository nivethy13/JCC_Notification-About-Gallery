// src/types/gallery.ts

export interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  category?: string;
  category_name?: string;
  hall?: string;
  hall_name?: string;
  hall_section?: string;
  is_featured: boolean;
  is_public: boolean;
  tags?: string;
  alt_text?: string;
  views: number;
  image_url?: string;
  thumbnail_url?: string;
  cloudinary_url?: string;
  cloudinary_public_id?: string;
  image?: string;
  thumbnail?: string;
  formatted_date?: string;
  tags_list?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  image_count?: number;
}

export interface Hall {
  id: string;
  name: string;
  section_number: string;
}

export interface NewImageForm {
  title: string;
  description: string;
  category: string;
  hall: string;
  is_featured: boolean;
  is_public: boolean;
  tags: string;
  alt_text: string;
}

export interface BulkUpdateForm {
  category: string;
  hall: string;
  is_featured: boolean;
  is_public: boolean;
}

export interface NewCategoryForm {
  name: string;
  description: string;
  is_active: boolean;
}

export interface ImageMetadata {
  title?: string;
  description?: string;
  category: string;
  hall?: string;
  is_featured?: boolean;
  is_public?: boolean;
  tags?: string;
  alt_text?: string;
}

export interface ApiError extends Error {
  status?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface GalleryFilters {
  category: string;
  hall: string;
  is_featured: boolean;
  search: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  results?: T[];
}

export interface GalleryApiParams {
  category?: string;
  hall?: string;
  is_featured?: boolean;
  search?: string;
  [key: string]: unknown;
}

export type ActiveTab = 'images' | 'categories' | 'halls';