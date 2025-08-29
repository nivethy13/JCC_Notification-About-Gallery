# backend/notifications/management/commands/create_mock_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from notifications.models import Notification, NotificationTemplate, NotificationType, Priority
from notifications.services import NotificationService

class Command(BaseCommand):
    help = 'Create mock notification data for existing users'
    
    def handle(self, *args, **options):
        # Get existing users
        users = User.objects.all()
        if not users.exists():
            self.stdout.write(self.style.ERROR('No users found in database'))
            return
        
        # Get admin user (Amali)
        try:
            admin_user = User.objects.get(id=1)  # Amali
        except User.DoesNotExist:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                admin_user = User.objects.first()
        
        self.stdout.write(f"Using {admin_user.username} as admin sender")
        
        # Create notification templates
        templates = [
            {
                'name': 'Booking Confirmation',
                'subject': 'Booking Confirmed - {hall_name}',
                'email_template': 'Your booking for {hall_name} on {date} has been confirmed.',
                'app_template': 'Booking confirmed for {hall_name}',
                'notification_type': 'booking'
            },
            {
                'name': 'Payment Success',
                'subject': 'Payment Successful',
                'email_template': 'Your payment of ${amount} has been processed successfully.',
                'app_template': 'Payment of ${amount} successful',
                'notification_type': 'payment'
            }
        ]
        
        for template_data in templates:
            template, created = NotificationTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(f"Created template: {template.name}")
        
        # Create notifications for each user
        service = NotificationService()
        
        for user in users:
            if user.id == admin_user.id:
                continue  # Skip admin user
                
            # Create welcome notification
            result = service.send_notification(
                sender=admin_user,
                title=f'Welcome {user.first_name or user.username}!',
                message=f'Welcome to Jaffna Cultural Centre, {user.first_name or user.username}! You will receive important updates here.',
                notification_type=NotificationType.ADMIN,
                priority=Priority.MEDIUM,
                user_ids=[user.id]
            )
            
            # Create booking notification
            service.send_notification(
                sender=admin_user,
                title='Booking Confirmed',
                message=f'Your booking for Main Hall on 2024-12-25 has been confirmed.',
                notification_type=NotificationType.BOOKING,
                priority=Priority.HIGH,
                user_ids=[user.id]
            )
            
            # Create payment notification
            service.send_notification(
                sender=admin_user,
                title='Payment Successful',
                message='Your payment of $500 has been processed successfully.',
                notification_type=NotificationType.PAYMENT,
                priority=Priority.HIGH,
                user_ids=[user.id]
            )
            
            self.stdout.write(f"Created notifications for user: {user.username}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created mock data for {users.count()} users'
            )
        )