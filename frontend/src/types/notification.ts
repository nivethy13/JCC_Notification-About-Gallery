// src/types/notification.ts
export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'booking' | 'payment' | 'admin' | 'system' | 'refund' | 'feedback';
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  read_at?: string;
  sender_name?: string;
  time_ago: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
}

export interface NotificationPreferences {
  id?: number;
  user: number;
  email_enabled: boolean;
  app_enabled: boolean;
  sound_enabled: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  admin_notifications: boolean;
}

export interface SendNotificationData {
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  user_ids?: number[];
  send_to_all?: boolean;
  send_email?: boolean;
}

