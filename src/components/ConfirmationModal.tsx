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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-90 max-w-md">
        <p className="text-gray-900 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 bg-red-500 text-white border-none rounded text-sm cursor-pointer font-medium transition-all duration-200 hover:bg-red-600" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-600 border border-gray-300 rounded text-sm cursor-pointer font-medium transition-all duration-200 hover:bg-gray-200 hover:border-gray-400" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 