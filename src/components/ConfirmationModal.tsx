import React from 'react';

interface ConfirmationModalProps {
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  confirmText,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="confirmation-modal">
      <div className="modal-overlay" onClick={onCancel} />
      <div className="modal-content confirmation-content">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <button className="delete-button" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 