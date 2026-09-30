import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Layers,
  TrendingUp,
  Award,
  AlertOctagon,
  CreditCard,
  RefreshCw,
  Clock,
  Play,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { AdminStats } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingState } from '../../components/LoadingState';

export const AdminOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingDeadlines, setIsCheckingDeadlines] = useState<boolean>(false);
  const [deadlineResult, setDeadlineResult] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRunDeadlineCheck = async () => {
    try {
      setIsCheckingDeadlines(true);
      setDeadlineResult(null);
      const res = await adminApi.triggerDeadlineCheck();
      setDeadlineResult(`Deadline scan completed: ${res.processed} campaign(s) processed.`);
      fetchStats();
      setTimeout(() => setDeadlineResult(null), 4000);
    } catch (e: any) {
      alert(e.message || 'Deadline check failed');
    } finally {
      setIsCheckingDeadlines(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Fetching live administrative statistics..." className="py-24" />;
  }

  return (
    <div className="space-y-8">
      {/* Header and Manual Job Runner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft">
        <div>
          <h2 className="text-xl font-bold text-cloud-900">System Overview</h2>
          <p className="text-xs text-cloud-800/70 mt-0.5">
            Real-time platform metrics dynamically aggregated from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDeadlineCheck}
            disabled={isCheckingDeadlines}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 disabled:opacity-50 rounded-xl shadow-sm transition"
            title="Runs the campaign deadline scan & automated refund job immediately"
          >
            <Clock className="w-4 h-4" />
            {isCheckingDeadlines ? 'Processing Deadlines...' : 'Run Deadline Check'}
          </button>
        </div>
      </div>

      {deadlineResult && (
        <div className="p-4 bg-mint-50 border border-mint-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-mint-800 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-mint-600 shrink-0" />
          <span>{deadlineResult}</span>
        </div>
      )}

      {/* 8 Dynamic Administrative Metric Cards (Prompt #25) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          subtitle="Registered accounts"
          icon={Users}
          variant="ice"
        />

        <StatCard
          title="Total Campaigns"
          value={stats?.totalCampaigns ?? 0}
          subtitle={`${stats?.pendingCampaigns ?? 0} pending review`}
          icon={Layers}
          variant="lavender"
        />

        <StatCard
          title="Active Campaigns"
          value={stats?.activeCampaigns ?? 0}
          subtitle="Currently raising funds"
          icon={TrendingUp}
          variant="mint"
        />

        <StatCard
          title="Successful Campaigns"
          value={stats?.successfulCampaigns ?? 0}
          subtitle="Achieved target goal"
          icon={Award}
          variant="peach"
        />

        <StatCard
          title="Failed Campaigns"
          value={stats?.failedCampaigns ?? 0}
          subtitle="Goal unmet at deadline"
          icon={AlertOctagon}
          variant="softpink"
        />

        <StatCard
          title="Total Contributions"
          value={stats?.totalContributions ?? 0}
          subtitle={`Avg ₹${(stats?.averageContribution ?? 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          variant="ice"
        />

        <StatCard
          title="Total Funds Raised"
          value={`₹${(stats?.totalFundsRaised ?? 0).toLocaleString('en-IN')}`}
          subtitle="Gross successful capital"
          icon={TrendingUp}
          variant="mint"
        />

        <StatCard
          title="Total Refunds Issued"
          value={stats?.totalRefunds ?? 0}
          subtitle={`₹${(stats?.totalRefundAmount ?? 0).toLocaleString('en-IN')} returned`}
          icon={RefreshCw}
          variant="softpink"
        />
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/review"
          className="p-5 bg-peach-50/60 border border-peach-200 rounded-3xl hover:bg-peach-100/60 transition space-y-1"
        >
          <span className="text-[11px] font-bold text-peach-700 uppercase">Action Needed</span>
          <h4 className="text-sm font-bold text-cloud-900">
            Review Pending Campaigns ({stats?.pendingCampaigns ?? 0})
          </h4>
          <p className="text-xs text-cloud-800/70">
            Approve or reject newly submitted campaign requests.
          </p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 bg-lavender-50/60 border border-lavender-200 rounded-3xl hover:bg-lavender-100/60 transition space-y-1"
        >
          <span className="text-[11px] font-bold text-lavender-700 uppercase">Analytics</span>
          <h4 className="text-sm font-bold text-cloud-900">Platform Reports & Trends</h4>
          <p className="text-xs text-cloud-800/70">
            View charts on category distribution and contribution trends.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 bg-ice-50/60 border border-ice-200 rounded-3xl hover:bg-ice-100/60 transition space-y-1"
        >
          <span className="text-[11px] font-bold text-ice-700 uppercase">Taxonomy</span>
          <h4 className="text-sm font-bold text-cloud-900">Manage Categories</h4>
          <p className="text-xs text-cloud-800/70">
            Create, edit, and toggle active campaign sectors.
          </p>
        </Link>
      </div>
    </div>
  );
};
