# backend/notifications/serializers.py
from rest_framework import serializers
from .models import Notification, NotificationTemplate, UserNotificationPreference, NotificationType, Priority
from django.contrib.auth.models import User

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 
                 'priority', 'created_at', 'read_at', 'sender_name', 'time_ago']
        
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at)

class SendNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=NotificationType.choices)
    priority = serializers.ChoiceField(choices=Priority.choices, default=Priority.MEDIUM)
    user_ids = serializers.ListField(child=serializers.IntegerField(), required=False)
    send_to_all = serializers.BooleanField(default=False)
    send_email = serializers.BooleanField(default=False)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'

class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationPreference
        fields = '__all__'