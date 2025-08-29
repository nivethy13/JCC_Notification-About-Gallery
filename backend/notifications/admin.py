# # backend/notifications/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from django.urls import reverse
# from django.utils.safestring import mark_safe
# from django.db.models import Count, Q
# from django.contrib.auth.models import User
# from .models import Notification, NotificationTemplate, UserNotificationPreference
# from .services import NotificationService

# @admin.register(Notification)
# class NotificationAdmin(admin.ModelAdmin):
#     list_display = [
#         'title', 'user_link', 'notification_type', 'priority', 
#         'is_read', 'is_email_sent', 'sender_link', 'created_at'
#     ]
#     list_filter = [
#         'notification_type', 'priority', 'is_read', 'is_email_sent', 
#         'created_at', 'sender'
#     ]
#     search_fields = ['title', 'message', 'user__username', 'user__email']
#     readonly_fields = ['created_at', 'read_at']
#     date_hierarchy = 'created_at'
#     ordering = ['-created_at']
    
#     fieldsets = (
#         ('Notification Details', {
#             'fields': ('title', 'message', 'notification_type', 'priority')
#         }),
#         ('Recipients & Sender', {
#             'fields': ('user', 'sender')
#         }),
#         ('Status', {
#             'fields': ('is_read', 'is_email_sent', 'read_at')
#         }),
#         ('Timestamps', {
#             'fields': ('created_at',),
#             'classes': ('collapse',)
#         }),
#     )
    
#     actions = ['mark_as_read', 'mark_as_unread', 'send_email_notification']
    
#     def user_link(self, obj):
#         if obj.user:
#             url = reverse('admin:auth_user_change', args=[obj.user.id])
#             return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)
#         return '-'
#     user_link.short_description = 'User'
#     user_link.admin_order_field = 'user__username'
    
#     def sender_link(self, obj):
#         if obj.sender:
#             url = reverse('admin:auth_user_change', args=[obj.sender.id])
#             return format_html('<a href="{}">{}</a>', url, obj.sender.get_full_name() or obj.sender.username)
#         return 'System'
#     sender_link.short_description = 'Sender'
#     sender_link.admin_order_field = 'sender__username'
    
#     def mark_as_read(self, request, queryset):
#         updated = 0
#         for notification in queryset.filter(is_read=False):
#             notification.mark_as_read()
#             updated += 1
#         self.message_user(request, f'{updated} notifications marked as read.')
#     mark_as_read.short_description = 'Mark selected notifications as read'
    
#     def mark_as_unread(self, request, queryset):
#         updated = queryset.filter(is_read=True).update(is_read=False, read_at=None)
#         self.message_user(request, f'{updated} notifications marked as unread.')
#     mark_as_unread.short_description = 'Mark selected notifications as unread'
    
#     def send_email_notification(self, request, queryset):
#         service = NotificationService()
#         sent = 0
#         for notification in queryset.filter(is_email_sent=False):
#             try:
#                 service.send_email_notification(
#                     notification.user, 
#                     notification.title, 
#                     notification.message
#                 )
#                 notification.is_email_sent = True
#                 notification.save()
#                 sent += 1
#             except Exception as e:
#                 self.message_user(request, f'Error sending email for {notification.title}: {str(e)}', level='ERROR')
        
#         if sent > 0:
#             self.message_user(request, f'{sent} email notifications sent.')
#     send_email_notification.short_description = 'Send email notifications'
    
#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related('user', 'sender')

# @admin.register(NotificationTemplate)
# class NotificationTemplateAdmin(admin.ModelAdmin):
#     list_display = ['name', 'notification_type', 'is_active', 'created_at']
#     list_filter = ['notification_type', 'is_active', 'created_at']
#     search_fields = ['name', 'subject', 'notification_type']
#     ordering = ['name']
    
#     fieldsets = (
#         ('Template Info', {
#             'fields': ('name', 'notification_type', 'is_active')
#         }),
#         ('Email Template', {
#             'fields': ('subject', 'email_template'),
#             'description': 'Email template content with variables like {user_name}, {hall_name}, etc.'
#         }),
#         ('App Template', {
#             'fields': ('app_template',),
#             'description': 'In-app notification template (shorter version)'
#         }),
#     )
    
#     actions = ['activate_templates', 'deactivate_templates', 'test_template']
    
#     def activate_templates(self, request, queryset):
#         updated = queryset.update(is_active=True)
#         self.message_user(request, f'{updated} templates activated.')
#     activate_templates.short_description = 'Activate selected templates'
    
#     def deactivate_templates(self, request, queryset):
#         updated = queryset.update(is_active=False)
#         self.message_user(request, f'{updated} templates deactivated.')
#     deactivate_templates.short_description = 'Deactivate selected templates'
    
#     def test_template(self, request, queryset):
#         # This would send a test notification using the template
#         for template in queryset:
#             # You can implement test notification logic here
#             pass
#         self.message_user(request, f'Test notifications would be sent for {queryset.count()} templates.')
#     test_template.short_description = 'Send test notifications'

