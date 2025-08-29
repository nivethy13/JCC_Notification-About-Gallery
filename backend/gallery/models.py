# backend/gallery/models.py
from django.db import models
from django.utils import timezone
import os

def gallery_image_path(instance, filename):
    return f'gallery/{instance.category}/{filename}'

class GalleryCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Gallery Categories"
    
    def __str__(self):
        return self.name

class Hall(models.Model):
    name = models.CharField(max_length=100)
    section_number = models.IntegerField(unique=True)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Hall {self.section_number} - {self.name}"

class GalleryImage(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Use regular ImageField but upload to Cloudinary via views
    image = models.ImageField(upload_to=gallery_image_path, blank=True, null=True)
    thumbnail = models.ImageField(upload_to='gallery/thumbnails/', blank=True, null=True)
    
    # Store Cloudinary URLs separately
    cloudinary_url = models.URLField(blank=True, null=True)
    cloudinary_thumbnail_url = models.URLField(blank=True, null=True)
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    
    category = models.ForeignKey(GalleryCategory, on_delete=models.CASCADE, related_name='images')
    hall = models.ForeignKey(Hall, on_delete=models.SET_NULL, null=True, blank=True, related_name='gallery_images')
    
    # Metadata - NO USER FIELD
    upload_date = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    
    # SEO and Tags
    tags = models.CharField(max_length=500, blank=True, help_text="Comma separated tags")
    alt_text = models.CharField(max_length=200, blank=True)
    
    # Image details
    file_size = models.PositiveIntegerField(default=0, help_text="File size in bytes")
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-upload_date']
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])
    
    def get_tags_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
    
    def get_image_url(self):
        """Return Cloudinary URL if available, otherwise local URL"""
        if self.cloudinary_url:
            return self.cloudinary_url
        elif self.image:
            return self.image.url
        return None
    
    def get_thumbnail_url(self):
        """Return Cloudinary thumbnail URL if available, otherwise local thumbnail URL"""
        if self.cloudinary_thumbnail_url:
            return self.cloudinary_thumbnail_url
        elif self.cloudinary_url:
            
            base_url = self.cloudinary_url.split('/upload/')[0]
            path = self.cloudinary_url.split('/upload/')[1]
            return f"{base_url}/upload/w_300,h_300,c_fill/{path}"
        elif self.thumbnail:
            return self.thumbnail.url
        elif self.image:
            return self.image.url
        return None