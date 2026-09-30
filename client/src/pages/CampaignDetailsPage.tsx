import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Tag,
  Share2,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import { Campaign, InnovationAnalysis } from '../types';
import { CampaignProgress } from '../components/CampaignProgress';
import { ContributionModal } from '../components/ContributionModal';
import { InnovationScoreCard } from '../components/InnovationScoreCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [innovationData, setInnovationData] = useState<InnovationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // New update modal for creator
  const [isPostingUpdate, setIsPostingUpdate] = useState<boolean>(false);
  const [updateTitle, setUpdateTitle] = useState<string>('');
  const [updateContent, setUpdateContent] = useState<string>('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState<boolean>(false);

  const fetchCampaign = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await campaignsApi.getById(id);
      setCampaign(data);

      try {
        const inv = await campaignsApi.getInnovationAnalysis(id);
        setInnovationData(inv);
      } catch (err) {
        console.warn('Innovation analysis not available:', err);
      }
    } catch (e) {
      console.error('Failed to fetch campaign:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePostUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !updateTitle || !updateContent) return;

    try {
      setIsSubmittingUpdate(true);
      await campaignsApi.postUpdate(campaign.id, {
        title: updateTitle,
        content: updateContent,
      });
      setUpdateTitle('');
      setUpdateContent('');
      setIsPostingUpdate(false);
      fetchCampaign();
    } catch (e: any) {
      alert(e.message || 'Failed to post update');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading campaign details..." className="py-32" />;
  }

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <EmptyState
          title="Campaign Not Found"
          description="The campaign you are looking for may have been removed or does not exist."
          actionLabel="Explore Campaigns"
          actionHref="/discover"
        />
      </div>
    );
  }

  const isCreator = user?.id === campaign.creatorId;
  const canContribute = campaign.status === 'ACTIVE' && !campaign.isExpired;

  const fallbackImage =
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Rejection / Status Warning Banner if applicable */}
      {campaign.status === 'REJECTED' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-red-900">Campaign Rejected by Administrator</h4>
            <p className="text-red-800/80 mt-0.5">
              Reason provided: {campaign.rejectionReason || 'Does not meet platform guidelines.'}
            </p>
          </div>
        </div>
      )}

      {campaign.status === 'PENDING_REVIEW' && (
        <div className="p-4 bg-peach-50 border border-peach-200 rounded-2xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-peach-600 shrink-0" />
          <div className="text-xs text-peach-900">
            <span className="font-bold">Pending Administrative Review:</span> This campaign is awaiting review and cannot accept contributions until approved.
          </div>
        </div>
      )}

      {campaign.status === 'FAILED' && (
        <div className="p-4 bg-softpink-50 border border-softpink-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-softpink-600 shrink-0" />
          <div className="text-xs text-softpink-900">
            <span className="font-bold">Campaign Concluded:</span> The deadline passed without reaching the required goal. All contributions have been safely refunded back to supporters.
          </div>
        </div>
      )}

      {/* Main Grid: Left Details & Right Financial Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {campaign.category && (
                <span className="px-3 py-1 rounded-full bg-ice-50 border border-ice-100 text-ice-700 text-xs font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {campaign.category.name}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cloud-100 text-cloud-800 uppercase">
                {campaign.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-cloud-900 leading-tight">
              {campaign.title}
            </h1>

            <p className="text-sm sm:text-base text-cloud-800/80 leading-relaxed font-normal">
              {campaign.shortDescription}
            </p>
          </div>

          {/* Cover Media */}
          <div className="rounded-3xl overflow-hidden border border-cloud-200 bg-cloud-100 aspect-video shadow-soft">
            <img
              src={campaign.coverImage || fallbackImage}
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackImage;
              }}
            />
          </div>

          {/* Creator Profile Card */}
          {campaign.creator && (
            <div className="p-6 bg-white border border-cloud-200 rounded-2xl shadow-soft flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-ice-100 border border-ice-200 text-ice-700 flex items-center justify-center font-bold text-base overflow-hidden">
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
                <div>
                  <h4 className="text-sm font-bold text-cloud-900">
                    Created by {campaign.creator.name}
                  </h4>
                  <p className="text-xs text-cloud-800/70 mt-0.5">
                    {campaign.creator.bio || 'Passionate project creator on FundSphere'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 border border-cloud-200 rounded-xl transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {isCopied ? 'Link Copied!' : 'Share'}
              </button>
            </div>
          )}

          {/* Innovation Intelligence Matrix */}
          {innovationData && (
            <InnovationScoreCard analysis={innovationData} />
          )}

          {/* Full Story / Description */}
          <div className="p-8 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-4">
            <h3 className="text-lg font-bold text-cloud-900 border-b border-cloud-100 pb-3">
              About This Project
            </h3>
            <div className="text-sm text-cloud-800/80 leading-relaxed whitespace-pre-line">
              {campaign.description}
            </div>
          </div>

          {/* Campaign Updates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cloud-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-ice-600" />
                Project Updates ({campaign.updates?.length || 0})
              </h3>
              {isCreator && !isPostingUpdate && (
                <button
                  onClick={() => setIsPostingUpdate(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Post Update
                </button>
              )}
            </div>

            {/* Creator Post Update Form */}
            {isPostingUpdate && (
              <form
                onSubmit={handlePostUpdateSubmit}
                className="p-6 bg-white border border-ice-200 rounded-2xl shadow-soft space-y-4 animate-fadeIn"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-ice-600">
                  New Campaign Milestone
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-cloud-800 mb-1">
                    Update Title
                  </label>
                  <input
                    type="text"
                    required
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g. First Production Batch Completed"
                    className="w-full p-2.5 bg-cloud-50 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cloud-800 mb-1">
                    Update Content
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={updateContent}
                    onChange={(e) => setUpdateContent(e.target.value)}
                    placeholder="Share progress details with your backers..."
                    className="w-full p-2.5 bg-cloud-50 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPostingUpdate(false)}
                    className="px-3 py-1.5 text-xs text-cloud-700 hover:bg-cloud-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUpdate}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl disabled:opacity-50"
                  >
                    {isSubmittingUpdate ? 'Publishing...' : 'Publish Update'}
                  </button>
                </div>
              </form>
            )}

            {/* Updates List */}
            {campaign.updates && campaign.updates.length > 0 ? (
              <div className="space-y-4">
                {campaign.updates.map((update) => (
                  <div
                    key={update.id}
                    className="p-6 bg-white border border-cloud-200 rounded-2xl shadow-soft space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-cloud-800/60">
                      <span className="font-semibold text-ice-600">Milestone</span>
                      <span>
                        {new Date(update.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-cloud-900">{update.title}</h4>
                    <p className="text-xs text-cloud-800/80 leading-relaxed whitespace-pre-line">
                      {update.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-cloud-800/60 italic">No updates posted yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Funding Status & Back Action */}
        <div className="space-y-6">
          <div className="sticky top-24 p-6 sm:p-8 bg-white border border-cloud-200 rounded-3xl shadow-soft-lg space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ice-600">
                Funding Target
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-cloud-900">
                  ₹{campaign.amountRaised.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-cloud-800/60">
                  of ₹{campaign.fundingGoal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <CampaignProgress
              amountRaised={campaign.amountRaised}
              fundingGoal={campaign.fundingGoal}
              percentage={campaign.fundingPercentage}
              size="lg"
            />

            {/* Financial Stats Grid */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-cloud-100 text-xs">
              <div>
                <span className="text-cloud-800/60 block">Supporters</span>
                <span className="text-base font-bold text-cloud-900 flex items-center gap-1 mt-0.5">
                  <Users className="w-4 h-4 text-ice-600" />
                  {campaign.supporterCount}
                </span>
              </div>

              <div>
                <span className="text-cloud-800/60 block">Deadline</span>
                <span className="text-base font-bold text-cloud-900 flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-peach-500" />
                  {campaign.isExpired ? (
                    <span className="text-softpink-600 font-bold">Ended</span>
                  ) : (
                    <span>{campaign.daysRemaining} days left</span>
                  )}
                </span>
              </div>
            </div>

            {/* Dynamic Status Button Requirement */}
            <div>
              {campaign.status === 'ACTIVE' && (
                <button
                  onClick={() => setIsContributionModalOpen(true)}
                  className="w-full py-3.5 px-4 text-sm font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-2xl shadow-soft hover:shadow-soft-lg transition text-center"
                >
                  Fund Campaign
                </button>
              )}

              {campaign.status === 'FUNDED' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsContributionModalOpen(true)}
                    className="w-full py-3.5 px-4 text-sm font-bold text-white bg-mint-600 hover:bg-mint-700 rounded-2xl shadow-soft transition text-center"
                  >
                    Goal Reached! Back Project
                  </button>
                  <p className="text-[11px] text-center text-mint-700 font-medium">
                    This project reached 100% of its goal! You can still contribute until the deadline.
                  </p>
                </div>
              )}

              {campaign.status === 'SUCCESSFUL' && (
                <div className="w-full py-3 px-4 text-xs font-bold text-center text-lavender-700 bg-lavender-50 border border-lavender-200 rounded-2xl">
                  Campaign Completed Successfully
                </div>
              )}

              {campaign.status === 'FAILED' && (
                <div className="w-full py-3 px-4 text-xs font-bold text-center text-softpink-700 bg-softpink-50 border border-softpink-200 rounded-2xl">
                  Campaign Failed (Refunds Issued)
                </div>
              )}

              {campaign.status === 'PENDING_REVIEW' && (
                <div className="w-full py-3 px-4 text-xs font-bold text-center text-peach-700 bg-peach-50 border border-peach-200 rounded-2xl">
                  Awaiting Administrative Approval
                </div>
              )}

              {campaign.status === 'DRAFT' && (
                <div className="w-full py-3 px-4 text-xs font-bold text-center text-cloud-700 bg-cloud-100 border border-cloud-200 rounded-2xl">
                  Draft Campaign (Not Published)
                </div>
              )}
            </div>

            {/* Trust Pill */}
            <div className="p-3.5 bg-cloud-50/70 border border-cloud-200/80 rounded-2xl flex items-center gap-3 text-xs text-cloud-800/80">
              <Shield className="w-4 h-4 text-ice-600 shrink-0" />
              <span>Full refunds automatically triggered if target goal is unmet.</span>
            </div>
          </div>

          {/* Recent Supporters Box */}
          {campaign.contributions && campaign.contributions.length > 0 && (
            <div className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cloud-900">
                Recent Supporters ({campaign.contributions.length})
              </h4>
              <div className="divide-y divide-cloud-100 text-xs">
                {campaign.contributions.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-cloud-900">
                      {c.contributor?.name || 'Anonymous Supporter'}
                    </span>
                    <span className="font-bold text-ice-600">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contribution Modal */}
      <ContributionModal
        campaign={campaign}
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        onSuccess={fetchCampaign}
      />
    </div>
  );
};
