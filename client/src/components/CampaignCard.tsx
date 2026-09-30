import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Tag } from 'lucide-react';
import { Campaign } from '../types';
import { CampaignProgress } from './CampaignProgress';

interface CampaignCardProps {
  campaign: Campaign;
}

const statusBadges: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-mint-100 text-mint-700 border-mint-200' },
  FUNDED: { label: 'Funded', className: 'bg-ice-100 text-ice-700 border-ice-200' },
  SUCCESSFUL: { label: 'Successful', className: 'bg-lavender-100 text-lavender-700 border-lavender-200' },
  FAILED: { label: 'Failed', className: 'bg-softpink-100 text-softpink-700 border-softpink-200' },
  PENDING_REVIEW: { label: 'In Review', className: 'bg-peach-100 text-peach-700 border-peach-200' },
  DRAFT: { label: 'Draft', className: 'bg-cloud-200 text-cloud-800 border-cloud-300' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const badge = statusBadges[campaign.status] || {
    label: campaign.status,
    className: 'bg-cloud-100 text-cloud-800 border-cloud-200',
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60';

  return (
    <div className="group bg-white rounded-2xl border border-cloud-200/90 shadow-soft hover:shadow-soft-lg hover:border-ice-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image & Status Badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-cloud-100">
        <img
          src={campaign.coverImage || fallbackImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        {campaign.category && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-cloud-800 border border-cloud-200 shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3 text-ice-500" />
              {campaign.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Creator Info */}
          {campaign.creator && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cloud-200 overflow-hidden text-xs flex items-center justify-center font-bold text-cloud-800">
                {campaign.creator.avatar ? (
                  <img
                    src={campaign.creator.avatar}
                    alt={campaign.creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  campaign.creator.name.charAt(0)
                )}
              </div>
              <span className="text-xs text-cloud-800/80 truncate">
                by <span className="font-medium text-cloud-900">{campaign.creator.name}</span>
              </span>
            </div>
          )}

          <Link to={`/campaigns/${campaign.id}`}>
            <h3 className="text-base font-bold text-cloud-900 line-clamp-1 group-hover:text-ice-600 transition">
              {campaign.title}
            </h3>
          </Link>
          <p className="text-xs text-cloud-800/70 line-clamp-2 leading-relaxed">
            {campaign.shortDescription}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 pt-2 border-t border-cloud-100">
          <CampaignProgress
            amountRaised={campaign.amountRaised}
            fundingGoal={campaign.fundingGoal}
            percentage={campaign.fundingPercentage}
            size="sm"
          />

          {/* Supporters & Days remaining */}
          <div className="flex items-center justify-between text-xs text-cloud-800/80 pt-1">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-ice-600" />
              {campaign.supporterCount} {campaign.supporterCount === 1 ? 'supporter' : 'supporters'}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-peach-500" />
              {campaign.isExpired ? (
                <span className="text-softpink-600 font-semibold">Ended</span>
              ) : (
                <span>{campaign.daysRemaining} days left</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Link */}
        <Link
          to={`/campaigns/${campaign.id}`}
          className="w-full text-center py-2 px-3 text-xs font-semibold text-ice-700 bg-ice-50 hover:bg-ice-100 border border-ice-200/80 rounded-xl transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};
