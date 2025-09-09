import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll, unlockScroll } from '../utils/scrollLock';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  confirmText,
  onConfirm,
  onCancel
}) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      unlockScroll();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="relative bg-white p-8 rounded-lg w-90 max-w-md m-4 md:m-0">
        <p className="text-gray-900 text-center mb-6 px-8">{message}</p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-red-500 text-white border-none rounded text-sm cursor-pointer font-medium transition-all duration-200 hover:bg-red-600" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded text-sm cursor-pointer font-medium transition-all duration-200 hover:bg-gray-200 hover:border-gray-400" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}; 