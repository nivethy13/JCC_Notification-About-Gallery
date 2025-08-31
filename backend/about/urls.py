# backend/about/urls.py
# from django.urls import path
# from . import views

# urlpatterns = [
#     # Public endpoints
#     path('', views.AboutUsPublicView.as_view(), name='about-us-detail'),
    
#     # Admin endpoints (NO AUTHENTICATION REQUIRED)
#     path('update/', views.update_about_us, name='about-us-update'),
#     path('images/upload/', views.upload_additional_image, name='upload-about-image'),
#     path('images/<int:image_id>/delete/', views.delete_image, name='delete-about-image'),
#     path('images/<int:image_id>/caption/', views.update_image_caption, name='update-image-caption'),
#     path('images/reorder/', views.reorder_images, name='reorder-images'),
# ]

from django.urls import path
from . import views

urlpatterns = [
    # About Page APIs
    path('', views.about_page_content, name='about-content'),
    path('content/', views.AboutDetailView.as_view(), name='about-content-detail'),    
    
]

# # Gallery APIs (Separate from About)
    # path('gallery/', views.GalleryListCreateView.as_view(), name='gallery-list-create'),
    # path('gallery/<int:pk>/', views.GalleryDetailView.as_view(), name='gallery-detail'),
    # path('gallery/category/<str:category>/', views.gallery_by_category, name='gallery-by-category'),
    # path('gallery/featured/', views.gallery_featured, name='gallery-featured'),
    
    # # Gallery Management Utilities
    # path('gallery/reorder/', views.reorder_gallery, name='reorder-gallery'),
    # path('gallery/bulk-toggle/', views.bulk_toggle_gallery, name='bulk-toggle-gallery'),