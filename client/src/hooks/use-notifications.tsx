import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type Notification = {
  type: 'appointment_created' | 'appointment_reminder' | 'connection_established';
  data: {
    message: string;
    appointment?: any;
  };
};

type NotificationContextType = {
  notifications: Notification[];
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to notification service');
    };

    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      setNotifications(prev => [...prev, notification]);

      // Show toast notification
      if (notification.type === 'appointment_reminder') {
        toast({
          title: 'Appointment Reminder',
          description: notification.data.message,
        });
      } else if (notification.type === 'appointment_created') {
        toast({
          title: 'Appointment Scheduled',
          description: notification.data.message,
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Notification Error',
        description: 'Failed to connect to notification service',
        variant: 'destructive',
      });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, toast]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
