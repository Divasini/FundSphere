import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Layers,
  Award,
  TrendingUp,
  ArrowRight,
  Clock,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { reportsApi } from '../../api/reports';
import { UserDashboardStats } from '../../types';
import { StatCard } from '../../components/StatCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await reportsApi.getUserDashboardStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch dashboard stats:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingState message="Calculating your personalized dashboard metrics..." className="py-24" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-ice-500 to-mint-500 rounded-3xl text-white shadow-soft-lg space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
          Live User Overview
        </span>
        <h2 className="text-2xl sm:text-3xl font-black">
          Welcome, {user?.name}!
        </h2>
        <p className="text-xs text-white/90 max-w-xl leading-relaxed">
          Here is your live crowdfunding activity summary computed directly from your contribution records and created campaigns.
        </p>
      </div>

      {/* 4 Dynamic Calculated Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contributed"
          value={`₹${(stats?.totalContributed || 0).toLocaleString('en-IN')}`}
          subtitle={`${stats?.totalContributionsCount || 0} total donations`}
          icon={CreditCard}
          variant="ice"
        />

        <StatCard
          title="Active Contributions"
          value={stats?.activeContributionsCount || 0}
          subtitle="Campaigns currently running"
          icon={TrendingUp}
          variant="mint"
        />

        <StatCard
          title="Campaigns Created"
          value={stats?.campaignsCreatedCount || 0}
          subtitle="Your initiated projects"
          icon={Layers}
          variant="lavender"
        />

        <StatCard
          title="Successful Campaigns"
          value={stats?.successfulCampaignsCount || 0}
          subtitle="Reached target goal"
          icon={Award}
          variant="peach"
        />
      </div>

      {/* Recent Contributions Section */}
      <div className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
          <h3 className="text-sm font-bold text-cloud-900">Recent Contributions</h3>
          <Link
            to="/dashboard/contributions"
            className="text-xs font-semibold text-ice-600 hover:text-ice-700 flex items-center gap-1"
          >
            View all history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentContributions && stats.recentContributions.length > 0 ? (
          <div className="divide-y divide-cloud-100 text-xs">
            {stats.recentContributions.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link
                    to={`/campaigns/${c.campaign?.id}`}
                    className="font-bold text-cloud-900 hover:text-ice-600 line-clamp-1"
                  >
                    {c.campaign?.title}
                  </Link>
                  <span className="text-[11px] text-cloud-800/60 block mt-0.5">
                    Ref: {c.transactionReference} • {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-cloud-900 block">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      c.paymentStatus === 'SUCCESS'
                        ? 'bg-mint-100 text-mint-700'
                        : c.paymentStatus === 'REFUNDED'
                        ? 'bg-softpink-100 text-softpink-700'
                        : 'bg-cloud-100 text-cloud-700'
                    }`}
                  >
                    {c.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No contributions yet."
            description="Explore active campaigns and back the innovations that matter to you."
            actionLabel="Discover Campaigns"
            actionHref="/discover"
            className="py-10 border-0 shadow-none"
          />
        )}
      </div>

      {/* User's Created Campaigns Section */}
      <div className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
          <h3 className="text-sm font-bold text-cloud-900">Your Created Campaigns</h3>
          <Link
            to="/dashboard/campaigns"
            className="text-xs font-semibold text-ice-600 hover:text-ice-700 flex items-center gap-1"
          >
            Manage campaigns <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.myCampaigns && stats.myCampaigns.length > 0 ? (
          <div className="divide-y divide-cloud-100 text-xs">
            {stats.myCampaigns.map((camp) => (
              <div key={camp.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="font-bold text-cloud-900 hover:text-ice-600 line-clamp-1"
                  >
                    {camp.title}
                  </Link>
                  <span className="text-[11px] text-cloud-800/60 block mt-0.5">
                    Goal: ₹{camp.fundingGoal.toLocaleString('en-IN')} • Raised: ₹{camp.amountRaised.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                      camp.status === 'ACTIVE'
                        ? 'bg-mint-100 text-mint-700'
                        : camp.status === 'PENDING_REVIEW'
                        ? 'bg-peach-100 text-peach-700'
                        : 'bg-cloud-100 text-cloud-700'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No campaigns created yet."
            description="Have a great idea or research project? Start raising funds from supporters today."
            actionLabel="Start a Campaign"
            actionHref="/campaigns/create"
            className="py-10 border-0 shadow-none"
          />
        )}
      </div>
    </div>
  );
};
