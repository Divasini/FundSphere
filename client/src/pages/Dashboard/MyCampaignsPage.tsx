import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Send,
  Trash2,
} from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import { Campaign } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';

export const MyCampaignsPage: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Submit / Delete states
  const [targetCampaign, setTargetCampaign] = useState<Campaign | null>(null);
  const [actionType, setActionType] = useState<'submit' | 'delete' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchCampaigns = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await campaignsApi.getAll({ creatorId: user.id });
      setCampaigns(data);
    } catch (e) {
      console.error('Failed to fetch my campaigns:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleConfirmAction = async () => {
    if (!targetCampaign || !actionType) return;

    try {
      setIsProcessing(true);
      if (actionType === 'submit') {
        await campaignsApi.submit(targetCampaign.id);
      } else if (actionType === 'delete') {
        await campaignsApi.delete(targetCampaign.id);
      }
      setTargetCampaign(null);
      setActionType(null);
      fetchCampaigns();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading your created campaigns..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cloud-900">My Campaigns</h2>
          <p className="text-xs text-cloud-800/70 mt-0.5">
            Manage your campaign drafts, pending submissions, and active fundraising projects.
          </p>
        </div>

        <Link
          to="/campaigns/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" /> Start New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns created yet."
          description="Ready to share your idea with supporters? Create your first campaign in minutes."
          actionLabel="Start a Campaign"
          actionHref="/campaigns/create"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                      camp.status === 'ACTIVE'
                        ? 'bg-mint-100 text-mint-700'
                        : camp.status === 'FUNDED'
                        ? 'bg-ice-100 text-ice-700'
                        : camp.status === 'SUCCESSFUL'
                        ? 'bg-lavender-100 text-lavender-700'
                        : camp.status === 'PENDING_REVIEW'
                        ? 'bg-peach-100 text-peach-700'
                        : camp.status === 'FAILED'
                        ? 'bg-softpink-100 text-softpink-700'
                        : camp.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-cloud-200 text-cloud-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                  {camp.category && (
                    <span className="text-xs text-cloud-800/60 font-medium">
                      in {camp.category.name}
                    </span>
                  )}
                </div>

                <Link
                  to={`/campaigns/${camp.id}`}
                  className="text-base font-bold text-cloud-900 hover:text-ice-600 flex items-center gap-1.5"
                >
                  {camp.title}
                  <ExternalLink className="w-4 h-4 text-cloud-400" />
                </Link>

                <p className="text-xs text-cloud-800/70 line-clamp-2 leading-relaxed">
                  {camp.shortDescription}
                </p>

                {camp.status === 'REJECTED' && camp.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                    <strong>Rejection reason:</strong> {camp.rejectionReason}
                  </div>
                )}
              </div>

              {/* Progress & Actions */}
              <div className="md:w-64 space-y-3 shrink-0">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-extrabold text-cloud-900">
                    ₹{camp.amountRaised.toLocaleString('en-IN')}
                  </span>
                  <span className="text-cloud-800/60">
                    of ₹{camp.fundingGoal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="w-full bg-cloud-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-ice-500 rounded-full"
                    style={{ width: `${Math.min(camp.fundingPercentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {camp.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        setTargetCampaign(camp);
                        setActionType('submit');
                      }}
                      className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-mint-600 hover:bg-mint-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit for Review
                    </button>
                  )}

                  {camp.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        setTargetCampaign(camp);
                        setActionType('delete');
                      }}
                      className="p-1.5 text-cloud-400 hover:text-softpink-600 hover:bg-softpink-50 rounded-lg transition"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold text-center text-cloud-700 hover:bg-cloud-100 border border-cloud-200 rounded-xl transition"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(targetCampaign && actionType)}
        title={actionType === 'submit' ? 'Submit Campaign for Review' : 'Delete Campaign Draft'}
        message={
          actionType === 'submit'
            ? `Are you sure you want to submit "${targetCampaign?.title}" for administrative approval? Once submitted, it will be placed in PENDING_REVIEW.`
            : `Are you sure you want to delete the draft "${targetCampaign?.title}"? This action cannot be undone.`
        }
        confirmLabel={actionType === 'submit' ? 'Submit Now' : 'Delete'}
        isDestructive={actionType === 'delete'}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setTargetCampaign(null);
          setActionType(null);
        }}
      />
    </div>
  );
};
