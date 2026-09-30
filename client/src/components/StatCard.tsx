import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'ice' | 'mint' | 'lavender' | 'peach' | 'softpink';
}

const variantStyles = {
  ice: {
    bg: 'bg-ice-50/60',
    border: 'border-ice-200',
    iconBg: 'bg-ice-100',
    iconColor: 'text-ice-600',
  },
  mint: {
    bg: 'bg-mint-50/60',
    border: 'border-mint-200',
    iconBg: 'bg-mint-100',
    iconColor: 'text-mint-600',
  },
  lavender: {
    bg: 'bg-lavender-50/60',
    border: 'border-lavender-200',
    iconBg: 'bg-lavender-100',
    iconColor: 'text-lavender-600',
  },
  peach: {
    bg: 'bg-peach-50/60',
    border: 'border-peach-200',
    iconBg: 'bg-peach-100',
    iconColor: 'text-peach-600',
  },
  softpink: {
    bg: 'bg-softpink-50/60',
    border: 'border-softpink-200',
    iconBg: 'bg-softpink-100',
    iconColor: 'text-softpink-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'ice',
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`p-5 rounded-2xl border ${styles.border} bg-white shadow-soft flex items-center justify-between`}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold text-cloud-800/70 tracking-wide uppercase">{title}</p>
        <h4 className="text-2xl font-extrabold text-cloud-900">{value}</h4>
        {subtitle && <p className="text-xs text-cloud-800/60">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} ${styles.iconColor} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
