# backend/gallery/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Public Gallery URLs (same as before)
    path('images/', views.GalleryImageListView.as_view(), name='gallery-images'),
    path('images/<int:pk>/', views.GalleryImageDetailView.as_view(), name='gallery-image-detail'),
    path('categories/', views.GalleryCategoryListView.as_view(), name='gallery-categories'),
    path('halls/', views.HallListView.as_view(), name='halls'),
    
    # Admin URLs - NO AUTHENTICATION REQUIRED (removed /admin/ prefix for easier access)
    path('manage/images/', views.AdminGalleryImageListCreateView.as_view(), name='manage-gallery-images'),
    path('manage/images/<int:pk>/', views.AdminGalleryImageDetailView.as_view(), name='manage-gallery-image-detail'),
    path('manage/categories/', views.AdminGalleryCategoryListCreateView.as_view(), name='manage-gallery-categories'),
    path('manage/categories/<int:pk>/', views.AdminGalleryCategoryDetailView.as_view(), name='manage-gallery-category-detail'),
    path('manage/images/bulk-delete/', views.bulk_delete_images, name='bulk-delete-images'),
    path('manage/images/bulk-update/', views.bulk_update_images, name='bulk-update-images'),
    
    # Keep admin URLs for backward compatibility
    path('admin/images/', views.AdminGalleryImageListCreateView.as_view(), name='admin-gallery-images'),
    path('admin/images/<int:pk>/', views.AdminGalleryImageDetailView.as_view(), name='admin-gallery-image-detail'),
    path('admin/categories/', views.AdminGalleryCategoryListCreateView.as_view(), name='admin-gallery-categories'),
    path('admin/categories/<int:pk>/', views.AdminGalleryCategoryDetailView.as_view(), name='admin-gallery-category-detail'),
    path('admin/images/bulk-delete/', views.bulk_delete_images, name='admin-bulk-delete-images'),
    path('admin/images/bulk-update/', views.bulk_update_images, name='admin-bulk-update-images'),
]