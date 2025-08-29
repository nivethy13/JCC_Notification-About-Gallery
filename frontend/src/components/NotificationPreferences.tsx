// src/components/NotificationPreferences.tsx
import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Volume2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { NotificationPreferences as INotificationPreferences } from '../types/notification';

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<INotificationPreferences>({
    user: 1, // Mock user ID
    email_enabled: true,
    app_enabled: true,
    sound_enabled: true,
    booking_notifications: true,
    payment_notifications: true,
    admin_notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await notificationService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof INotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* General Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">App Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications in the app</div>
                </div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.app_enabled}
                onChange={(e) => updatePreference('app_enabled', e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via email</div>
                </div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.email_enabled}
                onChange={(e) => updatePreference('email_enabled', e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Sound Notifications</div>
                  <div className="text-sm text-gray-500">Play sound for new notifications</div>
                </div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.sound_enabled}
                onChange={(e) => updatePreference('sound_enabled', e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Booking Notifications</div>
                <div className="text-sm text-gray-500">Booking confirmations, updates, and reminders</div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.booking_notifications}
                onChange={(e) => updatePreference('booking_notifications', e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Payment Notifications</div>
                <div className="text-sm text-gray-500">Payment confirmations and refund updates</div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.payment_notifications}
                onChange={(e) => updatePreference('payment_notifications', e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Admin Notifications</div>
                <div className="text-sm text-gray-500">Announcements and system updates</div>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={preferences.admin_notifications}
                onChange={(e) => updatePreference('admin_notifications', e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;