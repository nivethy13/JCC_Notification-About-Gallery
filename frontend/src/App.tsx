
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationBell from './components/NotificationBell';
import NotificationsPage from './components/NotificationsPage';
import AdminNotificationDashboard from './components/admin/AdminNotificationDashboard';
import NotificationPreferences from './components/NotificationPreferences';
import WebSocketStatus from './components/WebSocketStatus';

import AboutUs from './pages/About'; 
import AboutManagement from './components/admin/AboutManagement'; 

import GalleryPage from './pages/GalleryPage';
import GalleryManagement from './components/admin/GalleryManagement';

import { Settings, Home, Shield, Info, Edit } from 'lucide-react';

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

const App: React.FC = () => {
  // Updated to use real users from your database
  const mockUser: User = {
    id: 1, // Amali - Admin user
    name: 'Amali Ravi',
    email: 'nivethy139@gmail.com',
    isAdmin: true // Amali is admin based on your database
  };

  // Alternative users you can test with:
  // const mockUser: User = {
  //   id: 2, // Kali - Regular user
  //   name: 'Kali',
  //   email: 'kali@email.com',
  //   isAdmin: false
  // };

  // const mockUser: User = {
  //   id: 3, // Nivethy - Regular user
  //   name: 'Nivethy Vigneswaran',
  //   email: 'nivethy13@gmail.com',
  //   isAdmin: false
  // };

  return (
    <NotificationProvider userId={mockUser.id}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JCC</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">
                      Jaffna Cultural Centre
                    </span>
                  </Link>
                </div>

                <nav className="flex items-center space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>

                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Info className="w-4 h-4" />
                    About
                  </Link>

                  <Link
                    to="/gallery"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Info className="w-4 h-4" />
                    Gallery
                  </Link>
                  
                  <Link
                    to="/notifications"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Notifications
                  </Link>
                  
                  <Link
                    to="/preferences"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Preferences
                  </Link>

                  {mockUser.isAdmin && (
                    <>
                      <Link
                        to="/admin/notifications"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                      <Link
                        to="/admin/about"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit About
                      </Link>
                      <Link
                        to="/admin/gallery"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Gallery
                      </Link>
                    </>
                  )}

                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {mockUser.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{mockUser.name}</span>
                  </div>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage mockUser={mockUser} />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/preferences" element={<NotificationPreferences />} />
              {mockUser.isAdmin && (
                <>
                  <Route path="/admin/notifications" element={<AdminNotificationDashboard />} />
                  <Route path="/admin/about" element={<AboutManagement />} />
                  <Route path="/admin/gallery" element={<GalleryManagement />} />
                </>
              )}
            </Routes>
          </main>

          {/* WebSocket Status - Only in development */}
          {import.meta.env?.MODE === 'development' && <WebSocketStatus />}
        </div>
      </Router>
    </NotificationProvider>
  );
};

// Updated Home Page Component
interface HomePageProps {
  mockUser: User;
}

const HomePage: React.FC<HomePageProps> = ({ mockUser }) => {
  const sendTestNotification = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/test-send/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: mockUser.id
        })
      });
      
      if (response.ok) {
        alert('Test notification sent! Check your notification bell.');
      } else {
        alert('Failed to send test notification. Check console for details.');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Error sending test notification. Check console for details.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Jaffna Cultural Centre
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Hello {mockUser.name}! Your notifications will appear in real-time.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            User ID: {mockUser.id} | Role: {mockUser.isAdmin ? 'Admin' : 'User'}
          </p>
          
          {/* Test Button */}
          <button
            onClick={sendTestNotification}
            className="mb-8 bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            Send Test Notification
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-red-600 mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Notifications</h3>
              <p className="text-gray-600">Get notified about booking confirmations, updates, and reminders.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-green-600 mb-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Alerts</h3>
              <p className="text-gray-600">Receive instant notifications for payment confirmations and refunds.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-purple-600 mb-4">
                <span className="text-3xl">📢</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Updates</h3>
              <p className="text-gray-600">Stay informed with important announcements and system updates.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/about"
              className="bg-gradient-to-r from-red-800 to-red-700 text-white p-6 rounded-lg hover:from-red-900 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">Learn About Us</h3>
              <p className="text-red-100">Discover our history, mission, and cultural heritage</p>
            </Link>

            <Link 
              to="/gallery"
              className="bg-gradient-to-r from-red-800 to-red-700 text-white p-6 rounded-lg hover:from-red-900 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-2">View Our Gallery</h3>
              <p className="text-red-100">Discover our gallery</p>
            </Link>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Book a Venue</h3>
              <p className="text-gray-200">Reserve our beautiful halls for your special events</p>
            </div>
          </div>

          {/* WebSocket Connection Status */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-gray-800">Connection Status</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                WebSocket: <span id="ws-status" className="font-mono bg-gray-200 px-2 py-1 rounded">Connecting...</span>
              </p>
              <p className="text-sm text-gray-600">
                API: <span id="api-status" className="font-mono bg-gray-200 px-2 py-1 rounded">Testing...</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;