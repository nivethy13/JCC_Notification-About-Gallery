// src/hooks/useWebSocket.ts - Stable WebSocket Implementation
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketProps {
  userId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNewNotification?: (notification: any) => void;
  enabled?: boolean;
}

export const useWebSocket = ({ userId, onNewNotification, enabled = true }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnecting = useRef(false);
  const shouldConnect = useRef(true);
  const maxReconnectAttempts = 5;

  const updateStatus = useCallback((status: string, className: string) => {
    const statusElement = document.getElementById('ws-status');
    if (statusElement) {
      statusElement.textContent = status;
      statusElement.className = `font-mono ${className}`;
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnect.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
      ws.current = null;
    }

    setIsConnected(false);
    isConnecting.current = false;
    updateStatus('Disconnected', 'text-gray-600');
  }, [updateStatus]);

  const connect = useCallback(() => {
    if (!enabled || !shouldConnect.current) return;
    
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connecting, skipping...');
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    if (connectionAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      updateStatus('Connection failed', 'text-red-600');
      return;
    }

    // Clean up existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    isConnecting.current = true;
    updateStatus('Connecting...', 'text-yellow-600');

    try {
      const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log(`WebSocket connected for user ${userId}`);
        setIsConnected(true);
        isConnecting.current = false;
        setConnectionAttempts(0);
        updateStatus('Connected', 'text-green-600');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'notification' && onNewNotification) {
            onNewNotification(data.data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(`WebSocket closed for user ${userId}:`, event.code, event.reason);
        setIsConnected(false);
        isConnecting.current = false;

        if (event.code === 1000 || event.code === 1001 || !shouldConnect.current) {
          updateStatus('Disconnected', 'text-gray-600');
          return;
        }

        updateStatus('Reconnecting...', 'text-yellow-600');
        
        // Exponential backoff for reconnection
        const backoffDelay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (shouldConnect.current) {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }
        }, backoffDelay);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting.current = false;
        updateStatus('Error', 'text-red-600');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      isConnecting.current = false;
      updateStatus('Error', 'text-red-600');
    }
  }, [userId, onNewNotification, enabled, connectionAttempts, updateStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    setConnectionAttempts(0);
    shouldConnect.current = true;
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    if (enabled) {
      shouldConnect.current = true;
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { 
    isConnected, 
    reconnect, 
    disconnect,
    connectionAttempts 
  };
};