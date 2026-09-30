import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { reportsApi } from '../../api/reports';
import { ReportOverviewData } from '../../types';
import { ChartCard } from '../../components/ChartCard';
import { LoadingState } from '../../components/LoadingState';

const CATEGORY_COLORS = ['#0EA5E9', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#6366F1'];
const STATUS_COLORS = ['#10B981', '#EF4444', '#0EA5E9', '#F59E0B'];

export const AdminReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await reportsApi.getOverview();
        setReportData(data);
      } catch (e) {
        console.error('Failed to load reports overview:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (isLoading) {
    return <LoadingState message="Aggregating platform database reports..." className="py-24" />;
  }

  const overview = reportData?.overview;
  const categoryDistribution = reportData?.categoryDistribution || [];
  const contributionTrends = reportData?.contributionTrends || [];
  const campaignTrends = reportData?.campaignTrends || [];

  // Data for Successful vs Failed chart
  const outcomeData = [
    { name: 'Successful', count: overview?.successfulCampaigns || 0 },
    { name: 'Failed', count: overview?.failedCampaigns || 0 },
    { name: 'Active', count: overview?.activeCampaigns || 0 },
    { name: 'Pending Review', count: overview?.pendingCampaigns || 0 },
  ].filter((d) => d.count > 0);

  const hasOutcomeData = outcomeData.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">Platform Analytics & Reports</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          Dynamic graphical reports generated strictly from actual PostgreSQL transaction and campaign records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Capital Trends */}
        <ChartCard
          title="Contribution Capital Trends"
          subtitle="Real daily contribution volume in ₹"
          hasData={contributionTrends.length > 0}
          emptyMessage="Not enough data to generate this report. No contributions recorded yet."
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={contributionTrends}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0EA5E9"
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution by Capital Raised */}
        <ChartCard
          title="Funds Raised by Category"
          subtitle="Dynamic breakdown by funding domain"
          hasData={categoryDistribution.length > 0}
          emptyMessage="Not enough data to generate this report. No categories have raised funds yet."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryDistribution}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Raised']}
              />
              <Bar dataKey="totalRaised" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Campaign Lifecycle Outcomes (Successful vs Failed vs Active) */}
        <ChartCard
          title="Campaign Lifecycle Status Distribution"
          subtitle="Real proportion of campaigns across states"
          hasData={hasOutcomeData}
          emptyMessage="Not enough data to generate this report. No campaigns exist in database."
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={outcomeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="count"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {outcomeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Campaign Creation Trends */}
        <ChartCard
          title="Campaign Creation Velocity"
          subtitle="Daily project launches submitted"
          hasData={campaignTrends.length > 0}
          emptyMessage="Not enough data to generate this report. No campaign timelines recorded."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignTrends}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="created" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Summary Audit Ledger Metric Box */}
      <div className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cloud-800/70 mb-4">
          Financial & Refund Summary Audit
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-cloud-800/60 block">Average Contribution</span>
            <span className="text-lg font-black text-cloud-900 mt-0.5 block">
              ₹{(overview?.averageContribution || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-cloud-800/60 block">Total Gross Raised</span>
            <span className="text-lg font-black text-mint-600 mt-0.5 block">
              ₹{(overview?.totalFundsRaised || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-cloud-800/60 block">Total Refunds Disbursed</span>
            <span className="text-lg font-black text-softpink-600 mt-0.5 block">
              ₹{(overview?.totalRefundAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-cloud-800/60 block">Refund Transactions</span>
            <span className="text-lg font-black text-cloud-900 mt-0.5 block">
              {overview?.totalRefunds || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
