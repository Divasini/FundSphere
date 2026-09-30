import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  hasData: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  hasData,
  emptyMessage = 'Not enough data to generate this report.',
  children,
  headerAction,
}) => {
  return (
    <div className="p-6 bg-white border border-cloud-200/90 rounded-2xl shadow-soft flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-cloud-900">{title}</h3>
          {subtitle && <p className="text-xs text-cloud-800/70 mt-0.5">{subtitle}</p>}
        </div>
        {headerAction}
      </div>

      <div className="w-full min-h-[260px] flex items-center justify-center">
        {hasData ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-cloud-800/60">
            <BarChart3 className="w-10 h-10 mb-2 text-cloud-300" />
            <p className="text-xs font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
