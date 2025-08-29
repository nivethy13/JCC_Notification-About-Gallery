import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

const WebSocketStatus: React.FC = () => {
  const { wsStatus } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">WebSocket Status</span>
        <button
          onClick={wsStatus.reconnect}
          className="p-1 text-gray-400 hover:text-blue-600"
          title="Reconnect"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        {wsStatus.isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">Disconnected</span>
          </>
        )}
      </div>
      
      {wsStatus.connectionAttempts > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Attempts: {wsStatus.connectionAttempts}/5
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;