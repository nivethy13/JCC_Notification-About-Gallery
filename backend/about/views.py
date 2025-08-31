from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny


from .models import About
from .serializers import AboutSerializer

# About Page Views
@api_view(['GET'])
@permission_classes([AllowAny])
def about_page_content(request):
    """
    Get About page content
    """
    about_obj = About.objects.filter(is_active=True).first()
    if about_obj:
        serializer = AboutSerializer(about_obj, context={'request': request})
        return Response(serializer.data)
    return Response({'message': 'No about content found'}, status=404)

class AboutDetailView(generics.RetrieveUpdateAPIView):
    """Get or update About page content"""
    serializer_class = AboutSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # ADD THIS LINE - No authentication needed
    
    def get_object(self):
        # Get the active About instance or create one
        about_obj, created = About.objects.get_or_create(
            is_active=True,
            defaults={'hero_title': 'About Jaffna Cultural Centre'}
        )
        return about_obj