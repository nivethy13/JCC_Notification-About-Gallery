from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'JCC Booking System',
        'version': '1.0.0'
    })

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/notifications/', include('notifications.urls')),
    path('api/about/', include('about.urls')),
    path('api/gallery/', include('gallery.urls')),

    path('api/health/', api_health_check, name='health-check'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Also serve from STATICFILES_DIRS
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()

# Customize admin
admin.site.site_header = "JCC Booking System Admin"
admin.site.site_title = "JCC Admin Portal"
admin.site.index_title = "Welcome to JCC Booking System"