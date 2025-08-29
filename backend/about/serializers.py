from rest_framework import serializers
from .models import About

class AboutSerializer(serializers.ModelSerializer):
    hero_background_url = serializers.SerializerMethodField()
    
    class Meta:
        model = About
        fields = '__all__'
        
    def get_hero_background_url(self, obj):
        if obj.hero_background:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.hero_background.url)
            return obj.hero_background.url
        return None