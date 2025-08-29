# backend/notifications/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from .models import Notification, NotificationTemplate, UserNotificationPreference
from .serializers import (NotificationSerializer, SendNotificationSerializer, 
                         NotificationTemplateSerializer, UserNotificationPreferenceSerializer)
from .services import NotificationService

class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]  # Temporarily allow all for testing
    pagination_class = NotificationPagination
    
    def get_queryset(self):
        # Try to get user from query parameter or use first available user
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                user = User.objects.first()
        else:
            user = User.objects.first()
        
        if not user:
            return Notification.objects.none()
        
        queryset = Notification.objects.filter(user=user)
        
        # If no notifications exist for this user, create some
        if not queryset.exists():
            self.create_mock_notifications_for_user(user)
            queryset = Notification.objects.filter(user=user)
        
        # Filter by type
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
            
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
            
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(message__icontains=search)
            )
            
        return queryset
    
    def create_mock_notifications_for_user(self, user):
        # Get admin user (Amali - user id 1)
        try:
            admin_user = User.objects.get(id=1)  # Amali
        except User.DoesNotExist:
            admin_user = None
        
        # Create mock notifications for the specific user
        mock_notifications = [
            {
                'title': f'Welcome {user.first_name}!',
                'message': f'Welcome to Jaffna Cultural Centre notification system, {user.first_name}!',
                'notification_type': 'admin',
                'priority': 'medium',
                'sender': admin_user,
            },
            {
                'title': 'Booking Confirmed',
                'message': 'Your booking for Main Hall on 2024-12-25 has been confirmed.',
                'notification_type': 'booking',
                'priority': 'high',
                'sender': admin_user,
            },
            {
                'title': 'Payment Successful',
                'message': 'Your payment of $500 has been processed successfully.',
                'notification_type': 'payment',
                'priority': 'high',
                'sender': admin_user,
            }
        ]
        
        for notif_data in mock_notifications:
            Notification.objects.get_or_create(
                user=user,
                title=notif_data['title'],
                defaults=notif_data
            )

@api_view(['POST'])
@permission_classes([AllowAny])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.mark_as_read()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_read(request):
    user_id = request.data.get('user_id', 1)  # Default to user 1 if not specified
    try:
        user = User.objects.get(id=user_id)
        Notification.objects.filter(user=user, is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({'status': 'success'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_notification(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.delete()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def notification_stats(request):
    user_id = request.query_params.get('user_id', 1)  # Default to user 1
    try:
        user = User.objects.get(id=user_id)
        total = Notification.objects.filter(user=user).count()
        unread = Notification.objects.filter(user=user, is_read=False).count()
        
        return Response({
            'total_notifications': total,
            'unread_notifications': unread,
            'read_notifications': total - unread
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# Admin Views
@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily allow all for testing
def send_notification(request):
    serializer = SendNotificationSerializer(data=request.data)
    if serializer.is_valid():
        service = NotificationService()
        
        # Use Amali as the sender (admin user)
        try:
            sender = User.objects.get(id=1)  # Amali
        except User.DoesNotExist:
            sender = User.objects.filter(is_staff=True).first()
        
        result = service.send_notification(
            sender=sender,
            **serializer.validated_data
        )
        return Response(result)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def sent_notifications(request):
    notifications = Notification.objects.filter(sender__isnull=False).order_by('-created_at')[:50]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_users_list(request):
    """Get list of users for admin to select from"""
    users = User.objects.filter(is_active=True).values('id', 'username', 'first_name', 'last_name', 'email')
    return Response(list(users))

# Preferences Views
@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def notification_preferences(request):
    user_id = request.query_params.get('user_id', request.data.get('user_id', 1))
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    preference = UserNotificationPreference.get_or_create_for_user(user)
    
    if request.method == 'GET':
        serializer = UserNotificationPreferenceSerializer(preference)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserNotificationPreferenceSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_test_notification(request):
    """Send a test notification via WebSocket"""
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    user_id = request.data.get('user_id', 1)  # Default to user 1
    
    channel_layer = get_channel_layer()
    
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f"notifications_{user_id}",
            {
                "type": "notification_message",
                "notification": {
                    "id": 999,
                    "title": "Test Notification",
                    "message": f"This is a test notification sent to user {user_id} via WebSocket!",
                    "type": "admin",
                    "priority": "medium",
                    "created_at": timezone.now().isoformat(),
                }
            }
        )
        return Response({'status': f'Test notification sent to user {user_id}!'})
    else:
        return Response({'error': 'Channel layer not available'}, status=500)