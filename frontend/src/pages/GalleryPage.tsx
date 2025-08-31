// src/pages/GalleryPage.tsx
import React, { useState, useEffect } from 'react';
import type { GalleryImage, Category, Hall, GalleryFilters } from '../types/gallery';
import { fetchGalleryImages, fetchCategories, fetchHalls, fetchGalleryImage } from '../services/galleryApi';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<GalleryFilters>({
    category: '',
    hall: '',
    is_featured: false,
    search: '',
  });
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [viewingImage, setViewingImage] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [imagesData, categoriesData, hallsData] = await Promise.all([
          fetchGalleryImages(filters),
          fetchCategories(),
          fetchHalls(),
        ]);
        
        // Handle images response
        if (Array.isArray(imagesData)) {
          setImages(imagesData);
        } else if (imagesData && 'results' in imagesData) {
          setImages(imagesData.results || []);
        } else {
          setImages([]);
        }
        
        // Handle categories response
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData && 'results' in categoriesData) {
          setCategories(categoriesData.results || []);
        } else {
          setCategories([]);
        }
        
        // Handle halls response
        if (Array.isArray(hallsData)) {
          setHalls(hallsData);
        } else if (hallsData && 'results' in hallsData) {
          setHalls(hallsData.results || []);
        } else {
          setHalls([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFilters((prev: GalleryFilters) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const clearFilters = (): void => {
    setFilters({
      category: '',
      hall: '',
      is_featured: false,
      search: '',
    });
  };

  // Handle image click to view full image and increment view count
  const handleImageClick = async (image: GalleryImage): Promise<void> => {
    try {
      setViewingImage(true);
      // Fetch image details which will increment the view count
      const updatedImage = await fetchGalleryImage(image.id);
      
      // Update the local state with the new view count
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, views: updatedImage.views } : img
      ));
      
      // Set the selected image for modal display
      setSelectedImage({ ...image, views: updatedImage.views });
    } catch (error) {
      console.error('Error fetching image details:', error);
      // Still show the image even if view increment fails
      setSelectedImage(image);
    } finally {
      setViewingImage(false);
    }
  };

  // Close image modal
  const closeImageModal = (): void => {
    setSelectedImage(null);
  };

  // Eye icon for views
  const EyeIcon: React.FC = () => (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
      />
    </svg>
  );

  // Search icon
  const SearchIcon: React.FC = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  // Star icon for featured
  const StarIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-blue-600 opacity-10 animate-pulse"></div>
          </div>
          <p className="text-xl text-blue-900 font-medium">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Gallery Collection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated collection of stunning images across various categories and halls
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search images..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.image_count})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Hall Filter */}
            <div>
              <select
                name="hall"
                value={filters.hall}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
              >
                <option value="">All Halls</option>
                {halls.map(hall => (
                  <option key={hall.id} value={hall.id}>
                    Hall {hall.section_number} - {hall.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Featured Toggle */}
            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 cursor-pointer bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-colors duration-200">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={filters.is_featured}
                  onChange={handleFilterChange}
                  className="w-4 h-4 text-blue-600 bg-white border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <StarIcon />
                <span className="text-sm font-medium text-blue-700">Featured</span>
              </label>
            </div>
            
            {/* Clear Filters */}
            <div>
              <button 
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {images.length > 0 ? (
            images.map(image => (
              <div 
                key={image.id} 
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 border border-blue-100 hover:border-blue-300"
                onClick={() => handleImageClick(image)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                  <img 
                    src={image.image} 
                    alt={image.alt_text || image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay for Better Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Featured Badge */}
                  {image.is_featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <StarIcon />
                      Featured
                    </div>
                  )}
                  
                  {/* Views Counter */}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                    <EyeIcon />
                    {image.views.toLocaleString()}
                  </div>
                </div>
                
                {/* Hover Effect Indicator */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl">
                </div>
                
                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
                    {image.title}
                  </h3>
                  
                  {/* Description Preview */}
                  {image.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {image.description}
                    </p>
                  )}
                  
                  {/* Tags Preview */}
                  {image.tags_list && image.tags_list.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags_list.slice(0, 3).map((tag, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          #{tag}
                        </span>
                      ))}
                      {image.tags_list.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                          +{image.tags_list.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No images found</h3>
              <p className="text-gray-600 text-center max-w-md">
                No images match your current search criteria. Try adjusting your filters or browse all categories.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center space-x-4">
                <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                {selectedImage.is_featured && (
                  <div className="flex items-center gap-1 bg-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon />
                    Featured
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <EyeIcon />
                  <span className="font-medium">{selectedImage.views.toLocaleString()} views</span>
                </div>
                <button 
                  onClick={closeImageModal}
                  className="text-white/80 hover:text-white text-3xl font-light hover:bg-white/10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
              {/* Image */}
              <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.alt_text || selectedImage.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                />
              </div>
              
              {/* Image Details Sidebar */}
              <div className="lg:w-96 p-6 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto">
                <div className="space-y-6">
                  {/* Description */}
                  {selectedImage.description && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">Description</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedImage.description}</p>
                    </div>
                  )}
                  
                  {/* Metadata Cards */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900">Details</h4>
                    
                    {/* Category */}
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <span className="text-gray-700 font-medium">Category</span>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {selectedImage.category_name}
                      </span>
                    </div>
                    
                    {/* Hall */}
                    {selectedImage.hall_name && (
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
                        <span className="text-gray-700 font-medium">Hall</span>
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Hall {selectedImage.hall_section} - {selectedImage.hall_name}
                        </span>
                      </div>
                    )}
                    
                    {/* Views */}
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <EyeIcon />
                        Views
                      </span>
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {selectedImage.views.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Date Added */}
                    {selectedImage.formatted_date && (
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <span className="text-gray-700 font-medium">Added</span>
                        <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {selectedImage.formatted_date}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {selectedImage.tags_list && selectedImage.tags_list.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedImage.tags_list.map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors duration-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Loading overlay for view increment */}
            {viewingImage && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white rounded-2xl p-6 shadow-xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-100 border-t-blue-600"></div>
                  <span className="text-blue-700 font-medium">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;