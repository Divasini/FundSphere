import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  actionHref,
  onAction,
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-cloud-200 rounded-2xl shadow-soft ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-ice-50 border border-ice-100 flex items-center justify-center text-ice-600 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-cloud-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-cloud-800/70 max-w-md mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
