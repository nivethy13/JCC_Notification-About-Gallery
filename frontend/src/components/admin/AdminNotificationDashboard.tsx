import React, { useState, useEffect } from 'react';
import { Send, User, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { SendNotificationData, Notification } from '../../types/notification';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const AdminNotificationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'sent' | 'templates'>('send');
  const [sendForm, setSendForm] = useState<SendNotificationData>({
    title: '',
    message: '',
    notification_type: 'admin',
    priority: 'medium',
    user_ids: [],
    send_to_all: false,
    send_email: false
  });
  const [users, setUsers] = useState<User[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load real users from backend
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userData = await notificationService.getUsersList();
      // Filter out admin users from recipient list
      const regularUsers = userData.filter((user: User) => user.id !== 1); // Assuming user 1 is admin
      setUsers(regularUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to mock users if API fails
      setUsers([
        { id: 2, username: 'kali', email: 'kali@email.com', first_name: 'Kali', last_name: '' },
        { id: 3, username: 'nivethy', email: 'nivethy13@gmail.com', first_name: 'Nivethy', last_name: 'Vigneswaran' },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSentNotifications = async () => {
    try {
      const data = await notificationService.getSentNotifications();
      setSentNotifications(data);
    } catch (error) {
      console.error('Failed to load sent notifications:', error);
    }
  };

  useEffect(() => {
    loadUsers(); // Load users on component mount
  }, []);

  useEffect(() => {
    if (activeTab === 'sent') {
      loadSentNotifications();
    }
  }, [activeTab]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = {
        ...sendForm,
        user_ids: sendForm.send_to_all ? [] : selectedUsers
      };

      const result = await notificationService.sendNotification(data);
      setMessage({ type: 'success', text: result.message || 'Notification sent successfully!' });
      
      // Reset form
      setSendForm({
        title: '',
        message: '',
        notification_type: 'admin',
        priority: 'medium',
        user_ids: [],
        send_to_all: false,
        send_email: false
      });
      setSelectedUsers([]);
      
      // Reload sent notifications
      if (activeTab === 'sent') {
        loadSentNotifications();
      }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to send notification' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Predefined notification templates
  const templates = [
    {
      name: 'Booking Approved',
      title: 'Booking Approved',
      message: 'Your booking request has been approved. You will receive further details via email.',
      type: 'booking',
      priority: 'high'
    },
    {
      name: 'Payment Received',
      title: 'Payment Confirmation',
      message: 'We have received your payment. Your booking is now confirmed.',
      type: 'payment',
      priority: 'high'
    },
    {
      name: 'Maintenance Notice',
      title: 'Scheduled Maintenance',
      message: 'The system will undergo maintenance on [DATE]. Some services may be temporarily unavailable.',
      type: 'system',
      priority: 'medium'
    },
    {
      name: 'Welcome Message',
      title: 'Welcome to JCC',
      message: 'Welcome to Jaffna Cultural Centre! We are excited to have you as part of our community.',
      type: 'admin',
      priority: 'medium'
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useTemplate = (template: any) => {
    setSendForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      notification_type: template.type,
      priority: template.priority
    }));
    setActiveTab('send');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notification Management</h1>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Send Notification
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Sent Notifications
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Templates
            </button>
          </nav>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {message.text}
          </div>
        </div>
      )}

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSendNotification}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sendForm.title}
                    onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sendForm.message}
                    onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={sendForm.notification_type}
                      onChange={(e) => setSendForm(prev => ({ ...prev, notification_type: e.target.value }))}
                    >
                      <option value="admin">Admin</option>
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="system">System</option>
                      <option value="refund">Complaint</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={sendForm.priority}
                      onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={sendForm.send_to_all}
                      onChange={(e) => setSendForm(prev => ({ ...prev, send_to_all: e.target.checked }))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Send to all users</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={sendForm.send_email}
                      onChange={(e) => setSendForm(prev => ({ ...prev, send_email: e.target.checked }))}
                    />
                    <span className="ml-2 text-sm text-gray-700">Also send email notification</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || (!sendForm.send_to_all && selectedUsers.length === 0)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>

              {/* Right Column - User Selection */}
              {!sendForm.send_to_all && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recipients
                  </label>
                  {loadingUsers ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading users...</p>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {users.map((user) => (
                        <label key={user.id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name} ({user.username})
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </label>
                      ))}
                      {users.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No users available</p>
                      )}
                    </div>
                  )}
                  {selectedUsers.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      {selectedUsers.length} user(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Sent Notifications Tab */}
      {activeTab === 'sent' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recently Sent Notifications</h3>
              <button
                onClick={loadSentNotifications}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {sentNotifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
              ) : (
                sentNotifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{notification.notification_type}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded">{notification.priority}</span>
                          <span>{notification.time_ago} ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.type}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.priority}</span>
                    </div>
                    <button
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      onClick={() => useTemplate(template)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDashboard;