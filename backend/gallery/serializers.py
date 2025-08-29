# backend/gallery/serializers.py
from rest_framework import serializers
from .models import GalleryImage, GalleryCategory, Hall
from django.contrib.auth.models import User

class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ['id', 'name', 'section_number', 'capacity', 'is_active']

class GalleryCategorySerializer(serializers.ModelSerializer):
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryCategory
        fields = ['id', 'name', 'description', 'image_count', 'is_active']
    
    def get_image_count(self, obj):
        return obj.images.filter(is_public=True).count()

class GalleryImageSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    hall_name = serializers.CharField(source='hall.name', read_only=True)
    hall_section = serializers.CharField(source='hall.section_number', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    tags_list = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    file_size_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryImage
        fields = [
            'id', 'title', 'description', 'image', 'thumbnail', 
            'category', 'category_name', 'hall', 'hall_name', 'hall_section',
            'upload_date', 'formatted_date', 'views', 'is_featured', 
            'is_public', 'tags', 'tags_list', 'alt_text',
            'uploaded_by_name', 'file_size', 'file_size_formatted',
            'width', 'height'
        ]
        read_only_fields = ['views', 'upload_date', 'uploaded_by']
        extra_kwargs = {
            'category': {'required': False},
            'hall': {'required': False},
        }
    
    def get_tags_list(self, obj):
        return obj.get_tags_list()
    
    def get_formatted_date(self, obj):
        return obj.upload_date.strftime("%B %d, %Y")
    
    def get_file_size_formatted(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size} B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size // 1024} KB"
            else:
                return f"{obj.file_size // (1024 * 1024)} MB"
        return "Unknown"

