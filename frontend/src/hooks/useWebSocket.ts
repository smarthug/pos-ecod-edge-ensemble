import { useEffect, useRef, useState } from 'react';
import { MetricMessage, ConnectionStatus } from '../types';

interface UseWebSocketOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  lastMessage: MetricMessage | null;
  status: ConnectionStatus;
  reconnectAttempts: number;
}

export const useWebSocket = ({
  url,
  reconnectDelay = 3000,
  maxReconnectAttempts = 10,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [lastMessage, setLastMessage] = useState<MetricMessage | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const connect = () => {
    try {
      setStatus('connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setStatus('connected');
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const data: MetricMessage = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatus('error');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setStatus('disconnected');
        wsRef.current = null;

        // Attempt reconnection
        if (shouldReconnectRef.current && reconnectAttempts < maxReconnectAttempts) {
          console.log(`[WebSocket] Reconnecting in ${reconnectDelay}ms... (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { lastMessage, status, reconnectAttempts };
};
