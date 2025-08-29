// src/components/NotificationBell.tsx
import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { stats } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <Bell className="w-6 h-6" />
        {stats.unread_notifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {stats.unread_notifications > 99 ? '99+' : stats.unread_notifications}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NotificationDropdown onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;