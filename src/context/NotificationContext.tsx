import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'partner' | 'health' | 'payment' | 'info';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  activeBanner: AppNotification | null;
  sendNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  dismissBanner: () => void;
  hapticEnabled: boolean;
  toggleHaptic: () => void;
  triggerHaptic: (pattern?: 'light' | 'medium' | 'success') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_welcome',
      title: 'Welcome to Period Love Care',
      message: 'Your ₹500 welcome Care Wallet credit is active and ready to use.',
      type: 'payment',
      timestamp: 'Just now',
      read: false,
    },
  ]);
  const [activeBanner, setActiveBanner] = useState<AppNotification | null>(null);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const triggerHaptic = useCallback(
    (pattern: 'light' | 'medium' | 'success' = 'light') => {
      if (!hapticEnabled) return;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (pattern === 'success') {
          navigator.vibrate([40, 60, 40]);
        } else if (pattern === 'medium') {
          navigator.vibrate(50);
        } else {
          navigator.vibrate(25);
        }
      }
    },
    [hapticEnabled]
  );

  const sendNotification = useCallback(
    (title: string, message: string, type: AppNotification['type'] = 'info') => {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title,
        message,
        type,
        timestamp: 'Just now',
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setActiveBanner(newNotif);
      triggerHaptic(type === 'payment' || type === 'order' ? 'success' : 'medium');

      // Auto-hide banner after 4.5 seconds
      setTimeout(() => {
        setActiveBanner((current) => (current?.id === newNotif.id ? null : current));
      }, 4500);
    },
    [triggerHaptic]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
    setActiveBanner(null);
  };

  const dismissBanner = () => {
    setActiveBanner(null);
  };

  const toggleHaptic = () => setHapticEnabled((prev) => !prev);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeBanner,
        sendNotification,
        markAsRead,
        clearAll,
        dismissBanner,
        hapticEnabled,
        toggleHaptic,
        triggerHaptic,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const defaultNotificationContext: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  activeBanner: null,
  sendNotification: () => {},
  markAsRead: () => {},
  clearAll: () => {},
  dismissBanner: () => {},
  hapticEnabled: true,
  toggleHaptic: () => {},
  triggerHaptic: () => {},
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  return context || defaultNotificationContext;
};
