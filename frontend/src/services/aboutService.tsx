// frontend/src/services/aboutService.ts

import { type About } from '../types/about';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/about`;

// Generic API function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;


  const isFormData = options.body instanceof FormData;

  const defaultHeaders: HeadersInit = isFormData
    ? {} // leave headers empty, browser handles it
    : { 'Content-Type': 'application/json' };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// About API
export const aboutApi = {
  // Get About page content
  getAboutContent: async (): Promise<About> => {
    return apiRequest<About>('/');
  },

  // Update About page content
  updateAboutContent: async (data: Partial<About>): Promise<About> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'hero_background' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return apiRequest<About>('/content/', {
      method: 'PATCH',
      body: formData, // ✅ no Content-Type needed
    });
  },
};
