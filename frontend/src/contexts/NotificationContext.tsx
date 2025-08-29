
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Notification, NotificationStats } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { useWebSocket } from '../hooks/useWebSocket';

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats;
  loading: boolean;
  refreshNotifications: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  wsStatus: {
    isConnected: boolean;
    reconnect: () => void;
    connectionAttempts: number;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userId: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total_notifications: 0,
    unread_notifications: 0,
    read_notifications: 0
  });
  const [loading, setLoading] = useState(false);
  const processedNotifications = useRef(new Set<number>());

  const handleNewNotification = useCallback((newNotification: Notification) => {
    // Prevent duplicate processing
    if (processedNotifications.current.has(newNotification.id)) {
      console.log('Duplicate notification prevented:', newNotification.id);
      return;
    }

    processedNotifications.current.add(newNotification.id);
    
    setNotifications(prev => {
      // Double-check for duplicates in state
      const exists = prev.some(notif => notif.id === newNotification.id);
      if (exists) return prev;
      
      return [newNotification, ...prev];
    });
    
    setStats(prev => ({
      total_notifications: prev.total_notifications + 1,
      unread_notifications: prev.unread_notifications + 1,
      read_notifications: prev.read_notifications
    }));
    
    // Play notification sound
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
       
      audio.play().catch(() => console.log('Could not play notification sound'));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.log('Audio not available');
    }
  }, []);

  const { isConnected, reconnect, connectionAttempts } = useWebSocket({ 
    userId, 
    onNewNotification: handleNewNotification,
    enabled: true
  });

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getStats(userId)
      ]);
      
      setNotifications(notificationsData.results || []);
      setStats(statsData);
      
      // Clear processed notifications cache when refreshing
      processedNotifications.current.clear();
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setStats(prev => ({
        ...prev,
        unread_notifications: Math.max(0, prev.unread_notifications - 1),
        read_notifications: prev.read_notifications + 1
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setStats(prev => ({
        ...prev,
        unread_notifications: 0,
        read_notifications: prev.total_notifications
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n.id === id);
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setStats(prev => ({
        total_notifications: Math.max(0, prev.total_notifications - 1),
        unread_notifications: deletedNotif?.is_read ? prev.unread_notifications : Math.max(0, prev.unread_notifications - 1),
        read_notifications: deletedNotif?.is_read ? Math.max(0, prev.read_notifications - 1) : prev.read_notifications
      }));
      
      // Remove from processed cache
      processedNotifications.current.delete(id);
      
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  useEffect(() => {
    notificationService.setToken('mock-jwt-token');
    refreshNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        stats,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        wsStatus: {
          isConnected,
          reconnect,
          connectionAttempts
        }
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};