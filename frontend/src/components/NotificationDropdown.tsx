// src/components/NotificationDropdown.tsx
import React from 'react';
import { CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'payment': return '💳';
      case 'admin': return '👤';
      case 'refund': return '💰';
      case 'feedback': return '💬';
      default: return '📢';
    }
  };

  return (
    <div className="max-h-96 overflow-y-auto">
      {recentNotifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications yet
        </div>
      ) : (
        <>
          <div className="p-2 border-b">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
          
          <div className="divide-y">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(notification.notification_type)}</span>
                      <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                        ●
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-500">{notification.time_ago} ago</span>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <Link
              to="/notifications"
              onClick={onClose}
              className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              View all notifications
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;