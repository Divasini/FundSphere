import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while loading content.',
  onRetry,
  className = 'py-12',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-softpink-50/50 border border-softpink-200 rounded-2xl ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-softpink-100 text-softpink-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-cloud-900 mb-1">Unable to Load Data</h3>
      <p className="text-sm text-cloud-800/80 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-ice-700 bg-white border border-ice-200 hover:bg-ice-50 rounded-lg shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};
