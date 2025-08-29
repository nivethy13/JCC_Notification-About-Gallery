# backend/notifications/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Customer endpoints
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:notification_id>/mark-read/', views.mark_notification_read, name='mark-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete-notification'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('preferences/', views.notification_preferences, name='notification-preferences'),
    
    # Admin endpoints
    path('admin/send/', views.send_notification, name='admin-send-notification'),
    path('admin/sent/', views.sent_notifications, name='admin-sent-notifications'),
    path('admin/users/', views.get_users_list, name='get-users-list'),
    
    # Test endpoint
    path('test-send/', views.send_test_notification, name='test-send'),
]


# # backend/notifications/urls.py
# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.NotificationListView.as_view(), name='notification-list'),
#     path('stats/', views.notification_stats, name='notification-stats'),
#     path('<int:notification_id>/mark-read/', views.mark_notification_read, name='mark-read'),
#     path('test-send/', views.send_test_notification, name='test-send'),
#     # Optional alias so it "looks" like a real admin endpoint:
#     path('admin/send/', views.send_test_notification, name='admin-send-alias'),
# ]
