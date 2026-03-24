import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  subMessage = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'danger',
  onConfirm,
  onCancel,
  loading = false,
  cancelType,
  setCancelType
}) => {
  if (!isOpen) return null;

  const btnColors = {
    danger: { bg: '#ef4444', hover: '#dc2626' },
    warning: { bg: '#f59e0b', hover: '#d97706' },
    primary: { bg: '#3b82f6', hover: '#2563eb' },
  };
  const color = btnColors[confirmStyle] || btnColors.danger;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        {/* Icon */}
        <div className={`modal-icon modal-icon-${confirmStyle}`}>
          {confirmStyle === 'danger' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          ) : confirmStyle === 'warning' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          )}
        </div>

        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="cancel-options">
          <label>
            <input
              type="radio"
              value="normal"
              checked={cancelType === 'normal'}
              onChange={() => setCancelType('normal')}
            />
            Normal Cancellation
          </label>
        </div><div className="cancel-options">
          <label>
            <input
              type="radio"
              value="no-show"
              checked={cancelType === 'no-show'}
              onChange={() => setCancelType('no-show')}
            />
            No Show
          </label></div>
        <div className="cancel-options">
          <label>
            <input
              type="radio"
              value="delete"
              checked={cancelType === 'delete'}
              onChange={() => setCancelType('delete')}
            />
            Just Delete It
          </label>
        </div>
        {subMessage && <p className="modal-sub">{subMessage}</p>}

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className="modal-btn modal-btn-confirm"
            style={{ background: color.bg }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="modal-spinner" /> Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;