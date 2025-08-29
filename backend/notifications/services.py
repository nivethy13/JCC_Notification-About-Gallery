# backend/notifications/services.py
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from .models import Notification, NotificationTemplate, UserNotificationPreference
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class NotificationService:
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def send_notification(self, sender=None, title="", message="", notification_type="system", 
                         priority="medium", user_ids=None, send_to_all=False, send_email=False):
        """Send notification to users"""
        notifications_created = []
        
        # Determine recipients
        if send_to_all:
            users = User.objects.filter(is_active=True)
        elif user_ids:
            users = User.objects.filter(id__in=user_ids, is_active=True)
        else:
            # If no specific users, send to all non-admin users
            users = User.objects.filter(is_active=True, is_staff=False)
        
        # Create notifications for each user
        for user in users:
            # Check user preferences
            preferences = UserNotificationPreference.get_or_create_for_user(user)
            
            if not preferences.app_enabled:
                continue
                
            # Check type-specific preferences
            if notification_type == 'booking' and not preferences.booking_notifications:
                continue
            elif notification_type == 'payment' and not preferences.payment_notifications:
                continue
            elif notification_type == 'admin' and not preferences.admin_notifications:
                continue
            
            # Create notification
            notification = Notification.objects.create(
                user=user,
                sender=sender,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority
            )
            
            notifications_created.append(notification)
            
            # Send real-time notification
            self.send_realtime_notification(user.id, notification)
            
            # Send email if requested and user allows
            if send_email and preferences.email_enabled:
                self.send_email_notification(user, title, message)
        
        return {
            'success': True,
            'notifications_sent': len(notifications_created),
            'message': f'Sent {len(notifications_created)} notifications'
        }
    
    def send_realtime_notification(self, user_id, notification):
        """Send real-time notification via WebSocket"""
        if self.channel_layer:
            async_to_sync(self.channel_layer.group_send)(
                f"notifications_{user_id}",
                {
                    "type": "notification_message",
                    "notification": {
                        "id": notification.id,
                        "title": notification.title,
                        "message": notification.message,
                        "type": notification.notification_type,
                        "priority": notification.priority,
                        "created_at": notification.created_at.isoformat(),
                    }
                }
            )
    
    def send_email_notification(self, user, title, message):
        """Send email notification"""
        try:
            send_mail(
                subject=title,
                message=message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jcc.com'),
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f"📧 Email sent to {user.email}: {title}")
        except Exception as e:
            print(f"❌ Failed to send email to {user.email}: {str(e)}")