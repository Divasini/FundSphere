import React from 'react';

interface CampaignProgressProps {
  amountRaised: number;
  fundingGoal: number;
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const CampaignProgress: React.FC<CampaignProgressProps> = ({
  amountRaised,
  fundingGoal,
  percentage,
  size = 'md',
  showDetails = true,
}) => {
  // Use backend provided percentage if available; fallback to exact formula
  const calculatedPercentage =
    percentage !== undefined
      ? percentage
      : fundingGoal > 0
      ? Math.round((amountRaised / fundingGoal) * 1000) / 10
      : 0;

  // Capped at 100% for progress bar visual fill width
  const visualBarWidth = Math.min(Math.max(calculatedPercentage, 0), 100);

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full space-y-1.5">
      <div className={`w-full bg-cloud-200/80 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full bg-gradient-to-r from-ice-500 to-mint-500 rounded-full transition-all duration-500"
          style={{ width: `${visualBarWidth}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-cloud-900">
            ₹{amountRaised.toLocaleString('en-IN')}{' '}
            <span className="font-normal text-cloud-800/70">
              raised of ₹{fundingGoal.toLocaleString('en-IN')}
            </span>
          </span>
          <span className="font-bold text-ice-600">{calculatedPercentage}%</span>
        </div>
      )}
    </div>
  );
};
