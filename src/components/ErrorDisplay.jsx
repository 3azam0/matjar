import { AlertCircle, RotateCcw } from 'lucide-react';

export function ErrorDisplay({ error, onRetry, title = 'حدث خطأ' }) {
  const errorMessage = error?.message || 'حدث خطأ غير متوقع';

  return (
    <div className="error-display">
      <div className="error-display-icon">
        <AlertCircle size={32} />
      </div>
      <div className="error-display-content">
        <h3 className="error-display-title">{title}</h3>
        <p className="error-display-message">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          className="error-display-retry-btn"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw size={18} />
          <span>إعادة محاولة</span>
        </button>
      )}
    </div>
  );
}
