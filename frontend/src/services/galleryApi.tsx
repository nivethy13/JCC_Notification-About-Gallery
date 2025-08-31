// src/services/galleryApi.ts
import type { 
  GalleryImage, 
  Category, 
  Hall, 
  ImageMetadata, 
  ApiError, 
  ApiResponse,
  GalleryApiParams
} from '../types/gallery';

const API_BASE_URL = 'http://localhost:8000/api/gallery';

// Enhanced response handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = async <T = any>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || data.detail || 'Request failed') as ApiError;
    error.status = response.status;
    error.data = data;
    if (response.status === 404) {
      error.message = 'Resource not found';
    }
    throw error;
  }
  
  return data;
};

// Helper function to validate image files
const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: JPEG, PNG, GIF, WebP`);
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum 10MB allowed.');
  }
  
  return true;
};

// Gallery Images API
export const fetchGalleryImages = async (
  params: GalleryApiParams = {}
): Promise<ApiResponse<GalleryImage> | GalleryImage[]> => {
  try {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const url = query ? `${API_BASE_URL}/images/?${query}` : `${API_BASE_URL}/images/`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Gallery images fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch gallery images');
  }
};

export const fetchGalleryImage = async (id: string | number): Promise<GalleryImage> => {
  try {
    const response = await fetch(`${API_BASE_URL}/images/${id}/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Gallery image fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch image details');
  }
};

export const createGalleryImage = async (formData: FormData): Promise<GalleryImage> => {
  try {
    // Validate image file if present
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile instanceof File) {
      validateImageFile(imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/admin/images/`, {
      method: 'POST',
      body: formData,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Image creation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create image');
  }
};

export const updateGalleryImage = async (
  id: string | number, 
  data: Partial<GalleryImage>
): Promise<GalleryImage> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

export const deleteGalleryImage = async (id: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to delete image');
    }
    
    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete image');
  }
};

// Bulk Operations
export const bulkUploadImages = async (
  files: File[], 
  metadata: ImageMetadata, 
  onProgress?: (progress: number) => void
): Promise<GalleryImage[]> => {
  try {
    const uploadedImages: GalleryImage[] = [];
    const failedUploads: Array<{ file: string; error: string }> = [];
    const totalFiles = files.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      try {
        // Validate file before upload
        validateImageFile(file);
        
        const formData = new FormData();
        
        // Generate title from filename if not provided
        const title = metadata.title || file.name.split('.')[0].replace(/[_-]/g, ' ');
        
        formData.append('image', file);
        formData.append('title', title);
        formData.append('description', metadata.description || '');
        formData.append('category', metadata.category);
        if (metadata.hall) formData.append('hall', metadata.hall);
        formData.append('is_featured', String(metadata.is_featured || false));
        formData.append('is_public', String(metadata.is_public !== false));
        formData.append('tags', metadata.tags || '');
        formData.append('alt_text', metadata.alt_text || title);
        
        const response = await fetch(`${API_BASE_URL}/admin/images/`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const createdImage = await response.json();
          uploadedImages.push(createdImage);
        } else {
          const errorData = await response.json().catch(() => ({}));
          failedUploads.push({
            file: file.name,
            error: errorData.message || errorData.detail || 'Upload failed'
          });
        }
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        failedUploads.push({
          file: file.name,
          error: err instanceof Error ? err.message : 'Upload failed'
        });
      }
      
      // Update progress
      if (onProgress) {
        onProgress((i + 1) / totalFiles);
      }
    }

    if (failedUploads.length > 0) {
      console.warn('Some uploads failed:', failedUploads);
    }

    return uploadedImages;
  } catch (err) {
    console.error('Bulk upload error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to upload images');
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bulkDeleteImages = async (ids: (string | number)[]): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/bulk-delete/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_ids: ids }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Bulk delete error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete images');
  }
};

export const bulkUpdateImages = async (
  ids: (string | number)[], 
  updateData: Partial<GalleryImage>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/images/bulk-update/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image_ids: ids,
        update_data: updateData 
      }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Bulk update error:', error);
    throw error;
  }
};

// Categories API
export const fetchCategories = async (): Promise<ApiResponse<Category> | Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Categories fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch categories');
  }
};

export const createCategory = async (data: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Category creation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create category');
  }
};

export const deleteCategory = async (id: string | number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Failed to delete category');
    }
    
    return true;
  } catch (error) {
    console.error('Category deletion error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete category');
  }
};

// Halls API
export const fetchHalls = async (): Promise<ApiResponse<Hall> | Hall[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/halls/`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Halls fetch error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch halls');
  }
};

// Cloudinary utilities
export const getOptimizedImageUrl = (
  publicId: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformations: Record<string, any> = {}
): string | null => {
  if (!publicId) return null;
  
  const baseUrl = 'https://res.cloudinary.com/damplktwn/image/upload';
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations
  };
  
  const transformString = Object.entries(defaultTransformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  
  return `${baseUrl}/${transformString}/${publicId}`;
};

export const getThumbnailUrl = (publicId: string, size: number = 300): string | null => {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};