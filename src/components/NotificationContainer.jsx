import { useNotification } from '../lib/NotificationContext';
import { Toast } from './Toast';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container" role="region" aria-live="polite" aria-label="Notifications">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
}