# @admin.register(UserNotificationPreference)
# class UserNotificationPreferenceAdmin(admin.ModelAdmin):
#     list_display = [
#         'user_link', 'email_enabled', 'app_enabled', 'sound_enabled',
#         'booking_notifications', 'payment_notifications', 'admin_notifications'
#     ]
#     list_filter = [
#         'email_enabled', 'app_enabled', 'sound_enabled',
#         'booking_notifications', 'payment_notifications', 'admin_notifications'
#     ]
#     search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
#     ordering = ['user__username']
    
#     fieldsets = (
#         ('User', {
#             'fields': ('user',)
#         }),
#         ('General Preferences', {
#             'fields': ('email_enabled', 'app_enabled', 'sound_enabled')
#         }),
#         ('Notification Types', {
#             'fields': ('booking_notifications', 'payment_notifications', 'admin_notifications')
#         }),
#     )
    
#     def user_link(self, obj):
#         if obj.user:
#             url = reverse('admin:auth_user_change', args=[obj.user.id])
#             return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)
#         return '-'
#     user_link.short_description = 'User'
#     user_link.admin_order_field = 'user__username'
    
#     actions = ['enable_all_notifications', 'disable_email_notifications', 'reset_preferences']
    
#     def enable_all_notifications(self, request, queryset):
#         updated = queryset.update(
#             email_enabled=True,
#             app_enabled=True,
#             sound_enabled=True,
#             booking_notifications=True,
#             payment_notifications=True,
#             admin_notifications=True
#         )
#         self.message_user(request, f'{updated} user preferences updated to enable all notifications.')
#     enable_all_notifications.short_description = 'Enable all notifications for selected users'
    
#     def disable_email_notifications(self, request, queryset):
#         updated = queryset.update(email_enabled=False)
#         self.message_user(request, f'{updated} users will no longer receive email notifications.')
#     disable_email_notifications.short_description = 'Disable email notifications'
    
#     def reset_preferences(self, request, queryset):
#         updated = queryset.update(
#             email_enabled=True,
#             app_enabled=True,
#             sound_enabled=True,
#             booking_notifications=True,
#             payment_notifications=True,
#             admin_notifications=True
#         )
#         self.message_user(request, f'{updated} user preferences reset to defaults.')
#     reset_preferences.short_description = 'Reset to default preferences'

# # Custom admin view for notification analytics
# class NotificationAnalyticsAdmin(admin.ModelAdmin):
#     """Custom admin view for notification analytics"""
#     change_list_template = 'admin/notifications/notification_analytics.html'
    
#     def changelist_view(self, request, extra_context=None):
#         # Analytics data
#         response = super().changelist_view(request, extra_context=extra_context)
        
#         try:
#             # Get notification statistics
#             total_notifications = Notification.objects.count()
#             unread_notifications = Notification.objects.filter(is_read=False).count()
            
#             # Notifications by type
#             notifications_by_type = Notification.objects.values('notification_type').annotate(
#                 count=Count('id')
#             ).order_by('-count')
            
#             # Notifications by priority
#             notifications_by_priority = Notification.objects.values('priority').annotate(
#                 count=Count('id')
#             ).order_by('-count')
            
#             # Recent activity (last 7 days)
#             from datetime import datetime, timedelta
#             last_week = datetime.now() - timedelta(days=7)
#             recent_activity = Notification.objects.filter(
#                 created_at__gte=last_week
#             ).values('created_at__date').annotate(
#                 count=Count('id')
#             ).order_by('created_at__date')
            
#             # Top users by notification count
#             top_users = User.objects.annotate(
#                 notification_count=Count('notifications')
#             ).filter(notification_count__gt=0).order_by('-notification_count')[:10]
            
#             extra_context = extra_context or {}
#             extra_context.update({
#                 'total_notifications': total_notifications,
#                 'unread_notifications': unread_notifications,
#                 'read_rate': round((total_notifications - unread_notifications) / total_notifications * 100, 1) if total_notifications > 0 else 0,
#                 'notifications_by_type': notifications_by_type,
#                 'notifications_by_priority': notifications_by_priority,
#                 'recent_activity': recent_activity,
#                 'top_users': top_users,
#             })
            
#         except Exception as e:
#             extra_context = extra_context or {}
#             extra_context['error'] = str(e)
        
#         response.context_data.update(extra_context)
#         return response

# # Register the analytics view
# # admin.site.register(Notification, NotificationAnalyticsAdmin)

# # Customize Django admin
# admin.site.site_header = "JCC Notification System"
# admin.site.site_title = "JCC Admin"
# admin.site.index_title = "Notification Management Dashboard"

# backend/notifications/admin.py
from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'notification_type', 'priority', 'is_read', 'created_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username']
    ordering = ['-created_at']