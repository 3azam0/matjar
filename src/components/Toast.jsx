import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle, X } from 'lucide-react';
import '../styles/Toast.css';

const ICONS = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

export function Toast({ notification, onDismiss }) {
  const { id, type, message } = notification;

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">
        {ICONS[type]}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      {type === 'error' && (
        <button
          className="toast-close-btn"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss"
          type="button"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
