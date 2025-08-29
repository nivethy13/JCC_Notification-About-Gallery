# backend/about/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import About

@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ['hero_title', 'is_active', 'updated_at']
    readonly_fields = ['updated_at', 'hero_background_preview']
    
    def hero_background_preview(self, obj):
        if obj.hero_background:
            return format_html('<img src="{}" width="200" height="120" style="border-radius: 8px; object-fit: cover;" />', obj.hero_background.url)
        return "No background image"
    hero_background_preview.short_description = "Current Background"
    
    fieldsets = (
        ('Hero Section', {
            'fields': (
                'hero_title', 
                'hero_subtitle', 
                'hero_badge', 
                'hero_quote',
                'hero_background',
                'hero_background_preview'
            )
        }),
        ('Mission & Vision', {
            'fields': (
                ('mission_heading', 'mission_title'),
                'mission_subtitle', 
                'mission_description', 
                'mission_quote',
                'vision_title', 
                'vision_description', 
                'vision_quote'
            )
        }),
        ('Journey Timeline', {
            'fields': (
                ('timeline_heading', 'timeline_subtitle'),
                ('timeline_event_1_year', 'timeline_event_1_title'),
                'timeline_event_1_description',
                ('timeline_event_2_year', 'timeline_event_2_title'),
                'timeline_event_2_description',
                ('timeline_event_3_year', 'timeline_event_3_title'),
                'timeline_event_3_description',
            )
        }),
        ('Facilities Section', {
            'fields': (
                ('facilities_heading', 'facilities_subtitle'),
                ('facility_1_title', 'facility_1_description'),
                ('facility_2_title', 'facility_2_description'),
                ('facility_3_title', 'facility_3_description'),
                ('facility_4_title', 'facility_4_description'),
            )
        }),
        ('Cultural Programs', {
            'fields': (
                ('cultural_heading', 'cultural_subtitle'),
                ('cultural_1_title', 'cultural_1_description'),
                ('cultural_2_title', 'cultural_2_description'),
                ('cultural_3_title', 'cultural_3_description'),
            )
        }),
        ('Community Outreach', {
            'fields': (
                ('outreach_heading', 'outreach_subtitle'),
                ('outreach_1_title', 'outreach_1_description'),
                ('outreach_2_title', 'outreach_2_description'),
                ('outreach_3_title', 'outreach_3_description'),
            )
        }),
        ('Partnerships', {
            'fields': (
                ('partnerships_heading', 'partnerships_subtitle'),
                ('partnership_1_title', 'partnership_1_description'),
                ('partnership_2_title', 'partnership_2_description'),
            )
        }),
        ('Closing & Contact', {
            'fields': (
                'closing_title', 
                'closing_quote',
                ('address', 'phone', 'email'),
            )
        }),
        ('Settings', {
            'fields': ('is_active', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        # Only allow one About instance
        return not About.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Don't allow deleting the About instance
        return False