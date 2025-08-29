# backend/gallery/views.py
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import GalleryImage, GalleryCategory, Hall
from .serializers import GalleryImageSerializer, GalleryCategorySerializer, HallSerializer
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import logging

logger = logging.getLogger(__name__)

# Public Gallery Views (no authentication required)
class GalleryImageListView(generics.ListAPIView):
    """Public view for listing gallery images"""
    serializer_class = GalleryImageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'hall', 'is_featured']
    search_fields = ['title', 'description', 'tags']
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return GalleryImage.objects.filter(is_public=True)

class GalleryImageDetailView(generics.RetrieveAPIView):
    """Public view for individual image details"""
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return GalleryImage.objects.filter(is_public=True)
    
    def get_object(self):
        obj = super().get_object()
        # Increment view count
        obj.increment_views()
        return obj

class GalleryCategoryListView(generics.ListAPIView):
    """Public view for categories"""
    queryset = GalleryCategory.objects.filter(is_active=True)
    serializer_class = GalleryCategorySerializer
    permission_classes = [AllowAny]

class HallListView(generics.ListAPIView):
    """Public view for halls"""
    queryset = Hall.objects.filter(is_active=True)
    serializer_class = HallSerializer
    permission_classes = [AllowAny]

# Admin Views (NO AUTHENTICATION REQUIRED)
class AdminGalleryImageListCreateView(generics.ListCreateAPIView):
    """Admin view for managing images - NO AUTH REQUIRED"""
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'hall', 'is_public', 'is_featured']
    search_fields = ['title', 'description']
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        """Handle image upload to Cloudinary with better error handling"""
        image_file = self.request.FILES.get('image')
        
        cloudinary_url = None
        cloudinary_thumbnail_url = None
        cloudinary_public_id = None
        file_size = 0
        width = 0
        height = 0
        
        if image_file:
            file_size = image_file.size
            
            try:
                # Get image dimensions
                from PIL import Image
                img = Image.open(image_file)
                width, height = img.size
                image_file.seek(0)  # Reset file pointer
            except Exception as e:
                logger.warning(f"Could not get image dimensions: {e}")
            
            # Try to upload to Cloudinary
            try:
                # Upload main image
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="gallery/images",
                    transformation=[
                        {'quality': 'auto'},
                        {'fetch_format': 'auto'}
                    ],
                    resource_type="image",
                    use_filename=True,
                    unique_filename=True,
                )
                
                cloudinary_url = upload_result['secure_url']
                cloudinary_public_id = upload_result['public_id']
                
                # Generate thumbnail URL (don't upload separately)
                cloudinary_thumbnail_url = cloudinary.CloudinaryImage(cloudinary_public_id).build_url(
                    width=300,
                    height=300,
                    crop="fill",
                    quality="auto",
                    fetch_format="auto"
                )
                
                logger.info(f"Successfully uploaded to Cloudinary: {cloudinary_public_id}")
                
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}")
                # Continue without Cloudinary - save locally instead
                cloudinary_url = None
                cloudinary_thumbnail_url = None
                cloudinary_public_id = None
        
        # Save with Cloudinary URLs if successful, otherwise just local
        # NO USER ASSIGNMENT - remove uploaded_by field
        serializer.save(
            cloudinary_url=cloudinary_url,
            cloudinary_thumbnail_url=cloudinary_thumbnail_url,
            cloudinary_public_id=cloudinary_public_id,
            file_size=file_size,
            width=width,
            height=height
        )

class AdminGalleryImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view for individual image management - NO AUTH REQUIRED"""
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]
    
    def perform_update(self, serializer):
        """Handle image update"""
        try:
            serializer.save()
        except Exception as e:
            logger.error(f"Update failed: {e}")
            raise
    
    def perform_destroy(self, instance):
        """Delete image from Cloudinary when deleting from database"""
        try:
            if instance.cloudinary_public_id:
                # Delete from Cloudinary
                cloudinary.uploader.destroy(instance.cloudinary_public_id)
                logger.info(f"Deleted from Cloudinary: {instance.cloudinary_public_id}")
        except Exception as e:
            logger.error(f"Error deleting from Cloudinary: {e}")
            # Continue with database deletion even if Cloudinary fails
        
        # Delete from database
        instance.delete()

class AdminGalleryCategoryListCreateView(generics.ListCreateAPIView):
    """Admin view for category management - NO AUTH REQUIRED"""
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [AllowAny]

class AdminGalleryCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view for individual category management - NO AUTH REQUIRED"""
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def bulk_delete_images(request):
    """Bulk delete images from both database and Cloudinary - NO AUTH REQUIRED"""
    image_ids = request.data.get('image_ids', [])
    if not image_ids:
        return Response({'error': 'No image IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get images to delete
        images_to_delete = GalleryImage.objects.filter(id__in=image_ids)
        deleted_count = images_to_delete.count()
        
        # Delete from Cloudinary first
        for image in images_to_delete:
            try:
                if image.cloudinary_public_id:
                    cloudinary.uploader.destroy(image.cloudinary_public_id)
                    logger.info(f"Deleted from Cloudinary: {image.cloudinary_public_id}")
            except Exception as e:
                logger.error(f"Error deleting image {image.id} from Cloudinary: {e}")
        
        # Delete from database
        images_to_delete.delete()
        
        return Response({'message': f'Deleted {deleted_count} images successfully'})
    except Exception as e:
        logger.error(f"Bulk delete failed: {e}")
        return Response(
            {'error': f'Failed to delete images: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def bulk_update_images(request):
    """Bulk update multiple images - NO AUTH REQUIRED"""
    image_ids = request.data.get('image_ids', [])
    update_data = request.data.get('update_data', {})
    
    if not image_ids:
        return Response({'error': 'No image IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not update_data:
        return Response({'error': 'No update data provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Filter out fields that shouldn't be bulk updated
        allowed_fields = ['category', 'hall', 'is_featured', 'is_public', 'tags']
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not filtered_data:
            return Response({'error': 'No valid update data provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = GalleryImage.objects.filter(id__in=image_ids).update(**filtered_data)
        
        return Response({
            'message': f'Updated {updated_count} images successfully',
            'updated_count': updated_count
        })
    except Exception as e:
        logger.error(f"Bulk update failed: {e}")
        return Response(
            {'error': f'Failed to update images: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Additional utility views
@api_view(['GET'])
@permission_classes([AllowAny])
def gallery_stats(request):
    """Get gallery statistics - NO AUTH REQUIRED"""
    try:
        stats = {
            'total_images': GalleryImage.objects.count(),
            'public_images': GalleryImage.objects.filter(is_public=True).count(),
            'featured_images': GalleryImage.objects.filter(is_featured=True).count(),
            'total_views': sum(img.views for img in GalleryImage.objects.all()),
            'categories_count': GalleryCategory.objects.filter(is_active=True).count(),
            'halls_count': Hall.objects.filter(is_active=True).count(),
        }
        return Response(stats)
    except Exception as e:
        logger.error(f"Stats fetch failed: {e}")
        return Response(
            {'error': f'Failed to fetch stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_images(request):
    """Get featured images only - NO AUTH REQUIRED"""
    try:
        featured = GalleryImage.objects.filter(is_featured=True, is_public=True)
        serializer = GalleryImageSerializer(featured, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Featured images fetch failed: {e}")
        return Response(
            {'error': f'Failed to fetch featured images: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def search_images(request):
    """Advanced image search - NO AUTH REQUIRED"""
    try:
        query = request.data.get('query', '')
        category = request.data.get('category')
        hall = request.data.get('hall')
        is_featured = request.data.get('is_featured')
        
        queryset = GalleryImage.objects.filter(is_public=True)
        
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) | 
                Q(tags__icontains=query)
            )
        
        if category:
            queryset = queryset.filter(category=category)
            
        if hall:
            queryset = queryset.filter(hall=hall)
            
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured)
        
        serializer = GalleryImageSerializer(queryset, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return Response(
            {'error': f'Search failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )