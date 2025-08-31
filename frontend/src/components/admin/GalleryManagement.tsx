// src/components/GalleryManagement.tsx
import React, { useState, useEffect, useRef, type JSX } from 'react';
import type {
  GalleryImage,
  Category,
  Hall,
  NewImageForm,
  BulkUpdateForm,
  NewCategoryForm,
  ActiveTab
} from '../../types/gallery';
import { 
  fetchGalleryImages, 
  fetchCategories, 
  fetchHalls,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  bulkDeleteImages,
  bulkUpdateImages,
  createCategory,
  deleteCategory,
  bulkUploadImages
} from '../../services/galleryApi';

const GalleryManagement: React.FC = () => {
  // Main state
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('images');

  // Image management state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  
  // Single image upload state
  const [newImage, setNewImage] = useState<NewImageForm>({
    title: '',
    description: '',
    category: '',
    hall: '',
    is_featured: false,
    is_public: true,
    tags: '',
    alt_text: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  // Bulk operations state
  const [bulkUpdate, setBulkUpdate] = useState<BulkUpdateForm>({
    category: '',
    hall: '',
    is_featured: false,
    is_public: true,
  });
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<number>(0);
  const [isBulkUploading, setIsBulkUploading] = useState<boolean>(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState<boolean>(false);

  // Category management state
  const [newCategory, setNewCategory] = useState<NewCategoryForm>({
    name: '',
    description: '',
    is_active: true
  });

  // Refs for checkbox indeterminate state
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load initial data
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const [imagesData, categoriesData, hallsData] = await Promise.all([
          fetchGalleryImages().catch(err => {
            console.warn('Failed to fetch images:', err);
            return { results: [] };
          }),
          fetchCategories().catch(err => {
            console.warn('Failed to fetch categories:', err);
            return { results: [] };
          }),
          fetchHalls().catch(err => {
            console.warn('Failed to fetch halls:', err);
            return { results: [] };
          }),
        ]);
        
        setImages(
          Array.isArray(imagesData)
            ? (imagesData as GalleryImage[])
            : ((imagesData as { results?: GalleryImage[] }).results || [])
        );
        setCategories(Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []));
        setHalls(Array.isArray(hallsData) ? hallsData : (hallsData.results || []));
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please check your server connection.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update checkbox indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedImages.length > 0 && selectedImages.length < images.length;
    }
  }, [selectedImages.length, images.length]);

  // Image selection handlers
  const handleSelectImage = (id: string): void => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedImages(e.target.checked ? images.map(img => img.id) : []);
  };

  // File validation
  const validateFile = (file: File): boolean => {
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

  // Single image operations
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      try {
        validateFile(selectedFile);
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setFile(null);
        setPreview('');
      }
    } else {
      setFile(null);
      setPreview('');
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setNewImage(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNewImageSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }
    
    if (!newImage.category) {
      setError('Please select a category');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', newImage.title);
      formData.append('description', newImage.description);
      formData.append('category', newImage.category);
      if (newImage.hall) formData.append('hall', newImage.hall);
      formData.append('is_featured', newImage.is_featured.toString());
      formData.append('is_public', newImage.is_public.toString());
      formData.append('tags', newImage.tags);
      formData.append('alt_text', newImage.alt_text);
      
      const createdImage = await createGalleryImage(formData);
      setImages([createdImage, ...images]);
      
      // Reset form
      setNewImage({
        title: '',
        description: '',
        category: '',
        hall: '',
        is_featured: false,
        is_public: true,
        tags: '',
        alt_text: '',
      });
      setFile(null);
      setPreview('');
      setError(null);
      setSuccess('Image uploaded successfully to Cloudinary! No login required!');
    } catch (err) {
      console.error('Error creating image:', err);
      setError((err as Error).message || 'Failed to create image');
    }
  };

  // Bulk operations
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: { name: string; error: string }[] = [];

    selectedFiles.forEach(file => {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (err) {
        invalidFiles.push({ name: file.name, error: (err as Error).message });
      }
    });

    setBulkFiles(validFiles);
    
    if (invalidFiles.length > 0) {
      setError(`Some files were rejected: ${invalidFiles.map(f => `${f.name} (${f.error})`).join(', ')}`);
    }
  };

  const handleBulkUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setBulkUpdate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (bulkFiles.length === 0) {
      setError('Please select at least one valid image');
      return;
    }

    if (!newImage.category) {
      setError('Please select a default category');
      return;
    }

    setIsBulkUploading(true);
    setBulkUploadProgress(0);
    setError(null);

    try {
      const uploadedImages = await bulkUploadImages(
        bulkFiles,
        {
          category: newImage.category,
          hall: newImage.hall,
          is_featured: newImage.is_featured,
          is_public: newImage.is_public,
          tags: newImage.tags,
          alt_text: newImage.alt_text,
          description: newImage.description
        },
        (progress: number) => {
          setBulkUploadProgress(Math.round(progress * 100));
        }
      );

      setImages([...uploadedImages, ...images]);
      setBulkFiles([]);
      setSuccess(`Successfully uploaded ${uploadedImages.length} images to Cloudinary! No authentication needed!`);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Bulk upload error:', err);
      setError((err as Error).message || 'Failed to upload some images');
    } finally {
      setIsBulkUploading(false);
      setBulkUploadProgress(0);
    }
  };

  const handleBulkUpdate = async (): Promise<void> => {
    if (selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }
    
    setIsBulkUpdating(true);
    setError(null);

    try {
      const updateData: Partial<GalleryImage> = {};
      if (bulkUpdate.category) updateData.category = bulkUpdate.category;
      if (bulkUpdate.hall) updateData.hall = bulkUpdate.hall;
      updateData.is_featured = bulkUpdate.is_featured;
      updateData.is_public = bulkUpdate.is_public;
      
      await bulkUpdateImages(selectedImages, updateData);
      
      // Update local state
      setImages(images.map(img => 
        selectedImages.includes(img.id) ? { ...img, ...updateData } : img
      ));
      
      // Reset selections
      setSelectedImages([]);
      setBulkUpdate({
        category: '',
        hall: '',
        is_featured: false,
        is_public: true,
      });
      
      setSuccess(`Successfully updated ${selectedImages.length} images!`);
    } catch (err) {
      console.error('Bulk update error:', err);
      setError((err as Error).message || 'Failed to update images');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedImages.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} images? This will also remove them from Cloudinary.`)) {
      return;
    }

    try {
      await bulkDeleteImages(selectedImages);
      setImages(images.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      setSuccess(`Successfully deleted ${selectedImages.length} images from both database and Cloudinary!`);
    } catch (err) {
      console.error('Error deleting images:', err);
      setError('Failed to delete images. Please try again.');
    }
  };

  // Image editing
  const handleEdit = (image: GalleryImage): void => {
    setEditImage(image);
    setNewImage({
      title: image.title,
      description: image.description || '',
      category: image.category || '',
      hall: image.hall || '',
      is_featured: image.is_featured || false,
      is_public: image.is_public !== false,
      tags: image.tags || '',
      alt_text: image.alt_text || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!editImage) return;
    
    if (!newImage.category) {
      setError('Please select a category');
      return;
    }
    
    try {
      const updatedImage = await updateGalleryImage(editImage.id, newImage);
      setImages(images.map(img => 
        img.id === editImage.id ? { ...img, ...updatedImage } : img
      ));
      setEditImage(null);
      setSuccess('Image updated successfully!');
    } catch (err) {
      console.error('Error updating image:', err);
      setError((err as Error).message || 'Failed to update image');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this image? This will also remove it from Cloudinary.')) {
      try {
        await deleteGalleryImage(id);
        setImages(images.filter(img => img.id !== id));
        setSuccess('Image deleted successfully from both database and Cloudinary!');
      } catch (err) {
        console.error('Error deleting image:', err);
        setError('Failed to delete image. Please try again.');
      }
    }
  };

  // Category management
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setNewCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const createdCategory = await createCategory(newCategory);
      setCategories([...categories, createdCategory]);
      setNewCategory({
        name: '',
        description: '',
        is_active: true
      });
      setSuccess('Category created successfully!');
    } catch (err) {
      console.error('Error creating category:', err);
      setError((err as Error).message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this category? Images in this category will not be deleted.')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
        setSuccess('Category deleted successfully!');
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  // Helper function to render image with fallback
  const renderImage = (image: GalleryImage, className: string = 'w-16 h-16 object-cover rounded-lg'): JSX.Element => {
    // Priority order: Cloudinary thumbnail -> Cloudinary main -> local thumbnail -> local main
    const imageUrl = image.thumbnail_url || image.image_url || 
                    (image.thumbnail && image.thumbnail) || 
                    (image.image && image.image);
    
    return (
      <img 
        src={imageUrl || '/placeholder-image.png'}
        alt={image.alt_text || image.title}
        className={className}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback chain
          if (image.image_url && target.src !== image.image_url) {
            target.src = image.image_url;
          } else if (image.image && target.src !== image.image) {
            target.src = image.image;
          } else {
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNSAyNUMyNyAyMyAzMyAyMyAzNSAyNUMzNyAyNyAzNyAzMyAzNSAzNUMzMyAzNyAyNyAzNyAyNSAzNUMyMyAzMyAyMyAyNyAyNSAyNVoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K';
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading gallery data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery Management</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-4">
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <span className="text-green-800">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 ml-4">
            ×
          </button>
        </div>
      )}
      
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'images' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('images')}
          >
            Images ({images.length})
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'categories' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {activeTab === 'images' && (
        <div className="space-y-8">
          {/* Bulk Actions Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bulk Actions</h2>
            
            {/* Bulk Upload */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload Images to Cloudinary</h3>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-blue-800 text-sm">No authentication required - anyone can upload!</span>
              </div>
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Images:</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBulkFileChange}
                    disabled={isBulkUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {bulkFiles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-green-600 mb-2">Valid files selected: {bulkFiles.length}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {bulkFiles.slice(0, 5).map((file, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="font-medium text-gray-900 truncate">{file.name}</div>
                            <div className="text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        ))}
                        {bulkFiles.length > 5 && (
                          <div className="text-xs bg-gray-50 p-2 rounded flex items-center justify-center">
                            <span className="text-gray-600">... and {bulkFiles.length - 5} more files</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Category: *</label>
                    <select
                      name="category"
                      value={newImage.category}
                      onChange={handleNewImageChange}
                      disabled={isBulkUploading}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Hall:</label>
                    <select
                      name="hall"
                      value={newImage.hall}
                      onChange={handleNewImageChange}
                      disabled={isBulkUploading}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">Select Hall (Optional)</option>
                      {halls.map(hall => (
                        <option key={hall.id} value={hall.id}>
                          Hall {hall.section_number} - {hall.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={newImage.is_featured}
                      onChange={handleNewImageChange}
                      disabled={isBulkUploading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as Featured</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={newImage.is_public}
                      onChange={handleNewImageChange}
                      disabled={isBulkUploading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Make Public</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Tags:</label>
                  <input
                    type="text"
                    name="tags"
                    value={newImage.tags}
                    onChange={handleNewImageChange}
                    placeholder="tag1, tag2, tag3"
                    disabled={isBulkUploading}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                {isBulkUploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${bulkUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      Uploading to Cloudinary... {bulkUploadProgress}%
                    </span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    disabled={bulkFiles.length === 0 || isBulkUploading || !newImage.category}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkUploading 
                      ? `Uploading... ${bulkUploadProgress}%` 
                      : `Upload ${bulkFiles.length} Files to Cloudinary`
                    }
                  </button>
                  
                  {bulkFiles.length > 0 && !isBulkUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setBulkFiles([]);
                        const fileInput = document.querySelector('input[type="file"][multiple]') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Bulk Update */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Update Selected Images ({selectedImages.length})</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Category:</label>
                    <select
                      name="category"
                      value={bulkUpdate.category}
                      onChange={handleBulkUpdateChange}
                      disabled={selectedImages.length === 0}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">-- No Change --</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Hall:</label>
                    <select
                      name="hall"
                      value={bulkUpdate.hall}
                      onChange={handleBulkUpdateChange}
                      disabled={selectedImages.length === 0}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="">-- No Change --</option>
                      {halls.map(hall => (
                        <option key={hall.id} value={hall.id}>
                          Hall {hall.section_number} - {hall.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={bulkUpdate.is_featured}
                      onChange={handleBulkUpdateChange}
                      disabled={selectedImages.length === 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set Featured</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_public"
                      checked={bulkUpdate.is_public}
                      onChange={handleBulkUpdateChange}
                      disabled={selectedImages.length === 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set Public</span>
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleBulkUpdate}
                    disabled={selectedImages.length === 0 || isBulkUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkUpdating 
                      ? 'Updating...' 
                      : `Apply to ${selectedImages.length} Selected`
                    }
                  </button>
                  
                  <button 
                    onClick={handleBulkDelete}
                    disabled={selectedImages.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add New Image Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Image to Cloudinary</h2>
            <form onSubmit={handleNewImageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image File: *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {preview && (
                  <div className="mt-4 text-center">
                    <img src={preview} alt="Preview" className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md" />
                    <p className="mt-2 text-sm text-gray-600">Preview - Will be uploaded to Cloudinary</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title: *</label>
                <input
                  type="text"
                  name="title"
                  value={newImage.title}
                  onChange={handleNewImageChange}
                  required
                  placeholder="Enter image title..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                <textarea
                  name="description"
                  value={newImage.description}
                  onChange={handleNewImageChange}
                  placeholder="Describe this image..."
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category: *</label>
                  <select
                    name="category"
                    value={newImage.category}
                    onChange={handleNewImageChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hall:</label>
                  <select
                    name="hall"
                    value={newImage.hall}
                    onChange={handleNewImageChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Hall (Optional)</option>
                    {halls.map(hall => (
                      <option key={hall.id} value={hall.id}>
                        Hall {hall.section_number} - {hall.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={newImage.is_featured}
                    onChange={handleNewImageChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={newImage.is_public}
                    onChange={handleNewImageChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated):</label>
                <input
                  type="text"
                  name="tags"
                  value={newImage.tags}
                  onChange={handleNewImageChange}
                  placeholder="tag1, tag2, tag3"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text:</label>
                <input
                  type="text"
                  name="alt_text"
                  value={newImage.alt_text}
                  onChange={handleNewImageChange}
                  placeholder="Description for screen readers"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <button type="submit" className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                Upload
              </button>
            </form>
          </div>
          
          {/* Images List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Images ({images.length})</h2>
              {selectedImages.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedImages.length} selected
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedImages.length === images.length && images.length > 0}
                        ref={selectAllRef}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {images.map(image => (
                    <tr key={image.id} className={selectedImages.includes(image.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image.id)}
                          onChange={() => handleSelectImage(image.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          {renderImage(image)}
                          {image.cloudinary_public_id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white" title="Stored in Cloudinary">
                              ☁
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">{image.title}</div>
                          {image.description && (
                            <div className="text-sm text-gray-500 truncate">{image.description.substring(0, 50)}...</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {image.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {image.hall_name ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Hall {image.hall_section} - {image.hall_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {image.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Featured
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            image.is_public 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {image.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {image.views} views
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(image)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit image"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(image.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete from database and Cloudinary"
                          >
                            Delete
                          </button>
                          {(image.image_url || image.cloudinary_url) && (
                            <a 
                              href={image.image_url || image.cloudinary_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                              title="View full image"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Edit Image Modal */}
          {editImage && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Image</h2>
                  <button 
                    onClick={() => setEditImage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                  {(editImage.image_url || editImage.cloudinary_url) && (
                    <div className="text-center mb-4">
                      {renderImage(editImage, 'max-w-xs max-h-48 mx-auto rounded-lg')}
                      <div className="mt-2 text-sm text-gray-600">
                        {editImage.cloudinary_public_id ? (
                          <div className="space-y-1">
                            <div>Stored in Cloudinary</div>
                            <div className="text-xs">ID: {editImage.cloudinary_public_id}</div>
                          </div>
                        ) : (
                          <div>Local Storage</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title: *</label>
                    <input
                      type="text"
                      name="title"
                      value={newImage.title}
                      onChange={handleNewImageChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                    <textarea
                      name="description"
                      value={newImage.description}
                      onChange={handleNewImageChange}
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category: *</label>
                      <select
                        name="category"
                        value={newImage.category}
                        onChange={handleNewImageChange}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hall:</label>
                      <select
                        name="hall"
                        value={newImage.hall}
                        onChange={handleNewImageChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Hall (Optional)</option>
                        {halls.map(hall => (
                          <option key={hall.id} value={hall.id}>
                            Hall {hall.section_number} - {hall.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={newImage.is_featured}
                        onChange={handleNewImageChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={newImage.is_public}
                        onChange={handleNewImageChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Public</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated):</label>
                    <input
                      type="text"
                      name="tags"
                      value={newImage.tags}
                      onChange={handleNewImageChange}
                      placeholder="tag1, tag2, tag3"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text:</label>
                    <input
                      type="text"
                      name="alt_text"
                      value={newImage.alt_text}
                      onChange={handleNewImageChange}
                      placeholder="Description for screen readers"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setEditImage(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Management</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name: *</label>
                  <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleNewCategoryChange}
                    required
                    placeholder="Enter category name..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                  <textarea
                    name="description"
                    value={newCategory.description}
                    onChange={handleNewCategoryChange}
                    placeholder="Describe this category..."
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={newCategory.is_active}
                      onChange={handleNewCategoryChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
                
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Category
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Categories ({categories.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {category.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{category.image_count || 0} images</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete category"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {categories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No categories found. Create your first category above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty states for images */}
      {activeTab === 'images' && images.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading your first image.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;