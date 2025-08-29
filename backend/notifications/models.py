# backend/notifications/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class NotificationType(models.TextChoices):
    BOOKING = 'booking', 'Booking'
    PAYMENT = 'payment', 'Payment'
    ADMIN = 'admin', 'Admin'
    SYSTEM = 'system', 'System'

class Priority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=200)
    email_template = models.TextField()
    app_template = models.TextField()
    notification_type = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UserNotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_enabled = models.BooleanField(default=True)
    app_enabled = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)
    booking_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    admin_notifications = models.BooleanField(default=True)
    
    @classmethod
    def get_or_create_for_user(cls, user):
        preference, created = cls.objects.get_or_create(user=user)
        return preference