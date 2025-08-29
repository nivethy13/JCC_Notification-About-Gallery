// src/components/NotificationsPage.tsx 
import React, { useState } from 'react';
import { Search, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext'; // Fixed import path
import type { Notification } from '../types/notification';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, refreshNotifications, markAsRead, deleteNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.is_read) ||
                       (filterRead === 'unread' && !notification.is_read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'refund': return 'bg-yellow-100 text-yellow-800';
      case 'feedback': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="admin">Admin</option>
              <option value="refund">Refund</option>
              <option value="feedback">Feedback</option>
              <option value="system">System</option>
            </select>
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            
            <button
              onClick={refreshNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow border-l-4 p-6 ${getPriorityColor(notification.priority)} ${
                !notification.is_read ? 'ring-2 ring-blue-100' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.notification_type)}`}>
                      {notification.notification_type}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {notification.priority}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{notification.time_ago} ago</span>
                    {notification.sender_name && (
                      <span>From: {notification.sender_name}</span>
                    )}
                    <span>Created: {new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;