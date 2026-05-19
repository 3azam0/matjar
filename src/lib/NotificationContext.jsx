import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  const addNotification = useCallback((message, options = {}) => {
    const {
      type = 'info',
      duration = type === 'error' ? null : 5000,
      id = null,
    } = options;

    const notificationId = id || `notification-${notificationIdRef.current++}`;

    const notification = {
      id: notificationId,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);

    if (duration) {
      setTimeout(() => {
        removeNotification(notificationId);
      }, duration);
    }

    return notificationId;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback((message) => {
    return addNotification(message, { type: 'success', duration: 5000 });
  }, [addNotification]);

  const showError = useCallback((message) => {
    return addNotification(message, { type: 'error', duration: null });
  }, [addNotification]);

  const showWarning = useCallback((message) => {
    return addNotification(message, { type: 'warning', duration: 7000 });
  }, [addNotification]);

  const showInfo = useCallback((message) => {
    return addNotification(message, { type: 'info', duration: 5000 });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
