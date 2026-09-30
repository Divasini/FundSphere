import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  Tag,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { campaignsApi } from '../../api/campaigns';
import { Campaign, InnovationAnalysis } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminCampaignReviewPage: React.FC = () => {
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Approve flow
  const [approveCampaign, setApproveCampaign] = useState<Campaign | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Reject flow
  const [rejectCampaign, setRejectCampaign] = useState<Campaign | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Innovation & Feasibility AI Audits
  const [audits, setAudits] = useState<Record<string, InnovationAnalysis>>({});
  const [loadingAudits, setLoadingAudits] = useState<Record<string, boolean>>({});
  const [expandedAudits, setExpandedAudits] = useState<Record<string, boolean>>({});

  const toggleAudit = async (campaignId: string) => {
    if (expandedAudits[campaignId]) {
      setExpandedAudits((prev) => ({ ...prev, [campaignId]: false }));
      return;
    }

    setExpandedAudits((prev) => ({ ...prev, [campaignId]: true }));
    if (audits[campaignId]) return;

    try {
      setLoadingAudits((prev) => ({ ...prev, [campaignId]: true }));
      const analysis = await campaignsApi.getInnovationAnalysis(campaignId);
      setAudits((prev) => ({ ...prev, [campaignId]: analysis }));
    } catch (e) {
      console.error('Failed to fetch AI audit:', e);
    } finally {
      setLoadingAudits((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingCampaigns();
      setPendingCampaigns(data);
    } catch (e) {
      console.error('Failed to load pending campaigns:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApproveConfirm = async () => {
    if (!approveCampaign) return;
    try {
      setIsApproving(true);
      await adminApi.approveCampaign(approveCampaign.id);
      setApproveCampaign(null);
      fetchPending();
    } catch (e: any) {
      alert(e.message || 'Failed to approve campaign');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCampaign) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setRejectError('Please enter a rejection reason of at least 5 characters');
      return;
    }

    try {
      setIsRejecting(true);
      setRejectError(null);
      await adminApi.rejectCampaign(rejectCampaign.id, rejectionReason.trim());
      setRejectCampaign(null);
      setRejectionReason('');
      fetchPending();
    } catch (e: any) {
      setRejectError(e.message || 'Failed to reject campaign');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading campaigns awaiting review..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">Campaign Review Queue</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          Carefully evaluate project feasibility, safety, and legitimacy before approving campaigns for public backing.
        </p>
      </div>

      {pendingCampaigns.length === 0 ? (
        <EmptyState
          title="No campaigns pending review."
          description="All submitted campaigns have been processed. Great job!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-peach-100 text-peach-700">
                      PENDING_REVIEW
                    </span>
                    {camp.category && (
                      <span className="px-2 py-0.5 rounded-full bg-ice-50 text-ice-700 text-[11px] font-semibold border border-ice-100">
                        {camp.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-cloud-900">{camp.title}</h3>
                  <p className="text-xs text-cloud-800/70 leading-relaxed">
                    {camp.shortDescription}
                  </p>
                </div>

                {/* Creator Pill */}
                {camp.creator && (
                  <div className="p-3 bg-cloud-50 rounded-2xl border border-cloud-200/80 text-xs shrink-0 space-y-1">
                    <span className="text-cloud-800/60 block font-semibold">Creator</span>
                    <span className="font-bold text-cloud-900 block">{camp.creator.name}</span>
                    <span className="text-[11px] text-cloud-800/70 block">{camp.creator.email}</span>
                  </div>
                )}
              </div>

              {/* Financial & Deadline Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-cloud-50/60 rounded-2xl border border-cloud-200/70 text-xs">
                <div>
                  <span className="text-cloud-800/60 block">Requested Goal</span>
                  <span className="font-extrabold text-cloud-900 text-sm">
                    ₹{camp.fundingGoal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block">Target Deadline</span>
                  <span className="font-medium text-cloud-900">
                    {new Date(camp.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block">Days Duration</span>
                  <span className="font-medium text-cloud-900">{camp.daysRemaining} days</span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block">Preview Link</span>
                  <Link
                    to={`/campaigns/${camp.id}`}
                    target="_blank"
                    className="font-bold text-ice-600 hover:text-ice-700 inline-flex items-center gap-1"
                  >
                    Inspect Full Details <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* AI Innovation & Feasibility Audit Accordion */}
              <div className="border border-ice-200/80 bg-ice-50/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ice-600" />
                    <span className="text-xs font-bold text-cloud-900">
                      AI Innovation & Feasibility Audit
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-ice-100 text-ice-700">
                      Deep Heuristic
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAudit(camp.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-ice-600 hover:text-ice-700"
                  >
                    {expandedAudits[camp.id] ? (
                      <>Hide Audit <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Inspect AI Audit <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {expandedAudits[camp.id] && (
                  <div className="pt-2 border-t border-ice-100 animate-fadeIn">
                    {loadingAudits[camp.id] ? (
                      <p className="text-xs text-cloud-800/60 italic py-2">Running heuristic AI evaluation...</p>
                    ) : audits[camp.id] ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-cloud-200/80">
                            <span className="text-[10px] font-bold text-cloud-800/60 uppercase">Innovation Index</span>
                            <div className="text-xl font-black text-ice-600 mt-0.5">
                              {audits[camp.id].overallScore} <span className="text-xs text-cloud-800/50 font-normal">/ 100</span>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-cloud-200/80">
                            <span className="text-[10px] font-bold text-cloud-800/60 uppercase">Technical Feasibility</span>
                            <div className="text-xl font-black text-mint-600 mt-0.5">
                              {audits[camp.id].feasibilityScore}%
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-cloud-200/80">
                            <span className="text-[10px] font-bold text-cloud-800/60 uppercase">Risk Level</span>
                            <div className="text-xs font-bold mt-1">
                              <span className={`px-2 py-0.5 rounded-full ${
                                audits[camp.id].riskLevel === 'LOW_RISK'
                                  ? 'bg-mint-100 text-mint-800'
                                  : audits[camp.id].riskLevel === 'MODERATE_RISK'
                                  ? 'bg-peach-100 text-peach-800'
                                  : 'bg-softpink-100 text-softpink-800'
                              }`}>
                                {audits[camp.id].riskLevel.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-cloud-200/80 space-y-1">
                          <span className="text-[11px] font-bold text-cloud-900 block">AI Verdict & Analysis</span>
                          <p className="text-xs text-cloud-800/80 leading-relaxed">
                            {audits[camp.id].verdict}
                          </p>
                        </div>

                        {audits[camp.id].badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[11px] font-semibold text-cloud-800/70 mr-1">Earned Badges:</span>
                            {audits[camp.id].badges.map((b) => (
                              <span key={b} className="px-2 py-0.5 rounded-md bg-white border border-ice-200 text-ice-700 text-[10px] font-bold">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-softpink-600">Failed to load innovation audit.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Review Decision Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-cloud-100">
                <button
                  onClick={() => {
                    setRejectCampaign(camp);
                    setRejectionReason('');
                    setRejectError(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-softpink-700 hover:bg-softpink-50 border border-softpink-200 rounded-xl transition"
                >
                  <X className="w-4 h-4" /> Reject Campaign
                </button>

                <button
                  onClick={() => setApproveCampaign(camp)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-mint-600 hover:bg-mint-700 rounded-xl shadow-sm transition"
                >
                  <Check className="w-4 h-4" /> Approve & Make Active
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(approveCampaign)}
        title="Approve Campaign"
        message={`Are you sure you want to approve "${approveCampaign?.title}"? It will immediately become ACTIVE and eligible to receive public contributions.`}
        confirmLabel="Approve Campaign"
        isLoading={isApproving}
        onConfirm={handleApproveConfirm}
        onCancel={() => setApproveCampaign(null)}
      />

      {/* Reject Modal with Mandatory Reason */}
      {rejectCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cloud-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-cloud-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-cloud-900">
                  Reject Campaign Submission
                </h3>
                <p className="text-xs text-cloud-800/70 mt-0.5">
                  State the specific grounds for rejection. This reason will be stored in PostgreSQL and delivered to the creator.
                </p>
              </div>
              <button
                onClick={() => setRejectCampaign(null)}
                className="text-cloud-400 hover:text-cloud-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 bg-softpink-50 border border-softpink-200 rounded-xl flex items-center gap-2 text-xs text-softpink-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cloud-900 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. The prototype lacks sufficient technical documentation, or the requested capital does not break down component manufacturing costs."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-softpink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectCampaign(null)}
                  disabled={isRejecting}
                  className="px-4 py-2 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2 text-xs font-bold text-white bg-softpink-600 hover:bg-softpink-700 disabled:opacity-50 rounded-xl shadow-sm transition"
                >
                  {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
