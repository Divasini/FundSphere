import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cloud-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-cloud-200 rounded-2xl p-6 max-w-md w-full shadow-soft-lg space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDestructive
                  ? 'bg-softpink-100 text-softpink-600'
                  : 'bg-ice-100 text-ice-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-cloud-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-cloud-400 hover:text-cloud-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-cloud-800/80 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition shadow-sm ${
              isDestructive
                ? 'bg-softpink-600 hover:bg-softpink-700'
                : 'bg-ice-600 hover:bg-ice-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
